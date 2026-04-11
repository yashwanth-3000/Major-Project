"""FastAPI server for the PneumoAI chat interface.

Run with:
    python -m gen_ai --serve
    # or directly:
    uvicorn gen_ai.api:app --reload --port 8000
"""

from __future__ import annotations

import asyncio
import base64
import os

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .config import DEFAULT_MODEL, load_local_env

try:
    from .ml_model import TORCH_AVAILABLE
except Exception:
    TORCH_AVAILABLE = False

# Load .env on import so keys are available
load_local_env()

# ------------------------------------------------------------------
# App
# ------------------------------------------------------------------

app = FastAPI(
    title="PneumoAI API",
    description=(
        "AI-powered pneumonia detection and health assistant API. "
        "Routes queries to a Report Analysis crew or a General Health crew "
        "via CrewAI Flows."
    ),
    version="1.0.0",
)

# Build allowed origins from env + defaults
_extra_origins = os.getenv("ALLOWED_ORIGINS", "")
_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if _extra_origins == "*":
    _origins = ["*"]
elif _extra_origins:
    _origins.extend([o.strip() for o in _extra_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=_extra_origins != "*",
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------
# Schemas
# ------------------------------------------------------------------

class HistoryItem(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message content")


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User message or pasted report.")
    mode: str = Field(
        default="",
        description=(
            "Workflow mode: 'report' for X-ray / report analysis, "
            "'general' for health questions, '' for auto-detect."
        ),
    )
    history: list[HistoryItem] = Field(
        default_factory=list,
        description="Previous messages in this chat session for context.",
    )


class ChatResponse(BaseModel):
    response: str
    mode: str


# ------------------------------------------------------------------
# Endpoints
# ------------------------------------------------------------------

def _build_contextual_query(message: str, history: list[HistoryItem]) -> str:
    """Prepend conversation history to the current message so agents have context."""
    if not history:
        return message

    recent = history[-10:]
    lines = ["CONVERSATION HISTORY (for context):"]
    for item in recent:
        prefix = "User" if item.role == "user" else "Assistant"
        lines.append(f"{prefix}: {item.content[:500]}")
    lines.append("")
    lines.append(f"CURRENT MESSAGE:\n{message}")
    return "\n".join(lines)


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process a chat message through the PneumoAI workflow."""
    try:
        from .flow import run_flow_async

        query = _build_contextual_query(request.message, request.history)
        model_name = os.getenv("OPENAI_MODEL", DEFAULT_MODEL)
        result = await run_flow_async(
            query=query,
            mode=request.mode,
            model_name=model_name,
        )

        return ChatResponse(
            response=result,
            mode=request.mode or "auto",
        )

    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred: {exc}",
        )


class XrayResponse(BaseModel):
    ml_classification: str | None = None
    ml_hotspot_regions: dict | None = None
    ml_hotspot_description: str | None = None
    vision_analysis: str | None = None
    combined_analysis: str
    heatmap_image: str | None = None


@app.post("/analyze-xray", response_model=XrayResponse)
async def analyze_xray(file: UploadFile = File(...)):
    """Analyze a chest X-ray using ML model + AI Vision in parallel."""
    try:
        image_bytes = await file.read()
        image_b64 = base64.b64encode(image_bytes).decode()

        from .vision_api import analyze_xray_with_vision

        ml_result: dict | None = None
        vision_result: dict | None = None

        if TORCH_AVAILABLE:
            from .ml_model import run_inference

            loop = asyncio.get_event_loop()
            ml_coro = loop.run_in_executor(None, run_inference, image_bytes)
            vision_coro = analyze_xray_with_vision(image_b64)
            ml_result, vision_result = await asyncio.gather(ml_coro, vision_coro)
        else:
            vision_result = await analyze_xray_with_vision(image_b64)

        parts: list[str] = ["DUAL ANALYSIS RESULTS FOR CHEST X-RAY:", ""]

        vision_text = vision_result["analysis"] if vision_result else ""
        ml_class = ml_result["classification"] if ml_result else None

        if vision_result:
            parts.append("=== AI VISION ANALYSIS (GPT-4o) — PRIMARY SOURCE (65-70% weight) ===")
            parts.append(vision_text)
            parts.append("")

        if ml_result:
            parts.append("=== ML MODEL ANALYSIS (ResNet-152 + Grad-CAM) — SUPPORTING (30-35% weight) ===")
            parts.append(f"Classification: {ml_class}")
            parts.append(ml_result["hotspot_description"])
            parts.append("Regional activation breakdown:")
            for region, pct in ml_result["hotspot_regions"].items():
                parts.append(f"  - {region}: {pct}%")
            parts.append("")

        vision_says_normal = vision_text and any(
            phrase in vision_text.lower()
            for phrase in [
                "no significant abnormalities",
                "lungs appear clear",
                "normal lung",
                "no consolidation",
                "no opacity",
                "clear lung fields",
                "no acute",
                "unremarkable",
                "within normal limits",
                "severity: normal",
                "severity assessment: normal",
            ]
        )

        if vision_says_normal and ml_class == "NORMAL":
            parts.append(
                "IMPORTANT: Both the AI Vision analysis AND the ML model indicate "
                "this X-ray appears NORMAL with no significant findings. "
                "Your response MUST clearly state that the lungs appear normal "
                "and healthy. Do NOT fabricate or suggest any abnormalities. "
                "Provide reassurance while still recommending routine check-ups. "
                "NEVER include any numerical confidence scores or percentages."
            )
        elif vision_says_normal and ml_class == "PNEUMONIA":
            parts.append(
                "IMPORTANT: The AI Vision analysis (PRIMARY source, 65-70% weight) "
                "indicates this X-ray appears NORMAL, but the ML model flagged it "
                "as PNEUMONIA. Since the Vision AI is the primary and more reliable "
                "source, TRUST THE VISION ANALYSIS. The ML model can produce "
                "false positives. Your response should indicate the X-ray appears "
                "largely normal, note the minor ML flag as something to discuss "
                "with a doctor if concerned, but do NOT alarm the patient. "
                "NEVER include any numerical confidence scores or percentages."
            )
        else:
            parts.append(
                "Synthesize BOTH analyses with Vision AI as the primary source. "
                "If the Vision AI says the X-ray is normal, TRUST THAT — even if "
                "the ML model disagrees. Only report genuine abnormalities that "
                "the Vision AI has identified. "
                "Identify final hotspot regions, where they agree/disagree, "
                "blind spots, overall severity, and a patient-friendly explanation. "
                "NEVER include any numerical confidence scores or percentages in the output."
            )

        combined_query = "\n".join(parts)

        from .flow import run_flow_async

        model_name = os.getenv("OPENAI_MODEL", DEFAULT_MODEL)
        crew_output = await run_flow_async(
            query=combined_query, mode="report", model_name=model_name
        )

        return XrayResponse(
            ml_classification=ml_result["classification"] if ml_result else None,
            ml_hotspot_regions=ml_result["hotspot_regions"] if ml_result else None,
            ml_hotspot_description=ml_result["hotspot_description"] if ml_result else None,
            vision_analysis=(vision_result["analysis"][:600] if vision_result else None),
            combined_analysis=crew_output,
            heatmap_image=ml_result["heatmap_base64"] if ml_result else None,
        )

    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"X-ray analysis failed: {exc}")


@app.get("/health")
async def health_check():
    """Liveness probe."""
    return {
        "status": "healthy",
        "service": "PneumoAI API",
        "openai_key_set": bool(os.getenv("OPENAI_API_KEY")),
        "ml_model_available": TORCH_AVAILABLE,
    }

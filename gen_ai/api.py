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

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User message or pasted report.")
    mode: str = Field(
        default="",
        description=(
            "Workflow mode: 'report' for X-ray / report analysis, "
            "'general' for health questions, '' for auto-detect."
        ),
    )


class ChatResponse(BaseModel):
    response: str
    mode: str


# ------------------------------------------------------------------
# Endpoints
# ------------------------------------------------------------------

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process a chat message through the PneumoAI workflow."""
    try:
        from .flow import run_flow_async

        model_name = os.getenv("OPENAI_MODEL", DEFAULT_MODEL)
        result = await run_flow_async(
            query=request.message,
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
    ml_confidence: float | None = None
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

        # Build the combined query for CrewAI synthesis
        parts: list[str] = ["DUAL ANALYSIS RESULTS FOR CHEST X-RAY:", ""]

        if ml_result:
            parts.append("=== ML MODEL ANALYSIS (ResNet-152 + Grad-CAM) ===")
            parts.append(f"Classification: {ml_result['classification']}")
            parts.append(f"Confidence: {ml_result['confidence']}%")
            parts.append(ml_result["hotspot_description"])
            parts.append("Regional activation breakdown:")
            for region, pct in ml_result["hotspot_regions"].items():
                parts.append(f"  - {region}: {pct}%")
            parts.append("")

        if vision_result:
            parts.append("=== AI VISION ANALYSIS (GPT-4o) ===")
            parts.append(vision_result["analysis"])
            parts.append("")

        parts.append(
            "Synthesize BOTH analyses: identify final hotspot regions, "
            "where they agree/disagree, blind spots one caught but the "
            "other missed, overall severity, and a patient-friendly explanation."
        )

        combined_query = "\n".join(parts)

        from .flow import run_flow_async

        model_name = os.getenv("OPENAI_MODEL", DEFAULT_MODEL)
        crew_output = await run_flow_async(
            query=combined_query, mode="report", model_name=model_name
        )

        return XrayResponse(
            ml_classification=ml_result["classification"] if ml_result else None,
            ml_confidence=ml_result["confidence"] if ml_result else None,
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

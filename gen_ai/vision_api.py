"""OpenAI o3 Vision wrapper for chest X-ray radiological analysis.

Uses the o3 reasoning model which integrates images directly into its
chain of thought for deeper, more accurate medical image understanding.
"""

from __future__ import annotations

import os

from openai import AsyncOpenAI

_VISION_MODEL = os.getenv("VISION_MODEL", "o3")

_SYSTEM = (
    "You are an expert radiologist AI assistant. Your duty is diagnostic "
    "ACCURACY — both detecting real disease AND correctly identifying healthy "
    "lungs. Do NOT over-interpret or fabricate findings, but also do NOT "
    "dismiss genuine abnormalities.\n\n"
    "Analyze the chest X-ray and provide a structured radiological assessment:\n"
    "1. Overall lung field assessment (clarity, symmetry, volume)\n"
    "2. Specific abnormalities IF genuinely present (opacities, "
    "consolidations, effusions, nodules). If the lungs appear clear, "
    "state: 'No significant abnormalities detected.'\n"
    "3. Affected lung regions (right/left, upper/middle/lower lobe) — "
    "only if abnormalities are present\n"
    "4. Potential blind spots — subtle findings automated ML models often miss\n"
    "5. Severity assessment (normal / mild / moderate / severe)\n\n"
    "RULES:\n"
    "- Be honest: if the X-ray is normal, say so. If it shows disease, "
    "describe it clearly.\n"
    "- Do NOT fabricate findings. Imaging artifacts and normal variants are "
    "NOT abnormalities.\n"
    "- Be concise and clinical. Use bullet points.\n\n"
    "MANDATORY: End your response with exactly one of these lines:\n"
    "VERDICT: NORMAL\n"
    "VERDICT: ABNORMAL\n"
    "This verdict must reflect your overall assessment."
)


async def analyze_xray_with_vision(image_base64: str) -> dict:
    """Send a chest X-ray to the o3 reasoning model for radiological analysis.

    o3 integrates images directly into its chain of thought, producing
    deeper and more accurate analysis than standard vision models.

    Returns ``{"analysis": str}``.
    """
    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    resp = await client.chat.completions.create(
        model=_VISION_MODEL,
        messages=[
            {"role": "developer", "content": _SYSTEM},
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "Analyze this chest X-ray accurately. Report what "
                            "you genuinely see — abnormalities if present, or "
                            "normal findings if the lungs are clear. Do not "
                            "exaggerate or fabricate, but do not dismiss real "
                            "findings either. End with VERDICT: NORMAL or "
                            "VERDICT: ABNORMAL."
                        ),
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{image_base64}",
                            "detail": "high",
                        },
                    },
                ],
            },
        ],
        max_completion_tokens=2000,
    )

    return {"analysis": resp.choices[0].message.content}

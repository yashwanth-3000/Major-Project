"""OpenAI GPT-4o Vision wrapper for chest X-ray radiological analysis."""

from __future__ import annotations

import os

from openai import AsyncOpenAI

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
    """Send a chest X-ray to GPT-4o Vision and return radiological analysis.

    Returns ``{"analysis": str}``.
    """
    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    resp = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": _SYSTEM},
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
        max_tokens=800,
        temperature=0.3,
    )

    return {"analysis": resp.choices[0].message.content}

"""OpenAI GPT-4o Vision wrapper for chest X-ray radiological analysis."""

from __future__ import annotations

import os

from openai import AsyncOpenAI

_SYSTEM = (
    "You are an expert radiologist AI assistant. Your PRIMARY duty is diagnostic "
    "ACCURACY — correctly identifying NORMAL lungs is just as important as "
    "detecting disease. Do NOT over-interpret or invent findings.\n\n"
    "Analyze the chest X-ray and provide a structured radiological assessment:\n"
    "1. Overall lung field assessment (clarity, symmetry, volume)\n"
    "2. Specific abnormalities ONLY IF genuinely present (opacities, "
    "consolidations, effusions, nodules). If the lungs appear clear, "
    "explicitly state: 'No significant abnormalities detected.'\n"
    "3. Affected lung regions (right/left, upper/middle/lower lobe) — "
    "ONLY if abnormalities are actually present\n"
    "4. Potential blind spots — subtle findings automated ML models often miss\n"
    "5. Severity assessment (normal / mild / moderate / severe)\n\n"
    "CRITICAL RULES:\n"
    "- If the X-ray shows clear lung fields with no consolidation, opacity, or "
    "effusion, you MUST classify severity as 'normal' and say so clearly.\n"
    "- Do NOT fabricate or exaggerate findings. Minor imaging artifacts, "
    "patient positioning variations, or normal anatomical variants are NOT "
    "abnormalities.\n"
    "- It is perfectly valid and expected that many X-rays will be NORMAL.\n"
    "- Be concise and clinical. Use bullet points for findings."
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
                            "Analyze this chest X-ray honestly and accurately. "
                            "If the lungs appear normal and clear, say so — do "
                            "NOT invent or exaggerate findings. Only report "
                            "genuine abnormalities you can clearly identify. "
                            "State the severity as normal/mild/moderate/severe."
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

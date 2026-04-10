"""OpenAI GPT-4o Vision wrapper for chest X-ray radiological analysis."""

from __future__ import annotations

import os

from openai import AsyncOpenAI

_SYSTEM = (
    "You are an expert radiologist AI assistant. Analyze the chest X-ray and "
    "provide a structured radiological assessment covering:\n"
    "1. Overall lung field assessment (clarity, symmetry, volume)\n"
    "2. Specific abnormalities (opacities, consolidations, effusions, nodules)\n"
    "3. Affected lung regions (right/left, upper/middle/lower lobe)\n"
    "4. Potential blind spots — subtle findings automated ML models often miss\n"
    "5. Severity assessment (normal / mild / moderate / severe)\n\n"
    "Be concise and clinical. Use bullet points for findings."
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
                            "Analyze this chest X-ray. Identify all abnormalities, "
                            "affected regions, and blind spots an ML model might miss."
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

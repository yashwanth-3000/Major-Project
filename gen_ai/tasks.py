"""Lightweight PneumoAI tasks – concise prompts for fast execution."""

from __future__ import annotations

from textwrap import dedent


# ===================================================================
# REPORT WORKFLOW TASKS (2 tasks)
# ===================================================================

def make_report_analysis_task(Task, agent):
    """Analyze the pneumonia detection query/report."""
    return Task(
        description=dedent("""
            Analyze this pneumonia detection query:

            {query}

            IMPORTANT: If the query is NOT related to health, medicine,
            pneumonia, X-rays, or medical reports, do NOT answer it.
            Instead respond ONLY with:
            "I'm PneumoAI, a health-focused assistant. I can only help
            with health-related questions, pneumonia detection, and
            medical report analysis. Please ask me something
            health-related!"

            If it IS health/medical related, briefly cover:
            - Classification result and confidence interpretation
            - Grad-CAM hotspot meaning (which lung regions, significance)
            - Reliability assessment
            - Key limitations of AI detection

            Keep your analysis concise (under 200 words).
        """).strip(),
        expected_output=(
            "A concise analysis of the detection results covering "
            "classification, hotspots, reliability, and limitations — "
            "OR a polite redirect if the query is not health-related."
        ),
        agent=agent,
    )


def make_report_compose_task(Task, agent, analysis_task):
    """Write the patient-friendly report."""
    return Task(
        description=dedent("""
            FIRST CHECK: If the previous agent's output is a redirect
            message (saying the query is not health-related), pass it
            through exactly as-is. Do NOT add medical content.
            Just return the redirect message unchanged.

            OTHERWISE, write a brief patient-friendly explanation:
            - **Summary**: What was detected and confidence level
            - **What the Hotspots Show**: Plain-language hotspot explanation
            - **Reliability**: How trustworthy the AI result is
            - **Next Steps**: What the patient should do
            - **Disclaimer**: AI is not a substitute for professional diagnosis

            Total response under 300 words. Be empathetic and clear.
        """).strip(),
        expected_output=(
            "A brief, patient-friendly report — or the redirect "
            "message passed through unchanged."
        ),
        agent=agent,
        context=[analysis_task],
    )


# ===================================================================
# GENERAL HEALTH WORKFLOW TASKS (2 tasks)
# ===================================================================

def make_health_advice_task(Task, agent):
    """Draft a health answer based on the query."""
    return Task(
        description=dedent("""
            Answer this health question concisely:

            {query}

            IMPORTANT: If the query is NOT related to health, medicine,
            wellness, symptoms, fitness, nutrition, or medical topics,
            do NOT answer it. Instead respond ONLY with:
            "I'm PneumoAI, a health-focused assistant. I can only help
            with health-related questions such as symptoms, wellness,
            prevention, and medical topics. Please ask me something
            health-related!"

            If it IS health-related, provide:
            - A direct answer to the question
            - Key facts (2-3 bullet points)
            - Warning signs to watch for (if relevant)

            Keep it under 200 words. Use your medical knowledge.
        """).strip(),
        expected_output=(
            "A concise health answer with key facts and warning signs — "
            "OR a polite redirect if the query is not health-related."
        ),
        agent=agent,
    )


def make_health_compose_task(Task, agent, advice_task):
    """Polish into a user-friendly response with disclaimers."""
    return Task(
        description=dedent("""
            FIRST CHECK: If the previous agent's output is a redirect
            message (saying the query is not health-related), pass it
            through exactly as-is. Do NOT add health advice or sections.
            Just return the redirect message unchanged.

            OTHERWISE, polish the health advice into a friendly response:
            - **Answer**: Clear, direct response
            - **Key Points**: 2-3 practical takeaways
            - **When to See a Doctor**: Brief guidance
            - **Disclaimer**: This is general info, not medical advice

            Total response under 250 words. Be warm and helpful.
        """).strip(),
        expected_output=(
            "A clear, friendly health response — or the redirect "
            "message passed through unchanged."
        ),
        agent=agent,
        context=[advice_task],
    )

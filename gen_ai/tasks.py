"""Lightweight PneumoAI tasks – concise prompts for fast execution."""

from __future__ import annotations

from textwrap import dedent


# ===================================================================
# REPORT WORKFLOW TASKS (2 tasks) – NO guardrail here, all queries
# routed to report mode are medical by definition.
# ===================================================================

def make_report_analysis_task(Task, agent):
    """Analyze the pneumonia detection query/report."""
    return Task(
        description=dedent("""
            You are analyzing a pneumonia detection query or medical report.
            The user is in REPORT MODE so treat every query as medical.

            User input:
            {query}

            The input may contain DUAL ANALYSIS RESULTS from:
            - AI Vision (GPT-4o): radiological findings, blind spots
            - ML Model (ResNet-152 + Grad-CAM): classification,
              per-region hotspot activation percentages

            IMPORTANT WEIGHTING:
            Give 65-70% weight to the AI Vision analysis and 30-35%
            weight to the ML model results. The Vision AI provides
            richer clinical insight and should be the primary source.
            The ML model serves as a supporting reference.

            CRITICAL — ACCURACY IN BOTH DIRECTIONS:
            - If the Vision AI says VERDICT: NORMAL, report it as normal.
              Do NOT fabricate findings that the Vision AI did not report.
            - If the Vision AI says VERDICT: ABNORMAL, report the
              abnormalities it described. Do NOT downplay or dismiss
              genuine findings.
            - When Vision and ML disagree, trust the Vision AI verdict
              but mention the disagreement briefly.
            - Be HONEST: normal means normal, abnormal means abnormal.

            NEVER mention or reveal any internal confidence scores,
            percentage numbers, or model probabilities. Do not expose
            any technical metrics to the patient.

            When GENUINE abnormalities are found in dual analysis:
            - Primary findings from Vision AI analysis
            - Supporting evidence from ML hotspot regions
            - Where Vision AI and ML model agree or disagree
            - Blind spots one caught but the other missed
            - Final hotspot assessment combining both sources
            - Overall severity rating (normal / mild / moderate / severe)

            For regular text queries, provide:
            - Clinical interpretation of findings
            - Grad-CAM hotspot meaning (which lung regions, significance)
            - Reliability assessment of the AI detection

            If the user just says hello, introduce yourself as PneumoAI's
            report analyst.

            Keep your analysis under 250 words.
        """).strip(),
        expected_output=(
            "An accurate medical analysis led by Vision AI findings, "
            "clearly stating NORMAL when appropriate, "
            "supported by ML hotspots, with no internal scores exposed."
        ),
        agent=agent,
    )


def make_report_compose_task(Task, agent, analysis_task):
    """Write the patient-friendly report."""
    return Task(
        description=dedent("""
            Turn the analysis into a patient-friendly explanation.

            FIRST — CHECK IF THE ANALYSIS SAYS NORMAL/HEALTHY:
            If the previous analysis indicates the X-ray is NORMAL with
            no significant findings, write a REASSURING report:
            - **Summary**: The X-ray appears normal, lungs look healthy
            - **Details**: Briefly note clear lung fields, no concerning
              areas detected by either AI system
            - **Next Steps**: Routine check-ups, maintain healthy habits
            - **Disclaimer**: AI analysis is not a substitute for a doctor

            Do NOT add scary language, unnecessary warnings about
            "potential" issues, or suggest problems that were not found.
            Healthy results deserve clear, positive communication.

            IF GENUINE ABNORMALITIES WERE FOUND:
            - **Summary**: What was detected and severity level
            - **Hotspot Regions**: Which lung areas are affected and why,
              noting where Vision AI and ML model agree
            - **Blind Spots**: Anything the Vision AI caught that the ML
              model missed (or vice versa)
            - **Reliability**: How trustworthy the combined result is
            - **Next Steps**: What the patient should do
            - **Disclaimer**: AI analysis is not a substitute for a doctor

            CRITICAL: Never include any numerical confidence scores,
            percentages, probability values, or internal model metrics.
            Use qualitative terms only (e.g., "strong indication",
            "mild signs", "moderate findings").

            Total response under 350 words. Be empathetic and clear.
        """).strip(),
        expected_output=(
            "A patient-friendly report — either reassuring for normal "
            "results or detailed for abnormal findings. "
            "No numerical confidence values anywhere."
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

            ONLY reject if the query is completely unrelated to health
            (e.g., "how to cook pasta", "football scores", "write code").
            For those, respond with:
            "I'm PneumoAI, a health-focused assistant. I can help with
            health questions, symptoms, wellness, and prevention.
            Please ask me something health-related!"

            For everything else (including greetings, vague questions,
            anything mentioning body/symptoms/wellness), provide:
            - A direct answer to the question
            - Key facts (2-3 bullet points)
            - Warning signs to watch for (if relevant)

            Keep it under 200 words.
        """).strip(),
        expected_output=(
            "A concise health answer with key facts and warning signs — "
            "OR a polite redirect if clearly non-health."
        ),
        agent=agent,
    )


def make_health_compose_task(Task, agent, advice_task):
    """Polish into a user-friendly response with disclaimers."""
    return Task(
        description=dedent("""
            FIRST CHECK: If the previous agent's output is a redirect
            message (saying the query is not health-related), pass it
            through exactly as-is. Do NOT add health advice.

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

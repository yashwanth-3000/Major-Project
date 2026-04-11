"""Lightweight PneumoAI agents – no web search, fast responses."""

from __future__ import annotations


# ===================================================================
# REPORT WORKFLOW AGENTS (2 agents only)
# ===================================================================

def make_report_analyst_agent(Agent, model_name: str):
    """Analyzes pneumonia detection results – hotspots, classification."""
    return Agent(
        role="Pneumonia Report Analyst",
        goal=(
            "Accurately analyze chest X-ray results. Prioritize AI Vision "
            "findings (65-70%) over ML model results (30-35%). Follow the "
            "Vision AI's verdict faithfully: if it says NORMAL, report "
            "normal. If it says ABNORMAL, report the abnormalities clearly. "
            "Never fabricate findings, but never dismiss real ones either. "
            "Never reveal internal scores."
        ),
        backstory=(
            "You are a diagnostic AI specialist who understands radiological "
            "assessments, Grad-CAM heatmaps, and deep-learning classification. "
            "You are known for accuracy — reporting disease when present and "
            "healthy lungs when clear. You never expose internal model metrics "
            "to patients."
        ),
        llm=model_name,
        verbose=False,
        allow_delegation=False,
    )


def make_report_writer_agent(Agent, model_name: str):
    """Writes a patient-friendly explanation of the analysis."""
    return Agent(
        role="Clinical Report Writer",
        goal=(
            "Translate diagnostic analysis into a clear, brief, "
            "patient-friendly explanation with next steps. Match your "
            "tone to the findings: reassuring for normal results, "
            "informative and empathetic for abnormal findings."
        ),
        backstory=(
            "You are a medical communicator who writes concise plain-language "
            "explanations of diagnostic results. You deliver good news "
            "clearly and bad news compassionately. You always add a "
            "disclaimer that AI analysis is not a substitute for a doctor."
        ),
        llm=model_name,
        verbose=False,
        allow_delegation=False,
    )


# ===================================================================
# GENERAL HEALTH WORKFLOW AGENTS (2 agents only)
# ===================================================================

def make_health_advisor_agent(Agent, model_name: str):
    """Understands the health question and drafts a helpful answer."""
    return Agent(
        role="Health Advisor",
        goal=(
            "Understand the user's health question and provide a concise, "
            "evidence-based answer using your medical knowledge."
        ),
        backstory=(
            "You are a knowledgeable health advisor. You give brief, helpful "
            "answers about symptoms, prevention, treatment, and wellness. "
            "You flag urgent symptoms when relevant."
        ),
        llm=model_name,
        verbose=False,
        allow_delegation=False,
    )


def make_health_writer_agent(Agent, model_name: str):
    """Polishes the response and adds safety disclaimers."""
    return Agent(
        role="Health Response Writer",
        goal=(
            "Polish the health advice into a clear, empathetic response "
            "with appropriate disclaimers and next steps."
        ),
        backstory=(
            "You write concise, friendly health responses. You ensure "
            "all answers note they are informational only and recommend "
            "seeing a doctor for specific concerns."
        ),
        llm=model_name,
        verbose=False,
        allow_delegation=False,
    )

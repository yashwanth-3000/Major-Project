"""Lightweight PneumoAI agents – no web search, fast responses."""

from __future__ import annotations


# ===================================================================
# REPORT WORKFLOW AGENTS (2 agents only)
# ===================================================================

def make_report_analyst_agent(Agent, model_name: str):
    """Analyzes pneumonia detection results – accuracy, hotspots, classification."""
    return Agent(
        role="Pneumonia Report Analyst",
        goal=(
            "Analyze pneumonia detection results including accuracy scores, "
            "Grad-CAM hotspots, and classification output. Be concise."
        ),
        backstory=(
            "You are a diagnostic AI specialist who understands deep-learning "
            "model outputs, Grad-CAM heatmaps, and confidence scores from "
            "ResNet-152 pipelines. You give brief, accurate analyses."
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
            "patient-friendly explanation with next steps."
        ),
        backstory=(
            "You are a medical communicator who writes concise plain-language "
            "explanations of diagnostic results. You always add a disclaimer "
            "that AI analysis is not a substitute for a doctor."
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

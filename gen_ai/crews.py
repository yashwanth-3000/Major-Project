"""Lightweight crew builders – 2 agents per workflow for fast responses."""

from __future__ import annotations

from typing import Any

from .config import load_crewai

from .agents import (
    make_report_analyst_agent,
    make_report_writer_agent,
    make_health_advisor_agent,
    make_health_writer_agent,
)
from .tasks import (
    make_report_analysis_task,
    make_report_compose_task,
    make_health_advice_task,
    make_health_compose_task,
)


def build_report_crew(model_name: str) -> Any:
    """Build the Report Analysis crew (2 agents, 2 tasks)."""
    Agent, Crew, Process, Task = load_crewai()

    analyst = make_report_analyst_agent(Agent, model_name)
    writer = make_report_writer_agent(Agent, model_name)

    analysis_task = make_report_analysis_task(Task, analyst)
    compose_task = make_report_compose_task(Task, writer, analysis_task)

    return Crew(
        agents=[analyst, writer],
        tasks=[analysis_task, compose_task],
        process=Process.sequential,
        verbose=False,
    )


def build_general_crew(model_name: str) -> Any:
    """Build the General Health crew (2 agents, 2 tasks)."""
    Agent, Crew, Process, Task = load_crewai()

    advisor = make_health_advisor_agent(Agent, model_name)
    writer = make_health_writer_agent(Agent, model_name)

    advice_task = make_health_advice_task(Task, advisor)
    compose_task = make_health_compose_task(Task, writer, advice_task)

    return Crew(
        agents=[advisor, writer],
        tasks=[advice_task, compose_task],
        process=Process.sequential,
        verbose=False,
    )

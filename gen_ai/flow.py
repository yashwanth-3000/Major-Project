"""PneumoAI Flow – routes queries to the correct workflow.

Uses CrewAI Flows with a ``@router`` to decide between:
  * **report_workflow**  – X-ray / pneumonia report analysis
  * **general_workflow** – everyday health questions

The frontend always sends the mode ("report" or "general") so no
auto-classification is needed.
"""

from __future__ import annotations

import os

# Disable CrewAI interactive trace prompt
os.environ.setdefault("CREWAI_TRACING_ENABLED", "false")

from .config import DEFAULT_MODEL, require_api_keys

try:
    from crewai.flow.flow import Flow, listen, router, start
    from pydantic import BaseModel

    _CREWAI_FLOW_AVAILABLE = True
except ImportError:
    _CREWAI_FLOW_AVAILABLE = False


# ------------------------------------------------------------------
# State & Flow class (only defined when crewai is installed)
# ------------------------------------------------------------------

if _CREWAI_FLOW_AVAILABLE:

    class PneumoAIState(BaseModel):
        """Shared state for the PneumoAI workflow."""

        query: str = ""
        mode: str = "general"  # "report" or "general" – set by frontend
        model_name: str = DEFAULT_MODEL
        result: str = ""

    class PneumoAIFlow(Flow[PneumoAIState]):
        """Main flow that routes between Report and General Health crews."""

        @start()
        def receive_query(self):
            """Entry point – the mode is already set by the frontend."""
            print(f"\n{'=' * 60}")
            print("PneumoAI Flow – started")
            print(f"  Query : {self.state.query[:120]}")
            print(f"  Mode  : {self.state.mode}")
            print(f"  Model : {self.state.model_name}")
            print(f"{'=' * 60}\n")

            # Default to general if mode is missing or invalid
            if self.state.mode not in ("report", "general"):
                self.state.mode = "general"

        @router(receive_query)
        def route_to_crew(self):
            """Route to the matching crew based on frontend mode."""
            if self.state.mode == "report":
                return "report_workflow"
            return "general_workflow"

        @listen("report_workflow")
        def run_report_crew(self):
            """Execute the Report Analysis crew."""
            from .crews import build_report_crew

            print("[REPORT WORKFLOW] Running report analysis crew …")
            crew = build_report_crew(model_name=self.state.model_name)
            result = crew.kickoff(inputs={"query": self.state.query})
            self.state.result = str(result)
            return self.state.result

        @listen("general_workflow")
        def run_general_crew(self):
            """Execute the General Health crew."""
            from .crews import build_general_crew

            print("[GENERAL WORKFLOW] Running general health crew …")
            crew = build_general_crew(model_name=self.state.model_name)
            result = crew.kickoff(inputs={"query": self.state.query})
            self.state.result = str(result)
            return self.state.result


# ------------------------------------------------------------------
# Public helper
# ------------------------------------------------------------------

async def run_flow_async(
    query: str,
    mode: str = "general",
    model_name: str = DEFAULT_MODEL,
) -> str:
    """Run the PneumoAI flow asynchronously (for FastAPI).

    Parameters
    ----------
    query : str
        The user's message or pasted report text.
    mode : str
        ``"report"`` or ``"general"`` – sent by the frontend.
    model_name : str
        LLM model identifier for CrewAI agents.
    """
    if not _CREWAI_FLOW_AVAILABLE:
        raise RuntimeError(
            "Missing dependency 'crewai'. "
            "Run: pip install -r gen_ai/requirements.txt"
        )

    require_api_keys()

    flow = PneumoAIFlow()
    result = await flow.kickoff_async(
        inputs={
            "query": query,
            "mode": mode,
            "model_name": model_name,
        }
    )
    return str(result)


def run_flow(
    query: str,
    mode: str = "general",
    model_name: str = DEFAULT_MODEL,
) -> str:
    """Run the PneumoAI flow synchronously (for CLI)."""
    import asyncio

    if not _CREWAI_FLOW_AVAILABLE:
        raise RuntimeError(
            "Missing dependency 'crewai'. "
            "Run: pip install -r gen_ai/requirements.txt"
        )

    require_api_keys()

    return asyncio.run(
        run_flow_async(query=query, mode=mode, model_name=model_name)
    )

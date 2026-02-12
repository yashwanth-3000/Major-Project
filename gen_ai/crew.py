"""Backward-compatible entry point – delegates to :mod:`gen_ai.flow`.

The public helpers ``run_once`` and ``interactive_loop`` are kept so
existing callers (CLI, ``__init__``) continue to work.
"""

from __future__ import annotations

from .config import DEFAULT_MODEL
from .flow import run_flow


def run_once(
    question: str,
    model_name: str = DEFAULT_MODEL,
    mode: str = "",
) -> str:
    """Run a single query through the PneumoAI workflow.

    Parameters
    ----------
    question : str
        The user's query.
    model_name : str
        LLM model to use (default ``openai/gpt-4o-mini``).
    mode : str
        ``"report"`` | ``"general"`` | ``""`` (auto-detect).

    Returns
    -------
    str
        The AI-generated response.
    """
    return run_flow(query=question, mode=mode, model_name=model_name)


def interactive_loop(model_name: str = DEFAULT_MODEL) -> None:
    """Interactive Q&A loop in the terminal."""
    print("\nPneumoAI is ready.")
    print("Ask health questions or paste report findings.")
    print(
        "Commands:  'report' / 'general' / 'auto'  to switch mode,  "
        "'exit' to quit."
    )
    print(f"Model : {model_name}")
    print(f"Mode  : auto-detect\n")

    current_mode = ""

    while True:
        try:
            question = input("Question> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nExiting.")
            return

        if not question:
            continue

        # Mode-switching commands
        low = question.lower()
        if low in {"exit", "quit"}:
            print("Exiting.")
            return
        if low == "report":
            current_mode = "report"
            print("  → Switched to Report mode.\n")
            continue
        if low == "general":
            current_mode = "general"
            print("  → Switched to General Health mode.\n")
            continue
        if low == "auto":
            current_mode = ""
            print("  → Switched to Auto-detect mode.\n")
            continue

        try:
            answer = run_once(
                question=question,
                model_name=model_name,
                mode=current_mode,
            )
            print("\n" + "=" * 80)
            print(answer)
            print("=" * 80 + "\n")
        except Exception as exc:
            print(f"\nError: {exc}\n")

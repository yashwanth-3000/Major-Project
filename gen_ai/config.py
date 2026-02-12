from __future__ import annotations

import os
import sys

DEFAULT_MODEL = "openai/gpt-4o-mini"


def require_api_keys() -> None:
    """Ensure the required OpenAI API key is available."""
    if not os.getenv("OPENAI_API_KEY"):
        raise RuntimeError(
            "Missing OPENAI_API_KEY. Create gen_ai/.env (or set it in your shell) first."
        )


def load_crewai():
    """Lazily import core CrewAI classes."""
    try:
        from crewai import Agent, Crew, Process, Task
    except ModuleNotFoundError as exc:
        raise RuntimeError(
            "Missing dependency 'crewai'. Run: pip install -r gen_ai/requirements.txt"
        ) from exc
    return Agent, Crew, Process, Task


def load_local_env() -> None:
    """Load environment variables from gen_ai/.env when it exists."""
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(env_path):
        return
    try:
        from dotenv import load_dotenv
    except ModuleNotFoundError:
        print(
            "Warning: python-dotenv not installed; ignoring gen_ai/.env. "
            "Install dependencies or export env vars manually.",
            file=sys.stderr,
        )
        return
    load_dotenv(dotenv_path=env_path)

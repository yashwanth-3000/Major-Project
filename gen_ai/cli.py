from __future__ import annotations

import argparse
import os
import sys

from .config import DEFAULT_MODEL, load_local_env
from .crew import interactive_loop, run_once


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "PneumoAI – AI-powered pneumonia detection and health assistant. "
            "Two workflows: 'report' (X-ray / accuracy / hotspot) and "
            "'general' (everyday health queries)."
        ),
    )
    parser.add_argument(
        "--question",
        type=str,
        help="Single question to run once.  Omit for interactive mode.",
    )
    parser.add_argument(
        "--mode",
        type=str,
        choices=["report", "general", "auto"],
        default="auto",
        help=(
            "Workflow mode: 'report' for X-ray / report analysis, "
            "'general' for health queries, 'auto' for auto-detect (default)."
        ),
    )
    parser.add_argument(
        "--model",
        type=str,
        default=os.getenv("OPENAI_MODEL", DEFAULT_MODEL),
        help=f"LLM model for CrewAI agents (default: {DEFAULT_MODEL}).",
    )
    parser.add_argument(
        "--serve",
        action="store_true",
        help="Start the FastAPI server (for frontend integration).",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port for the API server (default: 8000).",
    )
    return parser.parse_args()


def main() -> int:
    load_local_env()
    args = parse_args()

    # ── API server mode ────────────────────────────────────────────
    if args.serve:
        try:
            import uvicorn
        except ImportError:
            print(
                "Error: uvicorn not installed.  "
                "Run: pip install uvicorn",
                file=sys.stderr,
            )
            return 1

        print(f"Starting PneumoAI API on http://0.0.0.0:{args.port} …")
        uvicorn.run(
            "gen_ai.api:app",
            host="0.0.0.0",
            port=args.port,
            reload=False,
        )
        return 0

    # ── Single-question mode ───────────────────────────────────────
    if args.question:
        mode = "" if args.mode == "auto" else args.mode
        try:
            print(
                run_once(
                    question=args.question,
                    model_name=args.model,
                    mode=mode,
                )
            )
            return 0
        except Exception as exc:
            print(f"Error: {exc}", file=sys.stderr)
            return 1

    # ── Interactive mode ───────────────────────────────────────────
    interactive_loop(model_name=args.model)
    return 0

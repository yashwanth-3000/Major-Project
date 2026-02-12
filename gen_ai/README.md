# Gen AI CrewAI EAT Workflow

This package contains a CrewAI agentic workflow (4 agents) that answers user questions about pneumonia using OpenAI models.

## Agents

1. Clinical Intake Agent (Extract)
2. Pneumonia Knowledge Agent (Analyze)
3. Safety and Risk Agent (Analyze safety pass)
4. Response Composer Agent (Tailor)

This is the EAT flow:
- E = Extract user intent and risk context
- A = Analyze medical content and safety
- T = Tailor a final user-facing answer

## Project Structure

```
gen_ai/
    __init__.py      # Package marker; re-exports run_once
    __main__.py      # Enables `python -m gen_ai`
    config.py        # DEFAULT_MODEL, load_local_env(), require_openai_key(), load_crewai()
    agents.py        # 4 agent factory functions
    tasks.py         # 4 task factory functions
    crew.py          # build_crew(), run_once(), interactive_loop()
    cli.py           # parse_args(), main()
    .env.example     # Environment variable template
    requirements.txt # Python dependencies
```

## Setup

```bash
pip install -r gen_ai/requirements.txt
cp gen_ai/.env.example gen_ai/.env
```

Add your key in `gen_ai/.env`:
- `OPENAI_API_KEY`
- Optional: `OPENAI_MODEL` (default is `openai/gpt-4o-mini`)

## Run

Single question:

```bash
python -m gen_ai --question "What are the early symptoms of pneumonia?"
```

Interactive mode:

```bash
python -m gen_ai
```

Programmatic usage:

```python
from gen_ai import run_once

answer = run_once("What causes pneumonia?", model_name="openai/gpt-4o-mini")
```

## Notes

- This workflow is informational, not a medical diagnosis tool.
- Safety agent adds red-flag escalation guidance.

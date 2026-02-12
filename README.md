# PneumoAI: Enhanced Diagnostic Interpretability with GenAI

A college major project that combines deep learning-based pneumonia detection with an AI-powered conversational assistant. The system provides explainable diagnostic insights from chest X-ray analysis and answers health-related questions through intelligent multi-agent workflows.

---

## Project Overview

PneumoAI is a full-stack application with three integrated components:

1. **Deep Learning Model** — A PyTorch-based ResNet-152 classifier that detects pneumonia from chest X-ray images with high accuracy, enhanced by Grad-CAM heatmaps for visual interpretability.

2. **GenAI Backend** — A CrewAI-powered API that runs two distinct workflows: one for analyzing pneumonia reports and detection results, and another for answering general health questions. The backend is deployed on Railway and serves the frontend via a REST API.

3. **Web Application** — A Next.js frontend with a marketing landing page and an interactive chat interface that connects to the GenAI backend, supporting both report analysis and general health queries.

---

## System Architecture

The project follows a modular architecture:

- The **website** runs as a Next.js application and can be hosted locally or on platforms like Vercel.
- The **gen_ai** backend runs as a FastAPI server and is deployed on Railway. It receives chat requests from the frontend and routes them to the appropriate CrewAI workflow.
- The **main.py** script represents the original PyTorch pipeline for training and evaluating the pneumonia detection model. It operates separately from the web stack and is used for model development and offline evaluation.

The chat interface sends user messages and a selected mode (Report or General Health) to the backend. The backend uses that mode to choose which workflow to run and returns a structured response.

---

## Deep Learning Component

### Purpose

The deep learning component focuses on automated pneumonia detection from chest X-ray images. It uses a ResNet-152 architecture with modifications suited for medical imaging classification.

### How It Works

- **ResNet-152** — A convolutional neural network with residual connections that helps train very deep models without vanishing gradients. It is pretrained and fine-tuned on chest X-ray data.

- **Grad-CAM (Gradient-weighted Class Activation Mapping)** — A technique that highlights regions of the X-ray image that most influenced the model’s decision. This provides a visual explanation of where the model “looks” when predicting pneumonia.

- **Data Pipeline** — The system expects chest X-ray images organized in train, validation, and test folders. Images are resized, normalized, and augmented (e.g., horizontal flip, rotation) for training.

- **Output** — The model produces a binary classification (Normal vs Pneumonia) with a confidence score, along with Grad-CAM heatmaps overlayed on the input image.

### Results

The model achieves approximately 95% validation accuracy. Grad-CAM visualizations show that the model focuses on lung regions, which aligns with clinically relevant areas.

---

## GenAI Backend

### Purpose

The GenAI backend provides a conversational interface for two use cases: interpreting pneumonia detection results and answering general health questions. It uses CrewAI Flows to orchestrate multiple agents and ensure consistent, safe, and readable responses.

### Multi-Agent Architecture (Detailed)

The system uses **CrewAI** to run a small team of specialized AI agents. Each agent has a distinct **role**, **goal**, and **backstory** that shapes how it behaves. Agents work sequentially: the first agent's output is passed as **context** to the second agent, who builds on it. This two-stage design keeps responses fast while ensuring quality and safety.

#### Flow Orchestration

Before any agent runs, a **CrewAI Flow** decides which workflow to use:

- **Entry point** — The flow receives the user's message and the selected mode (Report or General Health) from the frontend.
- **Router** — Based on mode, the flow routes to either the Report crew or the General Health crew. There is no automatic classification; the frontend always sends the mode.
- **Crew execution** — The chosen crew runs its agents in sequence, then returns the final response.

---

### Report Workflow Agents

Used when the user selects Read Reports. Designed for X-ray report analysis, Grad-CAM interpretation, and AI detection confidence. Handles pasted reports, Grad-CAM hotspots, and AI confidence scores.

#### 1. Pneumonia Report Analyst

**Role:** Pneumonia Report Analyst

**Goal:** Analyze pneumonia detection results including accuracy scores, Grad-CAM hotspots, and classification output. Be concise.

**Backstory:** This agent is framed as a diagnostic AI specialist who understands deep-learning model outputs, Grad-CAM heatmaps, and confidence scores from ResNet-152 pipelines. It gives brief, accurate analyses without unnecessary elaboration.

**What it does:** The agent receives the user's query (e.g., a pasted X-ray report, a description of detection results, or a question about hotspots or confidence scores). Its task is to: extract and interpret the classification result (Normal vs Pneumonia) and any confidence score; explain what the Grad-CAM hotspot regions mean and which lung areas are highlighted; assess the reliability of the AI result and its limitations; and apply the **health-only guardrail** — if the query is not about health, medicine, pneumonia, X-rays, or medical reports, it refuses to answer and returns a polite redirect message instead.

**Output:** A short internal analysis (under 200 words) that the next agent uses as context, or a redirect message if the query is out of scope.

#### 2. Clinical Report Writer

**Role:** Clinical Report Writer

**Goal:** Translate diagnostic analysis into a clear, brief, patient-friendly explanation with next steps.

**Backstory:** This agent is framed as a medical communicator who writes plain-language explanations of diagnostic results. It is instructed to always add a disclaimer that AI analysis is not a substitute for professional medical care.

**What it does:** The agent receives the Analyst's output as context. It first checks whether the Analyst returned a redirect (non-health query) — if so, it passes that through unchanged. Otherwise, it turns the technical analysis into a structured, empathetic response with: **Summary** (what was detected and confidence level), **What the Hotspots Show** (plain-language explanation of Grad-CAM regions), **Reliability** (how trustworthy the AI result is), **Next Steps** (what the patient should do), and **Disclaimer** (AI is not a substitute for professional diagnosis).

**Output:** The final user-facing message (under 300 words) or the unchanged redirect.

---

### General Health Workflow Agents

Designed for everyday health questions: symptoms, prevention, wellness, lifestyle, colds, flu, immunity, and similar topics.

#### 3. Health Advisor

**Role:** Health Advisor

**Goal:** Understand the user's health question and provide a concise, evidence-based answer using medical knowledge.

**Backstory:** This agent is framed as a knowledgeable health advisor who gives brief, helpful answers about symptoms, prevention, treatment, and wellness. It is instructed to flag urgent symptoms when relevant.

**What it does:** The agent receives the user's question directly. It determines whether the query is health-related (symptoms, medicine, wellness, fitness, nutrition, medical topics). It applies the **health-only guardrail** — if the query is not health-related (e.g., cooking, sports, movies), it refuses to answer and returns a polite redirect message. If health-related, it provides a direct answer, two or three key facts, and warning signs to watch for when relevant. It keeps the response under 200 words and uses only the model's built-in medical knowledge (no web search).

**Output:** A concise health advice draft, or a redirect message if out of scope.

#### 4. Health Response Writer

**Role:** Health Response Writer

**Goal:** Polish the health advice into a clear, empathetic response with appropriate disclaimers and next steps.

**Backstory:** This agent is framed as someone who writes concise, friendly health responses. It ensures all answers state they are informational only and recommend seeing a doctor for specific concerns.

**What it does:** The agent receives the Health Advisor's output as context. It first checks whether the Advisor returned a redirect — if so, it passes that through unchanged. Otherwise, it polishes the draft into a user-friendly final response with: **Answer** (clear, direct response), **Key Points** (two or three practical takeaways), **When to See a Doctor** (brief guidance), and **Disclaimer** (general information, not medical advice).

**Output:** The final user-facing message (under 250 words) or the unchanged redirect.

---

### How the Agents Work Together

**Sequential handoff:** Each workflow runs its agents in order. Agent 1 completes its task and produces an output. Agent 2 receives that output as **context** (via CrewAI's task context feature) and builds the final response. The pipeline is linear; there is no parallel execution or delegation.

**Guardrail propagation:** The health-only guardrail is enforced in the first agent of each workflow. If that agent detects a non-health query, it returns a fixed redirect message. The second agent is explicitly told to detect this redirect and pass it through unchanged, so the user never receives inappropriate medical content for off-topic questions.

**No tools:** Agents do not use web search, calculators, or other tools. They rely solely on the LLM's knowledge, which keeps responses fast and predictable.

**Verbosity off:** Agents run with verbose logging disabled to reduce noise and latency.

---

### Design Choices

- **No Web Search** — The backend relies only on the LLM’s built-in knowledge. No external search tools or APIs are used, which keeps responses fast and predictable.

- **Health-Only Guardrail** — Non-health queries (e.g., cooking, sports, general trivia) are politely redirected. The system responds that it only assists with health-related topics and asks the user to rephrase.

- **Lightweight Pipelines** — Each workflow uses two agents with concise prompts to keep response times around 10–15 seconds.

### API Endpoints

- **POST /chat** — Accepts a message and mode (report or general). Runs the appropriate workflow and returns the AI response.
- **GET /health** — Health check that confirms the service is up and that required API keys are configured.

### Environment Variables

The backend requires an OpenAI API key for the LLM. Optional settings include the model name and a flag to disable tracing. All configuration is provided via environment variables; there is no hardcoded secrets.

---

## Web Application

### Purpose

The web app serves as the user-facing interface for the PneumoAI system. It includes a landing page and a chat page where users interact with the GenAI backend.

### Landing Page

The home page presents the project with hero content, methodology, feature highlights, and results. It uses a medical-inspired design with custom fonts and a teal/cyan color scheme. Animations and layered backgrounds provide a modern, polished look.

### Chat Interface

The chat page is the main interaction point:

- **Mode Toggle** — Users switch between “Read Reports” and “General Health.” The selected mode is sent to the backend and controls which workflow runs.

- **Suggestion Cards** — On the welcome screen, predefined suggestions change based on the selected mode. Report mode shows X-ray and pneumonia-related prompts; General Health mode shows wellness and prevention prompts.

- **Image Upload** — In Report mode, users can upload an X-ray image. The frontend sends a descriptive request to the backend, which interprets it as a report-style query. Actual image analysis is handled conceptually; the GenAI backend processes the description and provides an explanation.

- **Theme Toggle** — Users can switch between light and dark themes.

The frontend uses a single API base URL (defaulting to the Railway deployment). For local development, an environment variable can override this to point to a local backend.

---

## Deployment

### Backend (Railway)

The GenAI backend is deployed on Railway:

- A Procfile and nixpacks configuration define the build and start process.
- The application runs with Uvicorn and listens on the port provided by Railway.
- Environment variables (including the OpenAI API key) are configured in the Railway dashboard.
- CORS is configured to allow requests from the frontend and localhost.
- The public API URL is available after deployment and can be used by the frontend.

### Frontend (Local or Vercel)

The Next.js app can run locally for development or be deployed to Vercel or similar platforms. It is configured to use the Railway backend by default but can be overridden via environment variables.

---

## Important Disclaimers

- **Not Medical Advice** — PneumoAI is an educational and research project. All responses, including those about pneumonia detection and general health, are for informational purposes only. They are not a substitute for professional medical diagnosis or treatment.

- **AI Limitations** — The deep learning model and GenAI agents have inherent limitations. Human review and clinical validation are essential before any real-world medical use.

- **Data Privacy** — User messages are sent to the backend API and processed by external LLM providers. Sensitive medical information should not be shared in this system without understanding data handling policies.

---

## Project Structure Summary

- **Root** — Contains configuration for Railway deployment (Procfile, nixpacks), root-level requirements, and this README.
- **gen_ai/** — Python package with agents, tasks, crews, flow orchestration, FastAPI app, and CLI. This is the GenAI backend.
- **website/** — Next.js application with pages, components, and styles. This is the web frontend.
- **main.py** — Standalone PyTorch script for pneumonia detection model training and evaluation.

---

## Technologies Used

**Deep Learning:** PyTorch, torchvision, ResNet-152, Grad-CAM, scikit-image, PIL

**GenAI Backend:** Python, FastAPI, CrewAI, OpenAI API, Uvicorn, Pydantic

**Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide icons

**Deployment:** Railway (backend), Nixpacks (build)

---

## Getting Started (Conceptual)

To run the system locally:

1. Install Python dependencies from the root requirements file (or from gen_ai if working only in that package).
2. Create a `.env` file in gen_ai (or equivalent) with your OpenAI API key.
3. Start the GenAI backend server (for example, with the built-in serve command).
4. Install Node.js dependencies in the website folder.
5. Start the Next.js development server.
6. Open the chat page and ensure the frontend is configured to use your local backend URL.

For deployment:

1. Deploy the backend to Railway (using the existing project configuration) and set environment variables.
2. Deploy the frontend to your preferred host (e.g., Vercel).
3. Ensure the frontend’s API URL points to your deployed backend and that CORS allows your frontend origin.

---

## License

This project is developed as a college major project. Please refer to the project documentation or course materials for usage and licensing terms.

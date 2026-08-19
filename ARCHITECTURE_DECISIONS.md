# 🏛️ Architecture Decisions Log — ScaleProposal AI

This document logs key technical and architectural decisions made during the ScaleProposal AI engineering refactor.

---

## Decision 1: AI Service Abstraction & Gemini Provider Setup
* **Context:** The original backend instantiated a new `genai.Client` synchronously on every FastAPI route request, blocking the event loop and hardcoding `gemini-2.5-flash`.
* **Options Considered:**
  1. Keep direct inline Gemini client instantiation in each agent.
  2. Implement an abstract `AIProvider` layer with a persistent `GeminiProvider` instance.
* **Chosen Approach:** Option 2 (`AIProvider` + `GeminiProvider` + `AIService` facade).
* **Reason:** Allows asynchronous LLM execution, centralizes retry/backoff policy, supports structured Pydantic JSON outputs, and enables future support for alternative LLM providers (e.g., OpenAI, Anthropic, local models) without modifying agent code.
* **Trade-offs:** Introduces an extra abstraction layer, but significantly improves testability and maintainability.

---

## Decision 2: Structured Multi-Agent Output Schemas
* **Context:** Agents originally returned unvalidated dicts or markdown strings. `PlannerAgent`, `PricingAgent`, and `RiskAgent` were 100% hardcoded dummy logic.
* **Options Considered:**
  1. Have each agent return raw Markdown strings.
  2. Define strict Pydantic schemas (`PlannerOutput`, `PricingOutput`, `RiskOutput`, `ProposalOutput`) for inter-agent communication.
* **Chosen Approach:** Option 2 (Pydantic structured output schemas).
* **Reason:** Ensures type safety across backend agents, enables exact API contract enforcement, prevents schema mismatch bugs, and allows `ProposalAgent` to reliably synthesize structured outputs.
* **Trade-offs:** Requires strict validation handling if Gemini output deviates from schema (handled via automatic schema repair and retry logic).

---

## Decision 3: Workflow/Session-Isolated Event Streams
* **Context:** The existing SSE implementation used a global singleton `asyncio.Queue`, causing events to bleed across concurrent user sessions.
* **Options Considered:**
  1. WebSockets with channel topics.
  2. Server-Sent Events (SSE) with session/workflow-isolated event queues (`WorkflowEventManager` indexed by `workflow_id`).
* **Chosen Approach:** Option 2 (Session-isolated SSE with `workflow_id`).
* **Reason:** SSE is lighter weight than WebSockets for uni-directional streaming (backend to client), works standardly over HTTP, and `workflow_id` isolation guarantees zero cross-talk between user requests.
* **Trade-offs:** Client must connect to the specific stream URL `/api/v1/workflows/{workflow_id}/stream`.

---

## Decision 4: Database Persistence Strategy
* **Context:** The project had an unused SQLAlchemy engine in `database.py`, but zero database models or repositories. Data was lost on browser refresh.
* **Options Considered:**
  1. In-memory dictionary store.
  2. SQLAlchemy models (`Proposal`, `AgentExecution`) + SQLite database + Alembic migrations.
* **Chosen Approach:** Option 2 (SQLAlchemy ORM + SQLite + Alembic).
* **Reason:** Provides robust persistence, full proposal history, audit logging of agent execution steps, and migration support for schema changes.
* **Trade-offs:** Requires running initial Alembic migrations during backend startup.

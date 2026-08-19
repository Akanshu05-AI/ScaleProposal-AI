# 🏛️ ScaleProposal AI — System Architecture & Design Specification

This document details the production-grade software architecture, agent interaction models, event streaming design, and persistence schema for **ScaleProposal AI**.

---

## 1. High-Level Architecture Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser
    participant FE as Next.js Frontend
    participant API as FastAPI REST Layer
    participant SSE as WorkflowEventManager (SSE)
    participant Orch as ProposalWorkflow Orchestrator
    participant AI as AIService (GeminiProvider)
    participant DB as SQLAlchemy (SQLite/PostgreSQL)

    User->>FE: Input Company Name, Project Type, Requirements
    FE->>FE: Generate unique workflow_id (e.g. wf-1724...)
    FE->>SSE: Open EventSource GET /api/v1/workflows/:workflow_id/stream
    FE->>API: POST /api/v1/proposals (with workflow_id)
    API->>Orch: execute(company_name, project_type, requirements, workflow_id)
    
    rect rgb(240, 240, 255)
        note right of Orch: Agent 1: PlannerAgent
        Orch->>SSE: Publish {agent: "planner", status: "running"}
        Orch->>AI: generate_structured(prompt, PlannerOutput)
        AI-->>Orch: Return PlannerOutput Pydantic object
        Orch->>SSE: Publish {agent: "planner", status: "completed"}
    end

    rect rgb(255, 240, 240)
        note right of Orch: Agent 2: PricingAgent
        Orch->>SSE: Publish {agent: "pricing", status: "running"}
        Orch->>AI: generate_structured(prompt, PricingOutput)
        AI-->>Orch: Return PricingOutput Pydantic object
        Orch->>SSE: Publish {agent: "pricing", status: "completed"}
    end

    rect rgb(240, 255, 240)
        note right of Orch: Agent 3: RiskAgent
        Orch->>SSE: Publish {agent: "risk", status: "running"}
        Orch->>AI: generate_structured(prompt, RiskOutput)
        AI-->>Orch: Return RiskOutput Pydantic object
        Orch->>SSE: Publish {agent: "risk", status: "completed"}
    end

    rect rgb(255, 255, 240)
        note right of Orch: Agent 4: ProposalAgent
        Orch->>SSE: Publish {agent: "proposal", status: "running"}
        Orch->>AI: generate_structured(prompt, ProposalOutput)
        AI-->>Orch: Return ProposalOutput Pydantic object
        Orch->>SSE: Publish {agent: "proposal", status: "completed"}
    end

    Orch->>DB: Persist Proposal record & AgentExecution step logs
    Orch-->>API: Return complete structured result
    API-->>FE: Return ProposalResponse (201 Created)
    FE->>FE: Close SSE stream connection & render proposal tabs
```

---

## 2. Component Design & Responsibilities

### 2.1 AI Provider Abstraction (`AIService` & `GeminiProvider`)
- **Location**: `backend/app/services/ai/`
- **Pattern**: Provider Pattern with Facade Singleton.
- **Design**: `AIProvider` defines `generate_text` and `generate_structured`. `GeminiProvider` implements lazy-loaded persistent `genai.Client` instances, non-blocking thread execution (`asyncio.to_thread`), automatic JSON schema enforcement, and exponential backoff retries (`AI_MAX_RETRIES = 3`).

### 2.2 Session-Isolated Event Manager (`WorkflowEventManager`)
- **Location**: `backend/app/services/event_manager.py`
- **Pattern**: Per-Session Publisher-Subscriber Queue.
- **Design**: Maintains an in-memory dictionary `_channels: Dict[str, asyncio.Queue]` indexed by `workflow_id`. Each request creates its own isolated queue, ensuring concurrent users receive only their own real-time execution events. Channels are automatically destroyed when streams terminate or client disconnects.

### 2.3 Persistence Layer (`SQLAlchemy` & `Alembic`)
- **Location**: `backend/app/database/`, `backend/app/models/`, `backend/app/repositories/`
- **Tables**:
  - `proposals`: Primary proposal storage (`id`, `workflow_id`, `company_name`, `project_type`, `requirements`, `estimated_total`, `pricing_range`, `timeline`, `overall_risk_level`, `planner_output`, `pricing_output`, `risk_output`, `proposal_output`, `final_markdown`).
  - `agent_executions`: Step audit log (`id`, `proposal_id`, `agent_name`, `status`, `execution_time`, `input_data`, `output_data`).

---

## 3. Security & Control Posture

1. **Prompt Injection Defense**:
   - `BaseAgent.sanitize_input()` removes control characters and dangerous null bytes from user-supplied inputs before assembling LLM prompts.
   - User inputs are explicitly demarcated inside structured system prompt containers.
2. **Cost Control & Input Validation**:
   - `ProposalCreateRequest` enforces string length constraints (e.g., `requirements` max length: 5000 chars, `company_name` max length: 100 chars).
   - Retry counters prevent infinite loops on malformed responses.
3. **Secret Protection**:
   - `GEMINI_API_KEY` is loaded strictly via `pydantic-settings` from environment files (`.env`).
   - Internal stack traces and provider keys are never exposed in user-facing HTTP error responses.

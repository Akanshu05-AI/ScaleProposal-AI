# 🏥 Project Health Report — ScaleProposal AI

**Date of Audit:** August 19, 2026  
**Auditor:** Senior AI Solutions & Systems Architect  
**Project:** ScaleProposal AI (Assignment 01 — ScaleOn Internship Program 2026)

---

## 1. Architecture Scores (0–10)

| Category | Score | Rationale & Findings |
| :--- | :---: | :--- |
| **Architecture** | **2 / 10** | Single LLM pipeline disguised as a multi-agent system; data lost between backend layers; global singleton queue used for streaming causing cross-talk; no true layer isolation. |
| **Backend Quality** | **3 / 10** | Sync blocking LLM calls inside FastAPI async handlers; broken import references (`ai.py`); unused SQLAlchemy instances; swallowed exceptions returning error strings as proposal text. |
| **Frontend Quality** | **4 / 10** | Visually sleek UI, but contains 0-byte empty files (`sse.ts`, `ExportButtons.tsx`), and re-implements backend dummy rules on client side to work around broken API contracts. |
| **AI Implementation** | **1 / 10** | 3 out of 4 agents (`PlannerAgent`, `PricingAgent`, `RiskAgent`) are 100% hardcoded/fake rules. Only `ProposalAgent` makes an LLM call. Hardcoded model string (`gemini-2.5-flash`). |
| **Multi-Agent Architecture** | **0 / 10** | Non-existent in practice. Agents do not perform collaborative reasoning or produce structured Pydantic schema outputs. |
| **Database** | **1 / 10** | SQLAlchemy engine initialized in `database.py`, but 0 models exist, 0 CRUD repositories exist, 0 migrations exist. Data disappears on browser refresh. |
| **API Design** | **3 / 10** | Inconsistent payload schemas; proposal route discards agent output objects and returns `"Completed"` strings. Endpoints lack input sanitization and rate limits. |
| **Security** | **3 / 10** | Direct insertion of untrusted user input into LLM prompts without boundary checks (vulnerable to prompt injection); missing API key rotation/validation; CORS allows localhost without auth. |
| **Performance** | **2 / 10** | Sync Gemini calls block FastAPI event loop; new `genai.Client` instantiated on every request; no response caching or token limits. |
| **Error Handling** | **2 / 10** | Exceptions caught globally and returned as raw strings (`f"Gemini Error: {e}"`), which get rendered as valid proposal markdown on the client. |
| **Testing** | **1 / 10** | Only 1 manual test script (`test_planner.py`) testing a hardcoded mock agent. 0 automated unit, API, integration, or frontend tests. |
| **Documentation** | **4 / 10** | Readme is nicely formatted with markdown diagrams, but makes false claims about features (claims PDF export, claims 4 specialized AI agents, claims SSE workflow stream). |
| **Production Readiness** | **1 / 10** | Not ready for production due to lack of real multi-agent logic, missing persistence, race conditions in streaming, blocking calls, and zero tests. |

---

## 2. Identified Fake & Placeholder Implementations

1. **`PlannerAgent` (`backend/app/agents/planner_agent.py`)**: Returns static hardcoded Python dict with fixed deliverables and stack.
2. **`PricingAgent` (`backend/app/agents/pricing_agent.py`)**: Rule-based character count heuristic (`len(requirements) < 200` => $2,000, `< 500` => $5,000, else $10,000).
3. **`RiskAgent` (`backend/app/agents/risk_agent.py`)**: Simple string check (`if "ai" in requirements:`).
4. **Backend Route Data Discard (`backend/app/api/v1/routes/proposal.py`)**: Extracts `.get("status")` (returns `"Completed"`) instead of actual agent outputs.
5. **Frontend Business Logic Duplication (`frontend/components/proposal/ProposalForm.tsx`)**: Re-evaluates character length and string checks locally to fake tab outputs on UI.
6. **Unused / Dead Streaming Files**: `frontend/services/sse.ts` is `0 bytes`.
7. **Unused / Dead PDF Export Files**: `frontend/components/proposal/ExportButtons.tsx` is `0 bytes`.
8. **Global Singleton Event Queue (`backend/app/services/event_manager.py`)**: Single shared queue for all SSE requests; concurrent users steal each other's stream events.
9. **Unused Database Infrastructure (`backend/app/database/database.py`)**: Engine setup exists, but zero database models or CRUD functions exist.

---

## 3. Comprehensive Refactoring Strategy

We will execute the 10-phase refactor:
1. **Phase 1**: Audit & Health Report (This document + `TEAM_CHANGES.md` + `ARCHITECTURE_DECISIONS.md`).
2. **Phase 2**: Backend Infrastructure (Async Gemini Service with Provider Abstraction, Pydantic Config, Configurable Model `GEMINI_MODEL`, Logging, Error Handling).
3. **Phase 3**: Real Multi-Agent System (Pydantic Structured Outputs for `PlannerAgent`, `PricingAgent`, `RiskAgent`, `ProposalAgent`).
4. **Phase 4**: Orchestrator & Isolated Event Manager (UUID-tagged workflow orchestrator with session-isolated event queues).
5. **Phase 5**: Database & Migrations (SQLAlchemy models for `Proposal` & `AgentExecution`, Alembic migrations, Repositories).
6. **Phase 6**: API Routes & Contracts (RESTful CRUD `/api/v1/proposals`, `/api/v1/workflows/{id}`, validated schemas).
7. **Phase 7**: Frontend Refactor (Remove duplicated client rules, consume real API contracts, isolated SSE connection, real-time workflow status).
8. **Phase 8**: Production PDF Export (Clean, client-side PDF export with jsPDF/html2pdf/canvas rendering structured proposals).
9. **Phase 9**: Automated Test Suite (Pytest backend unit, API, integration tests with Gemini mocks; Frontend build validation).
10. **Phase 10**: Production Documentation & Final Verification.

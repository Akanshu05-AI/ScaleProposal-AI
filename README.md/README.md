# 🚀 ScaleProposal AI

> **AI-Powered Proposal Generation using a Hybrid Multi-Agent System**

ScaleProposal AI is an intelligent proposal generation platform that automates the process of creating professional business proposals. Instead of relying on a single AI model, the application utilizes a **Hybrid Multi-Agent Architecture**, where specialized AI agents collaborate to analyze client requirements, estimate project cost, identify risks, and generate a comprehensive proposal.

---

## ✨ Features

- 🧠 Hybrid Multi-Agent Architecture
- 📋 Automated Proposal Generation
- 💰 AI-Based Budget Estimation
- ⚠️ Risk Analysis
- 📄 Professional Proposal Formatting
- 📥 PDF Export
- 📋 Copy to Clipboard
- ⚡ Real-Time Workflow Visualization
- 🎨 Modern Responsive UI
- 🤖 Powered by Google Gemini AI

---

# 🏗️ System Architecture

```
                Client Request
                      │
                      ▼
          ┌────────────────────┐
          │  Planner Agent      │
          │ Requirement Analysis│
          └────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌────────────────┐         ┌────────────────┐
│ Pricing Agent  │         │  Risk Agent    │
│ Cost Estimation│         │ Risk Analysis  │
└────────────────┘         └────────────────┘
        └─────────────┬─────────────┘
                      ▼
          ┌────────────────────┐
          │ Proposal Agent      │
          │ Final Proposal      │
          └────────────────────┘
                      │
                      ▼
          Professional Business Proposal
```

---

# 🧠 AI Agents

## 1️⃣ Planner Agent

Responsible for:

- Understanding client requirements
- Breaking down project scope
- Creating project roadmap

---

## 2️⃣ Pricing Agent

Responsible for:

- Cost estimation
- Timeline estimation
- Resource planning

---

## 3️⃣ Risk Agent

Responsible for:

- Identifying project risks
- Highlighting technical challenges
- Suggesting mitigation strategies

---

## 4️⃣ Proposal Agent

Responsible for:

- Combining outputs of all agents
- Writing the final proposal
- Formatting professional documents

---

# 🛠️ Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- Axios
- React Markdown
- jsPDF

---

## Backend

- FastAPI
- Python
- Google Gemini AI
- Pydantic
- AsyncIO
- Server Sent Events (SSE)

---

# 📂 Project Structure

```
ScaleProposal-AI
│
├── backend
│   ├── agents
│   ├── api
│   ├── core
│   ├── orchestrator
│   ├── services
│   ├── schemas
│   └── main.py
│
├── frontend
│   ├── app
│   ├── components
│   ├── context
│   ├── hooks
│   ├── lib
│   ├── types
│   └── utils
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/Akanshu05-AI/ScaleProposal-AI.git
```

```
cd ScaleProposal-AI
```

---

# Backend Setup

```
cd backend
```

Create virtual environment

```bash
python -m venv venv
```

Activate

Windows

```bash
venv\Scripts\activate
```

Linux / Mac

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Create `.env`

```env
GEMINI_API_KEY=YOUR_API_KEY
```

Run Backend

```bash
uvicorn app.main:app --reload
```

Backend runs on

```
http://127.0.0.1:8000
```

---

# Frontend Setup

```
cd frontend
```

Install packages

```bash
npm install
```

Run frontend

```bash
npm run dev
```

Frontend runs on

```
http://localhost:3000
```

---

# API Endpoints

## Generate Proposal

```
POST /api/v1/proposal
```

### Request

```json
{
    "company_name":"ScaleOn",
    "project_type":"AI Proposal Generator",
    "requirements":"Build an AI proposal generator using Gemini AI."
}
```

---

## Workflow Stream

```
GET /api/v1/workflow/stream
```

Uses **Server Sent Events** for real-time workflow updates.

---

# Workflow

```
User Input
    │
    ▼
Planner Agent
    │
    ▼
Pricing Agent
    │
    ▼
Risk Agent
    │
    ▼
Proposal Agent
    │
    ▼
Generated Proposal
```

---

# Future Enhancements

- Authentication
- User Dashboard
- Proposal History
- Team Collaboration
- CRM Integration
- Multiple LLM Support
- Export to DOCX
- Email Proposal
- Cloud Storage
- Analytics Dashboard

---

# Why Hybrid Multi-Agent?

Instead of asking a single LLM to generate everything, ScaleProposal AI separates responsibilities into specialized agents.

Benefits include:

- Better modularity
- Higher quality outputs
- Easier maintenance
- Better scalability
- Independent reasoning
- Transparent execution workflow

---

# Author

## Akanshu Goel

AI & Machine Learning Engineer

- LinkedIn: [https://linkedin.com/in/your-linkedin](https://www.linkedin.com/in/akanshu-goel-922310270/)
- GitHub: https://github.com/Akanshu05-AI

---

# License

MIT License

---

# ⭐ If you found this project useful, consider giving it a star.

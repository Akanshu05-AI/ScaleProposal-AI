import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database.database import get_db

client = TestClient(app)


def test_health_check_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_ping_endpoint():
    response = client.get("/ping")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_proposal_validation_error():
    payload = {
        "company_name": "Test",
        "project_type": "App",
        "requirements": "short"
    }
    response = client.post("/api/v1/proposals", json=payload)
    assert response.status_code == 422


def test_proposal_generation_and_history_flow(db_session):
    app.dependency_overrides[get_db] = lambda: db_session

    payload = {
        "company_name": "ScaleProposal Corp",
        "project_type": "AI Platform",
        "requirements": "Comprehensive AI proposal platform integration with vector search.",
        "workflow_id": "wf-api-test-999"
    }

    # 1. Create proposal
    response = client.post("/api/v1/proposals", json=payload)
    if response.status_code != 201:
        print("FAIL DETAILS:", response.json())
    assert response.status_code == 201, f"Failed: {response.json()}"

    data = response.json()
    assert data["company_name"] == "ScaleProposal Corp"
    assert data["workflow_id"] == "wf-api-test-999"
    assert data["planner"] is not None
    assert data["pricing"] is not None

    proposal_id = data["id"]

    # 2. Fetch proposal by ID
    get_res = client.get(f"/api/v1/proposals/{proposal_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == proposal_id

    # 3. List proposals
    list_res = client.get("/api/v1/proposals")
    assert list_res.status_code == 200
    assert list_res.json()["total"] >= 1

    # 4. Fetch agent execution logs
    agents_res = client.get(f"/api/v1/proposals/{proposal_id}/agents")
    assert agents_res.status_code == 200
    assert len(agents_res.json()) == 4

    # 5. Delete proposal
    del_res = client.delete(f"/api/v1/proposals/{proposal_id}")
    assert del_res.status_code == 204

    # Verify deleted
    get_after_del = client.get(f"/api/v1/proposals/{proposal_id}")
    assert get_after_del.status_code == 404

    app.dependency_overrides.clear()

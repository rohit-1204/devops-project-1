from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_get_todos():
    response = client.get("/api/todos")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_todo():
    response = client.post(
        "/api/todos",
        json={"text": "Learn FastAPI"}
    )

    assert response.status_code == 201

    data = response.json()

    assert data["text"] == "Learn FastAPI"
    assert data["completed"] is False


def test_empty_todo():
    response = client.post(
        "/api/todos",
        json={"text": "   "}
    )

    assert response.status_code == 400


def test_get_todo_not_found():
    response = client.get("/api/todos/999999")

    assert response.status_code == 404

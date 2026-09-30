"""Tests for project API endpoints."""

import pytest


def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_list_projects_requires_auth(client):
    """Test that list projects requires authentication."""
    response = client.get("/api/v1/projects")
    assert response.status_code == 401


def test_list_projects_with_auth(client, auth_headers):
    """Test listing projects with valid auth."""
    response = client.get("/api/v1/projects", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_project_requires_auth(client):
    """Test that creating a project requires authentication."""
    response = client.post(
        "/api/v1/projects",
        json={"name": "Test Project"},
    )
    assert response.status_code == 401


def test_create_project_with_auth(client, auth_headers):
    """Test creating a project with valid auth."""
    response = client.post(
        "/api/v1/projects",
        json={
            "name": "Test Project",
            "description": "A test project",
        },
        headers=auth_headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Project"
    assert data["description"] == "A test project"
    assert "id" in data


def test_create_project_missing_name(client, auth_headers):
    """Test creating a project without a name."""
    response = client.post(
        "/api/v1/projects",
        json={},
        headers=auth_headers,
    )
    assert response.status_code == 422  # Validation error

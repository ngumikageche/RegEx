import pytest
import json
from datetime import datetime
from database import db
from app.models.visit import Visit
from app.models.user import User


@pytest.fixture
def doctor_token(app):
    """
    Creates a doctor user and returns their JWT token.
    """
    with app.app_context():
        doctor = User(username="doctor", email="doctor@test.com", role="doctor")
        doctor.set_password("doctor123")
        db.session.add(doctor)
        db.session.commit()

        from flask_jwt_extended import create_access_token
        token = create_access_token(identity={"id": doctor.id, "role": doctor.role})
        return token


def test_log_visit(client, doctor_token):
    """
    Test that a doctor can log a visit successfully.
    """
    visit_data = {
        "patient_name": "John Doe",
        "visit_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "notes": "Routine checkup"
    }

    response = client.post(
        "/visits/",
        json=visit_data,  # Use 'json' instead of 'data' to send JSON data
        headers={"Authorization": f"Bearer {doctor_token}"}
        
    )
    assert response.status_code == 201
    assert response.json["message"] == "Visit logged successfully"


def test_log_visit_as_non_doctor(client, user_token):
    """
    Test that a non-doctor user cannot log a visit.
    """
    visit_data = {
        "patient_name": "Jane Doe",
        "visit_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "notes": "Follow-up checkup"
    }

    response = client.post(
        "/visits/",
        data=json.dumps(visit_data),
        headers={"Authorization": f"Bearer {user_token}"}
    )

    assert response.status_code == 403
    assert "Unauthorized" in response.json["error"]


def test_log_visit_missing_fields(client, doctor_token):
    """
    Test logging a visit with missing required fields.
    """
    visit_data = {
        "patient_name": "John Doe"
        # Missing 'visit_date'
    }

    response = client.post(
        "/visits/",
        data=json.dumps(visit_data),
        headers={
            "Authorization": f"Bearer {doctor_token}",
            "Content-Type": "application/json"
        }
    )

    assert response.status_code == 400
    assert "error" in response.json


def test_get_visits(client, doctor_token):
    """
    Test that a doctor can retrieve their logged visits.
    """
    with client.application.app_context():
        doctor = User.query.filter_by(username="doctor").first()
        visit = Visit(doctor_id=doctor.id, patient_name="John Doe", visit_date=datetime.now(), notes="Routine checkup")
        db.session.add(visit)
        db.session.commit()

    response = client.get(
        "/visits/",
        headers={"Authorization": f"Bearer {doctor_token}"}
    )

    assert response.status_code == 200
    assert "visits" in response.json
    assert len(response.json["visits"]) > 0


def test_get_visits_as_non_doctor(client, user_token):
    """
    Test that a non-doctor user cannot retrieve visits.
    """
    response = client.get(
        "/visits/",
        headers={"Authorization": f"Bearer {user_token}"}
    )

    assert response.status_code == 403
    assert "Unauthorized" in response.json["error"]

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from database import db
from app.models.visit import Visit
from app.models.user import User

visit_bp = Blueprint("visit", __name__, url_prefix="/visits")

@visit_bp.route("/", methods=["POST"])
@jwt_required()
def log_visit():
    """
    Logs a doctor visit linked to the logged-in user.
    """
    print(f"Raw Request Data: {request.data}")  # Debugging request body
    print(f"Parsed JSON: {request.get_json()}")  # Debugging JSON
    current_user = get_jwt_identity()
    doctor = User.query.filter_by(id=current_user["id"], role="doctor").first()

    if not doctor:
        return jsonify({"error": "Unauthorized. Only doctors can log visits."}), 403

    data = request.json
    patient_name = data.get("patient_name")
    visit_date = data.get("visit_date")
    notes = data.get("notes", "")

    if not patient_name or not visit_date:
        return jsonify({"error": "Patient name and visit date are required."}), 400

    try:
        visit_date = datetime.strptime(visit_date, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD HH:MM:SS."}), 400

    new_visit = Visit(
        doctor_id=current_user["id"],
        patient_name=patient_name,
        visit_date=visit_date,
        notes=notes
    )

    db.session.add(new_visit)
    db.session.commit()

    return jsonify({"message": "Visit logged successfully"}), 201


@visit_bp.route("/", methods=["GET"])
@jwt_required()
def get_visits():
    """
    Fetches visits logged by the currently authenticated doctor.
    """
    current_user = get_jwt_identity()
    doctor = User.query.filter_by(id=current_user["id"], role="doctor").first()

    if not doctor:
        return jsonify({"error": "Unauthorized. Only doctors can view visits."}), 403

    visits = Visit.query.filter_by(doctor_id=current_user["id"]).all()

    visit_list = [
        {
            "id": visit.id,
            "patient_name": visit.patient_name,
            "visit_date": visit.visit_date.strftime("%Y-%m-%d %H:%M:%S"),
            "notes": visit.notes,
        }
        for visit in visits
    ]

    return jsonify({"visits": visit_list}), 200

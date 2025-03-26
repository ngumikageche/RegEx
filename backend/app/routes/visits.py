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
    Fetches visits. 
    - Doctors see only their own visits.
    - Admins can view all visits with optional filters.
    """
    current_user = get_jwt_identity()
    user = User.query.filter_by(id=current_user["id"]).first()

    if not user:
        return jsonify({"error": "User not found."}), 404

    # Base query
    query = Visit.query

    if user.role == "doctor":
        query = query.filter_by(doctor_id=user.id)  # Doctors see only their visits

    if user.role == "admin":
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        doctor_id = request.args.get("doctor_id")
        patient_name = request.args.get("patient_name")

        if start_date:
            query = query.filter(Visit.visit_date >= datetime.strptime(start_date, "%Y-%m-%d"))
        if end_date:
            query = query.filter(Visit.visit_date <= datetime.strptime(end_date, "%Y-%m-%d"))
        if doctor_id:
            query = query.filter(Visit.doctor_id == int(doctor_id))
        if patient_name:
            query = query.filter(Visit.patient_name.ilike(f"%{patient_name}%"))

    visits = query.all()

    return jsonify({
        "visits": [
            {
                "id": visit.id,
                "doctor_id": visit.doctor_id,
                "doctor_name": visit.doctor.full_name,  # Assuming `full_name` exists
                "patient_name": visit.patient_name,
                "visit_date": visit.visit_date.strftime("%Y-%m-%d %H:%M:%S"),
                "notes": visit.notes,
            }
            for visit in visits
        ]
    }), 200

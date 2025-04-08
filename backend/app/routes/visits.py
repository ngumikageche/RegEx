# app/routes/visit.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from database import db
from app.models.visit import Visit
from app.models.user import User
from app.models.notification import Notification

visit_bp = Blueprint("visit", __name__, url_prefix="/visits")

# Helper function to create a notification
def create_notification(user_id, message):
    notification = Notification(user_id=user_id, message=message)
    db.session.add(notification)

@visit_bp.route("/", methods=["POST"])
@jwt_required()
def log_visit():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"error": "User not found."}), 404

    if user.role != "marketer":
        return jsonify({"error": "Unauthorized. Only marketers can log visits."}), 403

    data = request.json
    doctor_name = data.get("doctor_name")
    location = data.get("location")
    visit_date = data.get("visit_date")
    notes = data.get("notes", "")

    if not doctor_name or not location or not visit_date:
        return jsonify({"error": "Doctor name, location, and visit date are required."}), 400

    try:
        visit_date = datetime.strptime(visit_date, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD HH:MM:SS."}), 400

    new_visit = Visit(
        marketer_id=current_user_id,
        doctor_name=doctor_name,
        location=location,
        visit_date=visit_date,
        notes=notes
    )

    db.session.add(new_visit)
    db.session.commit()

    # Notify the marketer
    create_notification(
        user_id=current_user_id,
        message=f"You logged a visit with {doctor_name} at {location} on {visit_date.strftime('%Y-%m-%d %H:%M:%S')}."
    )

    # Notify all admins
    admins = User.query.filter_by(role="admin").all()
    for admin in admins:
        create_notification(
            user_id=admin.id,
            message=f"Marketer {user.username} logged a visit with {doctor_name} at {location} on {visit_date.strftime('%Y-%m-%d %H:%M:%S')}."
        )

    db.session.commit()

    return jsonify({"message": "Visit logged successfully"}), 201
@visit_bp.route("/", methods=["GET"])
@jwt_required()
def get_visits():
    """
    Fetches visits.
    - Marketers see only their own visits.
    - Admins can view all visits with optional filters.
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"error": "User not found."}), 404

    # Base query
    query = Visit.query

    if user.role == "marketer":
        query = query.filter_by(marketer_id=user.id)  # Marketers see only their visits

    if user.role == "admin":
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        marketer_id = request.args.get("marketer_id")
        doctor_name = request.args.get("doctor_name")

        if start_date:
            try:
                query = query.filter(Visit.visit_date >= datetime.strptime(start_date, "%Y-%m-%d"))
            except ValueError:
                return jsonify({"error": "Invalid start_date format. Use YYYY-MM-DD."}), 400
        if end_date:
            try:
                query = query.filter(Visit.visit_date <= datetime.strptime(end_date, "%Y-%m-%d"))
            except ValueError:
                return jsonify({"error": "Invalid end_date format. Use YYYY-MM-DD."}), 400
        if marketer_id:
            query = query.filter(Visit.marketer_id == int(marketer_id))
        if doctor_name:
            query = query.filter(Visit.doctor_name.ilike(f"%{doctor_name}%"))

    visits = query.all()

    return jsonify({
        "visits": [
            {
                "id": visit.id,
                "marketer_id": visit.marketer_id,
                "marketer_name": f"{visit.marketer.first_name} {visit.marketer.last_name}".strip(),
                "doctor_name": visit.doctor_name,
                "location": visit.location,
                "visit_date": visit.visit_date.strftime("%Y-%m-%d %H:%M:%S"),
                "notes": visit.notes,
            }
            for visit in visits
        ]
    }), 200

@visit_bp.route("/<int:visit_id>", methods=["PUT"])
@jwt_required()
def update_visit(visit_id):
    """
    Updates a specific visit. Only the marketer who logged the visit can update it.
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"error": "User not found."}), 404

    if user.role != "marketer":
        return jsonify({"error": "Unauthorized. Only marketers can update visits."}), 403

    visit = Visit.query.get(visit_id)
    if not visit:
        return jsonify({"error": "Visit not found."}), 404

    if visit.marketer_id != current_user_id:
        return jsonify({"error": "Unauthorized. You can only update your own visits."}), 403

    data = request.json
    visit.doctor_name = data.get("doctor_name", visit.doctor_name)
    visit.location = data.get("location", visit.location)
    visit.notes = data.get("notes", visit.notes)

    if "visit_date" in data:
        try:
            visit.visit_date = datetime.strptime(data["visit_date"], "%Y-%m-%d %H:%M:%S")
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD HH:MM:SS."}), 400

    db.session.commit()

    return jsonify({"message": "Visit updated successfully"}), 200

@visit_bp.route("/<int:visit_id>", methods=["DELETE"])
@jwt_required()
def delete_visit(visit_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"error": "User not found."}), 404

    if user.role not in ["marketer", "admin"]:
        return jsonify({"error": "Unauthorized. Only marketers or admins can delete visits."}), 403

    visit = Visit.query.get(visit_id)
    if not visit:
        return jsonify({"error": "Visit not found."}), 404

    if user.role == "marketer" and visit.marketer_id != current_user_id:
        return jsonify({"error": "Unauthorized. You can only delete your own visits."}), 403

    # Store visit details before deletion
    marketer_id = visit.marketer_id
    doctor_name = visit.doctor_name
    location = visit.location
    visit_date = visit.visit_date.strftime("%Y-%m-%d %H:%M:%S")

    db.session.delete(visit)

    # Notify the marketer (if they still exist and are not the one deleting)
    marketer = User.query.get(marketer_id)
    if marketer and marketer.id != current_user_id:
        create_notification(
            user_id=marketer.id,
            message=f"Your visit with {doctor_name} at {location} on {visit_date} was deleted by {user.username}."
        )

    db.session.commit()

    return jsonify({"message": "Visit deleted successfully"}), 200
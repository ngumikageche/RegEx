from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from database import db
from app.models.visit import Visit
from app.models.user import User
from app.models.notification import Notification

visit_bp = Blueprint("visit", __name__, url_prefix="/visit")

# Helper function to create a notification
def create_notification(user_id, message, commit=False):
    print(f"Creating notification for user_id {user_id}: {message}")
    notification = Notification(user_id=user_id, message=message)
    db.session.add(notification)
    if commit:
        print("Committing notification to database...")
        db.session.commit()

@visit_bp.route("/", methods=["POST"])
@jwt_required()
def log_visit():
    print("Received POST request to /visit/")
    current_user_id = get_jwt_identity()
    print(f"Current user ID from JWT: {current_user_id}")

    user = User.query.get(current_user_id)
    if not user:
        print("User not found.")
        return jsonify({"error": "User not found."}), 404

    print(f"User found: {user.username}, Role: {user.role}")

    data = request.json
    print(f"Received data: {data}")
    doctor_name = data.get("doctor_name")
    location = data.get("location")
    visit_date = data.get("visit_date")
    notes = data.get("notes", "")

    if not doctor_name or not location or not visit_date:
        missing_fields = []
        if not doctor_name: missing_fields.append("doctor_name")
        if not location: missing_fields.append("location")
        if not visit_date: missing_fields.append("visit_date")
        print(f"Missing required fields: {missing_fields}")
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}."}), 400

    try:
        visit_date = datetime.strptime(visit_date, "%Y-%m-%d %H:%M:%S")
        print(f"Parsed visit_date: {visit_date}")
    except ValueError as e:
        print(f"Invalid date format: {e}")
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD HH:MM:SS."}), 400

    new_visit = Visit(
        user_id=current_user_id,
        doctor_name=doctor_name,
        location=location,
        visit_date=visit_date,
        notes=notes
    )

    print("Adding new visit to database...")
    db.session.add(new_visit)
    db.session.commit()
    print("Visit added successfully.")

    # Notify the user who logged the visit
    print("Creating notification for user...")
    create_notification(
        user_id=current_user_id,
        message=f"You logged a visit with {doctor_name} at {location} on {visit_date.strftime('%Y-%m-%d %H:%M:%S')}.",
        commit=True
    )

    # Notify all admins
    admins = User.query.filter_by(role="admin").all()
    print(f"Found {len(admins)} admins to notify.")
    for admin in admins:
        print(f"Notifying admin {admin.username}...")
        create_notification(
            user_id=admin.id,
            message=f"User {user.username} logged a visit with {doctor_name} at {location} on {visit_date.strftime('%Y-%m-%d %H:%M:%S')}.",
            commit=True
        )

    print("Visit logged successfully, returning response.")
    return jsonify({"message": "Visit logged successfully"}), 201

@visit_bp.route("/", methods=["GET"])
@jwt_required()
def get_visits():
    print("Received GET request to /visit/")
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        print("User not found.")
        return jsonify({"error": "User not found."}), 404

    query = Visit.query

    if user.role != "admin":
        # Non-admin users can only see their own visits
        print("Filtering visits for user...")
        query = query.filter_by(user_id=user.id)  # Updated from marketer_id
    else:
        # Admins can see all visits, with optional filters
        print("Applying admin filters...")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        user_id = request.args.get("user_id")  # Updated from marketer_id
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
        if user_id:
            query = query.filter(Visit.user_id == int(user_id))  # Updated from marketer_id
        if doctor_name:
            query = query.filter(Visit.doctor_name.ilike(f"%{doctor_name}%"))

    visits = query.all()
    print(f"Returning {len(visits)} visits.")

    return jsonify({
        "visits": [
            {
                "id": visit.id,
                "user_id": visit.user_id,  # Updated from marketer_id
                "user_name": f"{visit.user.first_name} {visit.user.last_name}".strip(),  # Updated from marketer_name
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
    print(f"Received PUT request to /visit/{visit_id}")
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        print("User not found.")
        return jsonify({"error": "User not found."}), 404

    visit = Visit.query.get_or_404(visit_id)

    if user.role != "admin" and visit.user_id != current_user_id:  # Updated from marketer_id
        print("Unauthorized: Not the owner of this visit.")
        return jsonify({"error": "Unauthorized. You can only update your own visits."}), 403

    data = request.json
    print(f"Received update data: {data}")
    visit.doctor_name = data.get("doctor_name", visit.doctor_name)
    visit.location = data.get("location", visit.location)
    visit.notes = data.get("notes", visit.notes)

    if "visit_date" in data:
        try:
            visit.visit_date = datetime.strptime(data["visit_date"], "%Y-%m-%d %H:%M:%S")
            print(f"Updated visit_date: {visit.visit_date}")
        except ValueError:
            print("Invalid date format.")
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD HH:MM:SS."}), 400

    db.session.commit()
    print("Visit updated successfully.")

    return jsonify({"message": "Visit updated successfully"}), 200

@visit_bp.route("/<int:visit_id>", methods=["DELETE"])
@jwt_required()
def delete_visit(visit_id):
    print(f"Received DELETE request to /visit/{visit_id}")
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        print("User not found.")
        return jsonify({"error": "User not found."}), 404

    if user.role != "admin" and user.id != Visit.query.get(visit_id).user_id:  # Updated from marketer_id
        print("Unauthorized: User is neither an admin nor the owner of this visit.")
        return jsonify({"error": "Unauthorized. You can only delete your own visits unless you are an admin."}), 403

    visit = Visit.query.get_or_404(visit_id)

    user_id = visit.user_id  # Updated from marketer_id
    doctor_name = visit.doctor_name
    location = visit.location
    visit_date = visit.visit_date.strftime("%Y-%m-%d %H:%M:%S")

    db.session.delete(visit)

    visit_user = User.query.get(user_id)
    if visit_user and visit_user.id != current_user_id:
        print("Notifying user of deletion...")
        create_notification(
            user_id=visit_user.id,
            message=f"Your visit with {doctor_name} at {location} on {visit_date} was deleted by {user.username}.",
            commit=True
        )

    db.session.commit()
    print("Visit deleted successfully.")

    return jsonify({"message": "Visit deleted successfully"}), 200
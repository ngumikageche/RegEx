from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from app.models.report import Report
from app.models.visit import Visit

report_bp = Blueprint("report", __name__, url_prefix="/report")

# Get all reports (admin sees all, users see their own)
# New route: Get all visits as a report (admin only)
@report_bp.route("/all-visits", methods=["GET"])
@jwt_required()
def get_all_visits_report():
    user_role = request.headers.get("X-User-Role")  # Assumes role is passed in headers

    # Restrict access to admins only
    if user_role != "admin":
        return jsonify({"error": "Unauthorized: Only admins can access this report."}), 403

    # Fetch all visits from the database
    visits = Visit.query.all()

    # Format the visits into a report-like structure
    report_data = [
        {
            "id": visit.id,
            "user_id": visit.user_id,
            "doctor_name": visit.doctor_name,
            "location": visit.location,
            "visit_date": visit.visit_date.isoformat(),
            "notes": visit.notes if visit.notes else "No notes provided",
            "created_at": visit.created_at.isoformat(),
            "updated_at": visit.updated_at.isoformat() if visit.updated_at else None
        }
        for visit in visits
    ]

    return jsonify({
        "report": {
            "title": "All Visits Report",
            "generated_at": datetime.utcnow().isoformat(),
            "total_visits": len(report_data),
            "visits": report_data
        }
    }), 200

@report_bp.route("/", methods=["GET"])
@jwt_required()
def get_reports():
    current_user_id = get_jwt_identity()
    user_role = request.headers.get("X-User-Role")  # Assumes role is passed in headers

    if user_role == "admin":
        reports = Report.query.all()
    else:
        reports = Report.query.filter_by(user_id=current_user_id).all()

    return jsonify({
        "reports": [
            {
                "id": report.id,
                "visit_id": report.visit_id,
                "user_id": report.user_id,
                "title": report.title,
                "report_text": report.report_text,
                "created_at": report.created_at.isoformat(),
                "updated_at": report.updated_at.isoformat(),
                "visit": {
                    "doctor_name": report.visit.doctor_name,
                    "location": report.visit.location,
                    "visit_date": report.visit.visit_date.isoformat()
                }
            }
            for report in reports
        ]
    }), 200

# Get a single report by ID
@report_bp.route("/<int:report_id>", methods=["GET"])
@jwt_required()
def get_report(report_id):
    current_user_id = get_jwt_identity()
    user_role = request.headers.get("X-User-Role")

    report = Report.query.get_or_404(report_id)

    if user_role != "admin" and report.user_id != current_user_id:
        return jsonify({"error": "Unauthorized access to this report."}), 403

    return jsonify({
        "id": report.id,
        "visit_id": report.visit_id,
        "user_id": report.user_id,
        "title": report.title,
        "report_text": report.report_text,
        "created_at": report.created_at.isoformat(),
        "updated_at": report.updated_at.isoformat(),
        "visit": {
            "doctor_name": report.visit.doctor_name,
            "location": report.visit.location,
            "visit_date": report.visit.visit_date.isoformat()
        }
    }), 200

# Create a new report
@report_bp.route("/", methods=["POST"])
@jwt_required()
def create_report():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get("visit_id") or not data.get("title") or not data.get("report_text"):
        return jsonify({"error": "Missing required fields: visit_id, title, report_text."}), 400

    # Verify the visit exists and belongs to the user
    visit = Visit.query.get_or_404(data["visit_id"])
    if visit.user_id != current_user_id:
        return jsonify({"error": "Unauthorized: You can only create reports for your own visits."}), 403

    report = Report(
        visit_id=data["visit_id"],
        user_id=current_user_id,
        title=data["title"],
        report_text=data["report_text"]
    )

    db.session.add(report)
    db.session.commit()

    return jsonify({"message": "Report created successfully.", "report_id": report.id}), 201

# Update a report
@report_bp.route("/<int:report_id>", methods=["PUT"])
@jwt_required()
def update_report(report_id):
    current_user_id = get_jwt_identity()
    user_role = request.headers.get("X-User-Role")

    report = Report.query.get_or_404(report_id)

    if user_role != "admin" and report.user_id != current_user_id:
        return jsonify({"error": "Unauthorized: You can only update your own reports."}), 403

    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided."}), 400

    if "title" in data:
        report.title = data["title"]
    if "report_text" in data:
        report.report_text = data["report_text"]

    db.session.commit()

    return jsonify({"message": "Report updated successfully."}), 200

# Delete a report
@report_bp.route("/<int:report_id>", methods=["DELETE"])
@jwt_required()
def delete_report(report_id):
    current_user_id = get_jwt_identity()
    user_role = request.headers.get("X-User-Role")

    report = Report.query.get_or_404(report_id)

    if user_role != "admin" and report.user_id != current_user_id:
        return jsonify({"error": "Unauthorized: You can only delete your own reports."}), 403

    db.session.delete(report)
    db.session.commit()

    return jsonify({"message": "Report deleted successfully."}), 200
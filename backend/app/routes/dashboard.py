from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")

@dashboard_bp.route("/", methods=["GET"])
@jwt_required()
def dashboard():
    current_user = get_jwt_identity()
    print("JWT Identity:", current_user)  # Debugging
    user_role = current_user.get("role")  # Assuming role is stored in JWT token

    if user_role == "admin":
        return jsonify({"message": "Welcome to the Admin Panel", "panel": "admin"})
    else:
        return jsonify({"message": "Welcome to the User Panel", "panel": "user"})


@dashboard_bp.route("/admin/", methods=["GET"])
@jwt_required()
def admin_panel():
    current_user = get_jwt_identity()
    if current_user.get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 403
    return jsonify({"message": "Admin Panel"})


@dashboard_bp.route("/admin/users", methods=["GET"])
@jwt_required()
def manage_users():
    current_user = get_jwt_identity()
    if current_user.get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 403
    return jsonify({"message": "Manage Users"})


@dashboard_bp.route("/admin/settings", methods=["GET"])
@jwt_required()
def admin_settings():
    current_user = get_jwt_identity()
    if current_user.get("role") != "admin":
        return jsonify({"error": "Unauthorized"}), 403
    return jsonify({"message": "Admin Settings"})


@dashboard_bp.route("/user/", methods=["GET"])
@jwt_required()
def user_panel():
    return jsonify({"message": "User Panel"})


@dashboard_bp.route("/user/settings", methods=["GET"])
@jwt_required()
def user_settings():
    return jsonify({"message": "User Settings"})

# app/routes/user.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from database import db
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()
user_bp = Blueprint("user", __name__, url_prefix="/users")

# --------------------------
# GET ALL USERS (Admin Only)
# --------------------------
@user_bp.route("/users", methods=["GET"])
@jwt_required()
def get_all_users():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.role != "admin":
        return jsonify({"error": "Unauthorized. Only admins can view users."}), 403

    users = User.query.all()
    user_list = [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "address": user.address,
            "city": user.city,
            "country": user.country,
            "postal_code": user.postal_code,
            "about_me": user.about_me,
        }
        for user in users
    ]

    return jsonify(user_list), 200

# ----------------------
# GET A SINGLE USER
# ----------------------
@user_bp.route("/users/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user(user_id):
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "address": user.address,
        "city": user.city,
        "country": user.country,
        "postal_code": user.postal_code,
        "about_me": user.about_me,
    }), 200

# ----------------------------
# UPDATE USER DETAILS (Admin Only)
# ----------------------------
@user_bp.route("/users/<int:user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.role != "admin":
        return jsonify({"error": "Unauthorized. Only admins can update users."}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.json
    user.username = data.get("username", user.username)
    user.email = data.get("email", user.email)
    user.role = data.get("role", user.role)  # Only admin can change roles
    user.first_name = data.get("firstName", user.first_name)
    user.last_name = data.get("lastName", user.last_name)
    user.address = data.get("address", user.address)
    user.city = data.get("city", user.city)
    user.country = data.get("country", user.country)
    user.postal_code = data.get("postalCode", user.postal_code)
    user.about_me = data.get("aboutMe", user.about_me)

    db.session.commit()
    return jsonify({"message": "User updated successfully"}), 200

# ----------------------------
# CHANGE PASSWORD (User Only)
# ----------------------------
@user_bp.route("/users/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.json
    old_password = data.get("old_password")
    new_password = data.get("new_password")

    if not user.check_password(old_password):
        return jsonify({"error": "Old password is incorrect"}), 400

    user.set_password(new_password)
    db.session.commit()

    return jsonify({"message": "Password updated successfully"}), 200

# ----------------------------
# DELETE USER (Admin Only)
# ----------------------------
@user_bp.route("/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.role != "admin":
        return jsonify({"error": "Unauthorized. Only admins can delete users."}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted successfully"}), 200

# --------------------------
# GET CURRENT LOGGED-IN USER
# --------------------------
@user_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "address": user.address,
        "city": user.city,
        "country": user.country,
        "postal_code": user.postal_code,
        "about_me": user.about_me,
    }), 200
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User
from database import db
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "user")  # Default role is "user"

    # Ensure all fields are provided
    if not username or not email or not password:
        return jsonify({"message": "All fields are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 400

    new_user = User(username=username, email=email, role=role)
    new_user.set_password(password)  # Hash password before saving
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Wrong email or password"}), 401

    access_token = create_access_token(identity={"id": user.id, "role": user.role})
    
    return jsonify({"token": access_token, "role": user.role}), 200


@auth_bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    user_identity = get_jwt_identity()
    return jsonify({"id": user_identity["id"], "role": user_identity["role"]})

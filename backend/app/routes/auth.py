from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User
from database import db
from flask_bcrypt import Bcrypt
from flask_cors import CORS

auth_bp = Blueprint("auth", __name__)
bcrypt = Bcrypt()

# Allow CORS
CORS(auth_bp)

@auth_bp.route("/register", methods=["POST"])
@jwt_required()  # Only logged-in users can register others
def register():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.role != "admin":
        return jsonify({"error": "Unauthorized. Only admins can register users."}), 403

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

    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        "token": access_token,
        "role": user.role
    }), 200


@auth_bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"id": user.id, "role": user.role})

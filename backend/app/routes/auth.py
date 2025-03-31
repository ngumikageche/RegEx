# app/routes/auth.py
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
from app.models.user import User
from database import db
from flask_bcrypt import Bcrypt
from flask_cors import CORS

auth_bp = Blueprint("auth", __name__)
bcrypt = Bcrypt()

# Allow CORS
CORS(auth_bp, origins="http://localhost:3000", supports_credentials=True)

@auth_bp.route("/register", methods=["POST"])
@jwt_required()
def register():
    try:
        current_app.logger.info("Register request received")
        current_app.logger.debug(f"Headers: {request.headers}")
        current_app.logger.debug(f"Raw Data: {request.data}")
        current_app.logger.debug(f"JSON Data: {request.get_json()}")

        data = request.json
        if not data:
            current_app.logger.warning("Invalid or missing JSON payload in register request")
            return jsonify({"error": "Invalid or missing JSON payload"}), 400

        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", "user")

        if not username or not email or not password:
            current_app.logger.warning("Missing required fields in register request")
            return jsonify({"message": "All fields are required"}), 400

        # Check if user already exists
        if User.query.filter_by(email=email).first():
            current_app.logger.warning(f"User with email {email} already exists")
            return jsonify({"message": "User with this email already exists"}), 400

        # Hash the password
        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
        new_user = User(username=username, email=email, password=hashed_password, role=role)
        db.session.add(new_user)
        db.session.commit()

        current_app.logger.info(f"User registered successfully: {email}")
        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        current_app.logger.error(f"Error during registration: {str(e)}")
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        current_app.logger.info("Login request received")
        data = request.json
        email = data.get("email")
        password = data.get("password")

        current_app.logger.debug(f"Login attempt for email: {email}")

        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            current_app.logger.warning(f"Failed login attempt for email: {email}")
            return jsonify({"error": "Wrong email or password"}), 401

        # Create a token with a 15-minute expiration
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(minutes=15)
        )
        
        current_app.logger.info(f"User logged in successfully: {email}")
        return jsonify({
            "token": access_token,
            "role": user.role
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error during login: {str(e)}")
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    try:
        current_app.logger.info("Protected endpoint accessed")
        user_id = get_jwt_identity()
        current_app.logger.debug(f"User ID from token: {user_id}")

        user = User.query.get(user_id)
        if not user:
            current_app.logger.warning(f"User not found for ID: {user_id}")
            return jsonify({"error": "User not found"}), 404

        current_app.logger.info(f"User data retrieved: {user.id}, {user.username}")
        return jsonify({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error in /protected endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/logout", methods=["POST"])
def logout():
    try:
        current_app.logger.info("Logout request received")
        if not request.is_json:
            current_app.logger.warning("Logout request must be JSON")
            return jsonify({"error": "Request must be JSON"}), 400
        
        current_app.logger.info("User logged out successfully")
        return jsonify({"message": "Logged out successfully"}), 200
    
    except Exception as e:
        current_app.logger.error(f"Error during logout: {str(e)}")
        return jsonify({"error": str(e)}), 500
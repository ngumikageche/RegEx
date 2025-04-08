# app/routes/auth.py
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from datetime import timedelta
from app.models.user import User
from database import db
from flask_bcrypt import Bcrypt

auth_bp = Blueprint("auth", __name__)
bcrypt = Bcrypt()

# app/routes/auth.py
@auth_bp.route("/register", methods=["POST"])
@jwt_required()
def register():
    try:
        current_app.logger.info("Register request received")
        current_app.logger.debug(f"Headers: {request.headers}")
        current_app.logger.debug(f"Raw Data: {request.data}")
        current_app.logger.debug(f"JSON Data: {request.get_json()}")

        jwt_data = get_jwt()
        current_app.logger.debug(f"JWT claims: {jwt_data}")
        user_id = get_jwt_identity()
        current_app.logger.debug(f"User ID from token: {user_id}")

        user = User.query.get(user_id)
        if not user:
            current_app.logger.warning(f"User not found for ID: {user_id}")
            return jsonify({"message": "User not found"}), 404

        if user.role != "admin":
            current_app.logger.warning(f"Non-admin user {user_id} attempted to register a new user")
            return jsonify({"message": "Only admins can register new users"}), 403

        data = request.json
        if not data:
            current_app.logger.warning("Invalid or missing JSON payload in register request")
            return jsonify({"error": "Invalid or missing JSON payload"}), 400

        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role", "user")

        current_app.logger.debug(f"Received data - username: {username}, email: {email}, role: {role}")

        if not username or not email or not password:
            current_app.logger.warning("Missing required fields in register request")
            return jsonify({"message": "All fields are required"}), 400

        if len(password) < 6:
            current_app.logger.warning("Password too short in register request")
            return jsonify({"message": "Password must be at least 6 characters long"}), 400

        if role not in ["doctor", "admin", "marketer"]:
            current_app.logger.warning(f"Invalid role provided: {role}")
            return jsonify({"message": "Invalid role. Must be 'doctor', 'admin', or 'marketer'"}), 400

        if User.query.filter_by(email=email).first():
            current_app.logger.warning(f"User with email {email} already exists")
            return jsonify({"message": "User with this email already exists"}), 400

        if User.query.filter_by(username=username).first():
            current_app.logger.warning(f"User with username {username} already exists")
            return jsonify({"message": "User with this username already exists"}), 400

        new_user = User(username=username, email=email, role=role)
        new_user.set_password(password)
        current_app.logger.debug(f"New user password hash: {new_user.password_hash}")
        db.session.add(new_user)
        db.session.commit()

        current_app.logger.info(f"User registered successfully: {email}")
        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        current_app.logger.error(f"Error during registration: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500
# app/routes/auth.py
@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        current_app.logger.info("Login request received")
        data = request.json
        email = data.get("email")
        password = data.get("password")

        current_app.logger.debug(f"Login attempt for email: {email}")
        current_app.logger.debug(f"Provided password: {password}")

        user = User.query.filter_by(email=email).first()

        if not user:
            current_app.logger.warning(f"User not found for email: {email}")
            return jsonify({"error": "Wrong email or password"}), 401

        current_app.logger.debug(f"Stored password hash: {user.password_hash}")
        if not user.check_password(password):
            current_app.logger.warning(f"Password verification failed for email: {email}")
            return jsonify({"error": "Wrong email or password"}), 401

        access_token = create_access_token(
            identity=str(user.id),
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

        # Since user_id is now a string, convert it to an integer for the query
        user = User.query.get(int(user_id))
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
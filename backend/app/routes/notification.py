# app/routes/notification.py
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from app.models.notification import Notification
from app.models.user import User

notification_bp = Blueprint("notification", __name__, url_prefix="/notifications")

# Create a notification (admin or system-triggered)
@notification_bp.route("/", methods=["POST"])
@jwt_required()
def create_notification():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.role != "admin":
        return jsonify({"error": "Unauthorized. Only admins can create notifications."}), 403

    data = request.json
    user_id = data.get("user_id")
    message = data.get("message")

    if not user_id or not message:
        return jsonify({"error": "User ID and message are required."}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    new_notification = Notification(user_id=user_id, message=message)
    db.session.add(new_notification)
    db.session.commit()

    return jsonify({"message": "Notification created successfully"}), 201

# Get all notifications for the logged-in user
@notification_bp.route("/", methods=["GET"])
@jwt_required()
def get_notifications():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"error": "User not found."}), 404

    notifications = Notification.query.filter_by(user_id=current_user_id).order_by(Notification.created_at.desc()).all()

    return jsonify({
        "notifications": [
            {
                "id": notification.id,
                "user_id": notification.user_id,
                "message": notification.message,
                "is_read": notification.is_read,
                "created_at": notification.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            }
            for notification in notifications
        ]
    }), 200

# Mark a notification as read
@notification_bp.route("/<int:notification_id>/read", methods=["PUT"])
@jwt_required()
def mark_notification_as_read(notification_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"error": "User not found."}), 404

    notification = Notification.query.get(notification_id)
    if not notification:
        return jsonify({"error": "Notification not found."}), 404

    if notification.user_id != current_user_id:
        return jsonify({"error": "Unauthorized. You can only mark your own notifications as read."}), 403

    notification.is_read = True
    db.session.commit()

    return jsonify({"message": "Notification marked as read"}), 200

# Delete a notification
@notification_bp.route("/<int:notification_id>", methods=["DELETE"])
@jwt_required()
def delete_notification(notification_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"error": "User not found."}), 404

    notification = Notification.query.get(notification_id)
    if not notification:
        return jsonify({"error": "Notification not found."}), 404

    if notification.user_id != current_user_id and user.role != "admin":
        return jsonify({"error": "Unauthorized. You can only delete your own notifications."}), 403

    db.session.delete(notification)
    db.session.commit()

    return jsonify({"message": "Notification deleted successfully"}), 200
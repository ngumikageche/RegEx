# app/routes/usergroups.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from app.models.user import User
from app.models.usergroups import UserGroup

usergroups_bp = Blueprint("usergroups", __name__, url_prefix="/usergroups")

"""
POST /usergroups/
Requires: JSON { "name": str, "description": str (optional) }
Response: { "message": str, "group_id": int }
Admin only
"""
@usergroups_bp.route("/", methods=["POST"])
@jwt_required()
def create_group():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or current_user.role != "admin":
        return jsonify({"error": "Unauthorized. Only admins can create groups."}), 403
    data = request.get_json()
    name = data.get("name")
    description = data.get("description")
    if not name:
        return jsonify({"error": "Group name is required."}), 400
    if UserGroup.query.filter_by(name=name).first():
        return jsonify({"error": "Group with this name already exists."}), 400
    group = UserGroup(name=name, description=description)
    db.session.add(group)
    db.session.commit()
    return jsonify({"message": "Group created successfully", "group_id": group.id}), 201

"""
POST /usergroups/<group_id>/assign
Requires: JSON { "user_ids": [int, ...] }
Response: { "message": str }
Admin only
"""
@usergroups_bp.route("/<int:group_id>/assign", methods=["POST"])
@jwt_required()
def assign_users_to_group(group_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or current_user.role != "admin":
        return jsonify({"error": "Unauthorized. Only admins can assign users."}), 403
    group = UserGroup.query.get(group_id)
    if not group:
        return jsonify({"error": "Group not found."}), 404
    data = request.get_json()
    user_ids = data.get("user_ids", [])
    if not user_ids:
        return jsonify({"error": "No user IDs provided."}), 400
    users = User.query.filter(User.id.in_(user_ids)).all()
    for user in users:
        if user not in group.users:
            group.users.append(user)
    db.session.commit()
    return jsonify({"message": "Users assigned to group successfully"}), 200

"""
POST /usergroups/<group_id>/remove
Requires: JSON { "user_ids": [int, ...] }
Response: { "message": str }
Admin only
"""
@usergroups_bp.route("/<int:group_id>/remove", methods=["POST"])
@jwt_required()
def remove_users_from_group(group_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or current_user.role != "admin":
        return jsonify({"error": "Unauthorized. Only admins can remove users."}), 403
    group = UserGroup.query.get(group_id)
    if not group:
        return jsonify({"error": "Group not found."}), 404
    data = request.get_json()
    user_ids = data.get("user_ids", [])
    if not user_ids:
        return jsonify({"error": "No user IDs provided."}), 400
    users = User.query.filter(User.id.in_(user_ids)).all()
    for user in users:
        if user in group.users:
            group.users.remove(user)
    db.session.commit()
    return jsonify({"message": "Users removed from group successfully"}), 200

"""
DELETE /usergroups/<group_id>
Requires: None
Response: { "message": str }
Admin only
"""
@usergroups_bp.route("/<int:group_id>", methods=["DELETE"])
@jwt_required()
def delete_group(group_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or current_user.role != "admin":
        return jsonify({"error": "Unauthorized. Only admins can delete groups."}), 403
    group = UserGroup.query.get(group_id)
    if not group:
        return jsonify({"error": "Group not found."}), 404
    db.session.delete(group)
    db.session.commit()
    return jsonify({"message": "Group deleted successfully"}), 200

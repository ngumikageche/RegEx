

# app/routes/usergroups.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from app.models.user import User
from app.models.usergroups import UserGroup

usergroups_bp = Blueprint("usergroups", __name__, url_prefix="/usergroups")

"""
GET /usergroups/all
Returns all user groups
Response: { "groups": [ { "id": int, "name": str, "description": str } ] }
JWT required
"""
@usergroups_bp.route("/all", methods=["GET"])
@jwt_required()
def get_all_user_groups():
    groups = UserGroup.query.all()
    return jsonify({
        "groups": [
            {
                "id": group.id,
                "name": group.name,
                "description": group.description
            } for group in groups
        ]
    }), 200

"""
GET /usergroups/user/<user_id>/role
Returns the role of the user
Response: { "user_id": int, "role": str }
JWT required
"""
@usergroups_bp.route("/user/<int:user_id>/role", methods=["GET"])
@jwt_required()
def get_user_role(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404
    return jsonify({"user_id": user.id, "role": user.role}), 200

"""
POST /usergroups/create
Requires: JSON { "name": str, "description": str (optional) }
Response: { "message": str, "group_id": int }
Admin only
"""
@usergroups_bp.route("/create", methods=["POST"])
@jwt_required()
def create_group():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or current_user.role != "admin":
        return jsonify({"error": "Unauthorized. Only admins can create groups."}), 403
    data = request.get_json()
    name = data.get("name")
    description = data.get("description")
    if not name or not isinstance(name, str) or not name.strip():
        return jsonify({"error": "Group name is required and must be a non-empty string."}), 400
    if description is not None and not isinstance(description, str):
        return jsonify({"error": "Description must be a string."}), 400
    if UserGroup.query.filter_by(name=name.strip()).first():
        return jsonify({"error": "Group with this name already exists."}), 400
    group = UserGroup(name=name.strip(), description=description.strip() if description else None)
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
    if not isinstance(user_ids, list) or not user_ids or not all(isinstance(uid, int) for uid in user_ids):
        return jsonify({"error": "user_ids must be a non-empty list of integers."}), 400
    users = User.query.filter(User.id.in_(user_ids)).all()
    if not users:
        return jsonify({"error": "No valid users found for provided IDs."}), 400
    added = 0
    for user in users:
        if user not in group.users:
            group.users.append(user)
            added += 1
    db.session.commit()
    if added == 0:
        return jsonify({"message": "No new users were assigned (all already in group)."}), 200
    return jsonify({"message": f"{added} users assigned to group successfully"}), 200

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
    if not isinstance(user_ids, list) or not user_ids or not all(isinstance(uid, int) for uid in user_ids):
        return jsonify({"error": "user_ids must be a non-empty list of integers."}), 400
    users = User.query.filter(User.id.in_(user_ids)).all()
    if not users:
        return jsonify({"error": "No valid users found for provided IDs."}), 400
    removed = 0
    for user in users:
        if user in group.users:
            group.users.remove(user)
            removed += 1
    db.session.commit()
    if removed == 0:
        return jsonify({"message": "No users were removed (none were in group)."}), 200
    return jsonify({"message": f"{removed} users removed from group successfully"}), 200

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

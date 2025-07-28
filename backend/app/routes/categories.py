# app/routes/categories.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from app.models.user import User
from app.models.category import Category

categories_bp = Blueprint("categories", __name__, url_prefix="/categories")

# Create a new category
@categories_bp.route("/", methods=["POST"])
@jwt_required()
def create_category():
    data = request.json
    name = data.get("name")
    description = data.get("description")
    user_id = get_jwt_identity()

    if not name:
        return jsonify({"error": "Name is required."}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    if Category.query.filter_by(name=name).first():
        return jsonify({"error": "Category with this name already exists."}), 400

    category = Category(name=name, description=description, user_id=user_id)
    db.session.add(category)
    db.session.commit()
    return jsonify({"message": "Category created successfully", "category_id": category.id}), 201

# Get all categories
@categories_bp.route("/", methods=["GET"])
@jwt_required()
def get_categories():
    categories = Category.query.all()
    return jsonify({
        "categories": [
            {
                "id": c.id,
                "name": c.name,
                "description": c.description,
                "user_id": c.user_id
            } for c in categories
        ]
    }), 200

# Get a single category
@categories_bp.route("/<int:category_id>", methods=["GET"])
@jwt_required()
def get_category(category_id):
    category = Category.query.get(category_id)
    if not category:
        return jsonify({"error": "Category not found."}), 404
    return jsonify({
        "id": category.id,
        "name": category.name,
        "description": category.description,
        "user_id": category.user_id
    }), 200

# Update a category
@categories_bp.route("/<int:category_id>", methods=["PUT"])
@jwt_required()
def update_category(category_id):
    category = Category.query.get(category_id)
    if not category:
        return jsonify({"error": "Category not found."}), 404
    data = request.json
    category.name = data.get("name", category.name)
    category.description = data.get("description", category.description)
    db.session.commit()
    return jsonify({"message": "Category updated successfully"}), 200

# Delete a category
@categories_bp.route("/<int:category_id>", methods=["DELETE"])
@jwt_required()
def delete_category(category_id):
    category = Category.query.get(category_id)
    if not category:
        return jsonify({"error": "Category not found."}), 404
    db.session.delete(category)
    db.session.commit()
    return jsonify({"message": "Category deleted successfully"}), 200

# app/routes/products.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from app.models.user import User
from app.models.category import Category
from app.models.catalogue import Product

products_bp = Blueprint("products", __name__, url_prefix="/products")

# Create a new product
@products_bp.route("/", methods=["POST"])
@jwt_required()
def create_product():
    data = request.json
    name = data.get("name")
    description = data.get("description")
    price = data.get("price")
    category_id = data.get("category_id")
    user_id = get_jwt_identity()

    if not all([name, price, category_id]):
        return jsonify({"error": "Name, price, and category_id are required."}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    category = Category.query.get(category_id)
    if not category:
        return jsonify({"error": "Category not found."}), 404

    product = Product(name=name, description=description, price=price, user_id=user_id, category_id=category_id)
    db.session.add(product)
    db.session.commit()
    return jsonify({"message": "Product created successfully", "product_id": product.id}), 201

# Get all products
@products_bp.route("/", methods=["GET"])
@jwt_required()
def get_products():
    products = Product.query.all()
    return jsonify({
        "products": [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "price": p.price,
                "user_id": p.user_id,
                "category_id": p.category_id,
                "images": [
                    {
                        "id": img.id,
                        "name": img.name,
                        "url": img.url,
                        "color": img.color
                    } for img in getattr(p, 'images', [])
                ]
            } for p in products
        ]
    }), 200

# Get a single product
@products_bp.route("/<int:product_id>", methods=["GET"])
@jwt_required()
def get_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found."}), 404
    return jsonify({
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "user_id": product.user_id,
        "category_id": product.category_id,
        "images": [
            {
                "id": img.id,
                "name": img.name,
                "url": img.url,
                "color": img.color
            } for img in getattr(product, 'images', [])
        ]
    }), 200

# Update a product
@products_bp.route("/<int:product_id>", methods=["PUT"])
@jwt_required()
def update_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found."}), 404
    data = request.json
    product.name = data.get("name", product.name)
    product.description = data.get("description", product.description)
    product.price = data.get("price", product.price)
    product.category_id = data.get("category_id", product.category_id)
    db.session.commit()
    return jsonify({"message": "Product updated successfully"}), 200

# Delete a product
@products_bp.route("/<int:product_id>", methods=["DELETE"])
@jwt_required()
def delete_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found."}), 404
    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Product deleted successfully"}), 200

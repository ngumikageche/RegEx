# app/routes/public.py
"""Public, read-only endpoints for external sites to query products, categories, and images.
No authentication required. Returns simplified, cache-friendly payloads.
"""
from flask import Blueprint, jsonify, request, current_app
from app.models.catalogue import Product
from app.models.category import Category
from app.models.image import Image
from sqlalchemy import asc, desc

public_bp = Blueprint("public", __name__)

def _check_api_key():
    required_key = current_app.config.get("PUBLIC_API_KEY")
    if required_key:  # Only enforce if configured
        provided = request.headers.get("X-API-Key")
        if not provided or provided != required_key:
            return False
    return True

# Utility: pagination params

def _pagination_params():
    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 20))
    except ValueError:
        page, per_page = 1, 20
    per_page = min(per_page, 100)
    return page, per_page

@public_bp.route("/products", methods=["GET"])
def public_products():
    if not _check_api_key():
        return jsonify({"error": "Invalid or missing API key"}), 401
    page, per_page = _pagination_params()
    sort = request.args.get("sort", "created")  # name|price|created
    direction = request.args.get("direction", "desc")  # asc|desc
    q = request.args.get("q")
    category_id = request.args.get("category_id")

    query = Product.query
    if q:
        like = f"%{q}%"
        query = query.filter(Product.name.ilike(like))
    if category_id:
        try:
            query = query.filter(Product.category_id == int(category_id))
        except ValueError:
            pass

    sort_map = {
        "name": Product.name,
        "price": Product.price,
        "created": Product.created_at if hasattr(Product, "created_at") else Product.id
    }
    sort_col = sort_map.get(sort, sort_map["created"])  # default
    if direction == "asc":
        query = query.order_by(asc(sort_col))
    else:
        query = query.order_by(desc(sort_col))

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    items = [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": p.price,
            "category_id": p.category_id,
            "image_urls": [img.url for img in getattr(p, 'images', [])]
        } for p in pagination.items
    ]
    return jsonify({
        "page": page,
        "per_page": per_page,
        "total": pagination.total,
        "pages": pagination.pages,
        "products": items
    })

@public_bp.route("/categories", methods=["GET"])
def public_categories():
    if not _check_api_key():
        return jsonify({"error": "Invalid or missing API key"}), 401
    categories = Category.query.order_by(Category.name.asc()).all()
    return jsonify({
        "categories": [
            {"id": c.id, "name": c.name, "description": c.description}
            for c in categories
        ]
    })

@public_bp.route("/products/<int:product_id>", methods=["GET"])
def public_product_detail(product_id):
    if not _check_api_key():
        return jsonify({"error": "Invalid or missing API key"}), 401
    product = Product.query.get_or_404(product_id)
    return jsonify({
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "category_id": product.category_id,
        "images": [
            {"id": img.id, "name": img.name, "url": img.url, "color": img.color}
            for img in getattr(product, 'images', [])
        ]
    })

@public_bp.route("/images", methods=["GET"])
def public_images():
    if not _check_api_key():
        return jsonify({"error": "Invalid or missing API key"}), 401
    page, per_page = _pagination_params()
    product_id = request.args.get("product_id")
    query = Image.query
    if product_id:
        try:
            query = query.filter(Image.product_id == int(product_id))
        except ValueError:
            pass
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    items = [
        {"id": img.id, "name": img.name, "url": img.url, "color": img.color, "product_id": img.product_id}
        for img in pagination.items
    ]
    return jsonify({
        "page": page,
        "per_page": per_page,
        "total": pagination.total,
        "pages": pagination.pages,
        "images": items
    })

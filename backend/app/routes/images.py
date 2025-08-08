# app/routes/images.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from app.models.user import User
from app.models.catalogue import Product
from app.models.image import Image
import cloudinary
import cloudinary.uploader
import os


images_bp = Blueprint("images", __name__, url_prefix="/images")

# Configure Cloudinary: use CLOUDINARY_URL if present, else fallback to explicit config
cloudinary_url = os.getenv("CLOUDINARY_URL")
if cloudinary_url:
    cloudinary.config(cloudinary_url=cloudinary_url)
else:
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET")
    )

"""
POST /images/
Requires: multipart/form-data with 'file', 'name', 'color', 'product_id'
Response: { "message": str, "image_id": int, "url": str }
"""
@images_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_image():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404
    if 'file' not in request.files:
        return jsonify({"error": "No file part in request."}), 400
    file = request.files['file']
    name = request.form.get('name')
    color = request.form.get('color')
    product_id = request.form.get('product_id')
    if not all([file, name, product_id]):
        return jsonify({"error": "File, name, and product_id are required."}), 400
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found."}), 404

    # Try Cloudinary upload, fallback to local static folder
    url = None
    cloudinary_available = True
    try:
        # Check if config values are set
        if not (cloudinary.config().cloud_name and cloudinary.config().api_key and cloudinary.config().api_secret):
            cloudinary_available = False
    except Exception:
        cloudinary_available = False

    if cloudinary_available:
        try:
            result = cloudinary.uploader.upload(file)
            url = result.get('secure_url')
        except Exception:
            cloudinary_available = False

    if not cloudinary_available or not url:
        # Save locally in static/images
        from werkzeug.utils import secure_filename
        static_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'static', 'images'))
        os.makedirs(static_folder, exist_ok=True)
        filename = secure_filename(file.filename)
        local_path = os.path.join(static_folder, filename)
        file.save(local_path)
        # Generate absolute URL for frontend access
        url = request.host_url.rstrip('/') + f"/static/images/{filename}"

    image = Image(name=name, url=url, color=color, user_id=user_id, product_id=product_id)
    db.session.add(image)
    db.session.commit()
    return jsonify({"message": "Image uploaded successfully", "image_id": image.id, "url": url}), 201

"""
GET /images/<int:product_id>
Returns all images for a product
Response: { "images": [ { ... } ] }
"""
@images_bp.route("/<int:product_id>", methods=["GET"])
@jwt_required()
def get_images_for_product(product_id):
    images = Image.query.filter_by(product_id=product_id).all()
    return jsonify({
        "images": [
            {
                "id": img.id,
                "name": img.name,
                "url": img.url,
                "color": img.color,
                "user_id": img.user_id,
                "product_id": img.product_id
            } for img in images
        ]
    }), 200

"""
DELETE /images/<int:image_id>
Deletes an image (only owner or admin)
Response: { "message": str }
"""
@images_bp.route("/<int:image_id>", methods=["DELETE"])
@jwt_required()
def delete_image(image_id):
    user_id = get_jwt_identity()
    image = Image.query.get(image_id)
    if not image:
        return jsonify({"error": "Image not found."}), 404
    user = User.query.get(user_id)
    if not user or (user.id != image.user_id and user.role != "admin"):
        return jsonify({"error": "Unauthorized."}), 403
    db.session.delete(image)
    db.session.commit()
    return jsonify({"message": "Image deleted successfully"}), 200

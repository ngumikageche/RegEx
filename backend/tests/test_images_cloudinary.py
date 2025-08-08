import io
import pytest
from unittest.mock import patch, MagicMock
from app import create_app
from database import db as _db
from app.models.user import User
from app.models.catalogue import Product

@pytest.fixture
def app():
    from config import DevelopmentConfig
    app = create_app()
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = DevelopmentConfig.SQLALCHEMY_DATABASE_URI
    with app.app_context():
        _db.create_all()
        # Ensure user exists
        user = User.query.filter_by(email="ngumi98@gmail.com").first()
        if not user:
            user = User(username="admin", email="ngumi98@gmail.com")
            user.set_password("pa55word")
            _db.session.add(user)
            _db.session.commit()
        # Ensure category exists
        from app.models.category import Category
        category = Category.query.get(1)
        if not category:
            category = Category(id=1, name="Test Category", description="desc", user_id=user.id)
            _db.session.add(category)
            _db.session.commit()
        # Create a product for this user
        product = Product(name="Test Product", description="desc", price=10.0, user_id=user.id, category_id=1)
        _db.session.add(product)
        _db.session.commit()
    yield app
    with app.app_context():
        _db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_headers(app):
    with app.app_context():
        user = User.query.first()
        # Simulate login to get JWT token
        from flask_jwt_extended import create_access_token
        token = create_access_token(identity=str(user.id))
        return {"Authorization": f"Bearer {token}"}

def test_upload_image_cloudinary(client, auth_headers, app):
    import cloudinary
    with app.app_context():
        product = Product.query.first()
        # Print Cloudinary config keys
        print("Cloudinary config:")
        print("cloud_name:", cloudinary.config().cloud_name)
        print("api_key:", cloudinary.config().api_key)
        print("api_secret:", cloudinary.config().api_secret)
    # Use the actual attached image file for upload
    with open("tests/download.jpeg", "rb") as img_file:
        data = {
            "file": (img_file, "download.jpeg"),
            "name": "Test Image",
            "color": "red",
            "product_id": str(product.id)
        }
        response = client.post(
            "/images/upload",
            data=data,
            headers=auth_headers
        )
        print("Response JSON:", response.get_json())
    assert response.status_code == 201
    json_data = response.get_json()
    assert json_data["url"].startswith("http")
    assert "image_id" in json_data
    assert json_data["message"] == "Image uploaded successfully"

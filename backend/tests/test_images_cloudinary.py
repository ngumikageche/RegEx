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
        # Use existing user with email 'ngumi98@gmail.com'
        user = User.query.filter_by(email="ngumi98@gmail.com").first()
        if not user:
            raise Exception("User with email 'ngumi98@gmail.com' must exist in the database for this test.")
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
        token = create_access_token(identity=user.id)
        return {"Authorization": f"Bearer {token}"}

def test_upload_image_cloudinary(client, auth_headers, app):
    with app.app_context():
        product = Product.query.first()
    # Mock cloudinary.uploader.upload
    with patch("cloudinary.uploader.upload") as mock_upload:
        mock_upload.return_value = {"secure_url": "https://cloudinary.com/fakeimage.jpg"}
        data = {
            "file": (io.BytesIO(b"fake image data"), "test.jpg"),
            "name": "Test Image",
            "color": "red",
            "product_id": str(product.id)
        }
        response = client.post(
            "/images/upload",
            data=data,
            headers=auth_headers,
            content_type="multipart/form-data"
        )
        assert response.status_code == 201
        json_data = response.get_json()
        assert json_data["url"] == "https://cloudinary.com/fakeimage.jpg"
        assert "image_id" in json_data
        assert json_data["message"] == "Image uploaded successfully"

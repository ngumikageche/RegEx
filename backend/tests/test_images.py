import io
import pytest
from app import create_app
from database import db
from app.models.user import User
from app.models.catalogue import Product
from app.models.image import Image
from flask_jwt_extended import create_access_token

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "postgresql://joseph:regisam_dev@localhost/marketing_reports",
        "SQLALCHEMY_TRACK_MODIFICATIONS": False,
        "CLOUDINARY_CLOUD_NAME": "demo",
        "CLOUDINARY_API_KEY": "demo",
        "CLOUDINARY_API_SECRET": "demo"
    })
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        try:
            db.drop_all()
        except Exception as e:
            print(f"Error dropping tables: {e}")

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def user(app):
    with app.app_context():
        user = User(username="testuser", email="testuser@test.com", role="user")
        user.set_password("testpass")
        db.session.add(user)
        db.session.commit()
        return user.id

@pytest.fixture
def product(app, user):
    with app.app_context():
        product = Product(name="Test Product", price=10.0, user_id=user)
        db.session.add(product)
        db.session.commit()
        return product

@pytest.fixture
def token(app, user):
    with app.app_context():
        return create_access_token(identity=user)

# Mock cloudinary uploader
class MockUploader:
    @staticmethod
    def upload(file):
        return {"secure_url": "http://cloudinary.com/fakeimage.jpg"}

@pytest.fixture(autouse=True)
def mock_cloudinary(monkeypatch):
    import cloudinary.uploader
    monkeypatch.setattr(cloudinary.uploader, "upload", MockUploader.upload)

# Test image upload
def test_upload_image(client, app, product):
    # Create a new user for this test and re-query product to avoid DetachedInstanceError
    with app.app_context():
        user = User(username="imguser", email="imguser@test.com", role="user")
        user.set_password("imgpass")
        db.session.add(user)
        db.session.commit()
        user_id = user.id
        token = create_access_token(identity=user_id)
        # Re-query product to ensure it's session-bound
        product_obj = Product.query.get(product.id)

        data = {
            "name": "Test Image",
            "color": "red",
            "product_id": str(product_obj.id)
        }
        file_data = {
            "file": (io.BytesIO(b"fake image data"), "test.jpg")
        }
        response = client.post(
            "/images/",
            data={**data, **file_data},
            headers={"Authorization": f"Bearer {token}"},
            content_type="multipart/form-data"
        )
        assert response.status_code == 201
        json_data = response.get_json()
        assert "image_id" in json_data
        assert "url" in json_data

# Test get images for product
def test_get_images_for_product(client, token, product, app, user):
    with app.app_context():
        user_obj = User.query.get(user)
        product_obj = Product.query.get(product.id)
        image = Image(name="Test Image", url="http://cloudinary.com/fakeimage.jpg", color="red", user_id=user_obj.id, product_id=product_obj.id)
        db.session.add(image)
        db.session.commit()
        response = client.get(f"/images/{product_obj.id}", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        json_data = response.get_json()
        assert "images" in json_data
        assert len(json_data["images"]) >= 1

# Test delete image
def test_delete_image(client, token, product, app, user):
    with app.app_context():
        user_obj = User.query.get(user)
        product_obj = Product.query.get(product.id)
        image = Image(name="Test Image", url="http://cloudinary.com/fakeimage.jpg", color="red", user_id=user_obj.id, product_id=product_obj.id)
        db.session.add(image)
        db.session.commit()
        image_id = image.id
        response = client.delete(f"/images/{image_id}", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        json_data = response.get_json()
        assert json_data["message"] == "Image deleted successfully"

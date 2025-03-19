import pytest
from app import create_app
from database import db
from flask_jwt_extended import create_access_token
from app.models.user import User

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "postgresql://joseph:regisam_dev@localhost/test_reports",
        "SQLALCHEMY_TRACK_MODIFICATIONS": False
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
def admin_token(app):
    with app.app_context():
        admin = User(username="admin", email="admin@test.com", role="admin")
        admin.set_password("admin123")
        db.session.add(admin)
        db.session.commit()

        token = create_access_token(identity={"id": admin.id, "role": admin.role})
        return token

@pytest.fixture
def user_token(app):
    with app.app_context():
        user = User(username="user", email="user@test.com", role="user")
        user.set_password("user123")
        db.session.add(user)
        db.session.commit()

        token = create_access_token(identity={"id": user.id, "role": user.role})
        return token

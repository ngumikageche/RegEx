import pytest
from app import create_app
from database import db
from app.models.user import User
from app.models.usergroups import UserGroup
from flask_jwt_extended import create_access_token

@pytest.fixture
def app():
    app = create_app()
    app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "postgresql://joseph:regisam_dev@localhost/marketing_reports",
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
def admin_user(app):
    with app.app_context():
        user = User(username="admin", email="admin@test.com", role="admin")
        user.set_password("adminpass")
        db.session.add(user)
        db.session.commit()
        return user.id

@pytest.fixture
def token(app, admin_user):
    with app.app_context():
        return create_access_token(identity=admin_user)

@pytest.fixture
def users(app):
    with app.app_context():
        user1 = User(username="user1", email="user1@test.com", role="user")
        user1.set_password("pass1")
        user2 = User(username="user2", email="user2@test.com", role="user")
        user2.set_password("pass2")
        db.session.add(user1)
        db.session.add(user2)
        db.session.commit()
        return [user1.id, user2.id]

# Test create group
def test_create_group(client, token):
    data = {"name": "Test Group", "description": "A test group"}
    response = client.post(
        "/usergroups/",
        json=data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )
    assert response.status_code == 201
    json_data = response.get_json()
    assert "group_id" in json_data
    assert json_data["message"] == "Group created successfully"

# Test assign users to group
def test_assign_users_to_group(client, token, users, app):
    with app.app_context():
        group = UserGroup(name="Assign Group")
        db.session.add(group)
        db.session.commit()
        group_id = group.id
    data = {"user_ids": users}
    response = client.post(
        f"/usergroups/{group_id}/assign",
        json=data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["message"] == "Users assigned to group successfully"

# Test remove users from group
def test_remove_users_from_group(client, token, users, app):
    with app.app_context():
        group = UserGroup(name="Remove Group")
        db.session.add(group)
        db.session.commit()
        group_id = group.id
        user_objs = User.query.filter(User.id.in_(users)).all()
        for user in user_objs:
            group.users.append(user)
        db.session.commit()
    data = {"user_ids": users}
    response = client.post(
        f"/usergroups/{group_id}/remove",
        json=data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    )
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["message"] == "Users removed from group successfully"

# Test delete group
def test_delete_group(client, token, app):
    with app.app_context():
        group = UserGroup(name="Delete Group")
        db.session.add(group)
        db.session.commit()
        group_id = group.id
    response = client.delete(
        f"/usergroups/{group_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["message"] == "Group deleted successfully"

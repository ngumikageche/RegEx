import json

def test_register(client):
    data = {
        "username": "testuser",
        "email": "test@test.com",
        "password": "testpassword"
    }
    response = client.post("/register", data=json.dumps(data), content_type="application/json")
    assert response.status_code == 201
    assert response.json["message"] == "User registered successfully"

def test_register_existing_user(client):
    data = {
        "username": "testuser",
        "email": "test@test.com",
        "password": "testpassword"
    }
    client.post("/register", data=json.dumps(data), content_type="application/json")
    response = client.post("/register", data=json.dumps(data), content_type="application/json")
    
    print(response.json)  # Debugging

    assert response.status_code == 400
    assert response.json["message"] == "Email already exists"

def test_login_success(client):
    client.post("/register", json={"username": "testuser", "email": "test@test.com", "password": "testpassword"})
    response = client.post("/login", json={"email": "test@test.com", "password": "testpassword"})
    
    print(response.json)  # Debugging

    assert response.status_code == 200
    assert "token" in response.json

def test_login_invalid_credentials(client):
    response = client.post("/login", json={"email": "wrong@test.com", "password": "wrongpass"})
    
    print(response.json)  # Debugging
    
    assert response.status_code == 401
    assert response.json["error"] == "Wrong email or password"

def test_admin_access_denied(client, user_token):
    headers = {"Authorization": f"Bearer {user_token}"}
    response = client.get("/dashboard/admin/", headers=headers)

    print(response.json)  # Debugging

    assert response.status_code == 403
    assert response.json["error"] == "Unauthorized"

def test_admin_access_allowed(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get("/dashboard/admin/", headers=headers)

    print(response.json)  # Debugging

    assert response.status_code == 200
    assert response.json["message"] == "Admin Panel"

// src/components/Login.js
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Form, Container, Row, Col } from "react-bootstrap";
import { UserContext } from "context/UserContext"; // Import UserContext

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { fetchUser } = useContext(UserContext); // Access fetchUser from UserContext

  // src/components/Login.js (snippet)
const handleLogin = async (e) => {
  e.preventDefault();
  setError(null);
  console.log("Attempting login with:", { email, password });

  try {
    const response = await fetch("http://127.0.0.1:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    console.log("Login response status:", response.status);
    const data = await response.json();
    console.log("Login response data:", data);

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("user_role", data.role);
    console.log("Token stored:", data.token);

    console.log("Fetching user data...");
    try {
      await fetchUser(data.token);
      console.log("User data fetched successfully");
    } catch (err) {
      console.error("Failed to fetch user data, proceeding anyway:", err);
    }

    console.log("Navigating to /admin/dashboard");
    navigate("/admin/dashboard", { replace: true });
  } catch (err) {
    setError(err.message);
    console.error("Login error:", err.message);
  }
};

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Body>
              <h3 className="text-center">Login</h3>
              {error && <p className="text-danger text-center">{error}</p>}
              <Form onSubmit={handleLogin}>
                <Form.Group>
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="primary" className="mt-3 w-100">
                  Login
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
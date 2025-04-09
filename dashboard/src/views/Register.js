// src/components/Register.js
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Form, Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import { UserContext } from "context/UserContext";

const Register = () => {
  const { user, fetchUser, setUser } = useContext(UserContext);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("You must be logged in to register users.");
      navigate("/auth/login", { replace: true });
      return;
    }

    if (!user) {
      fetchUser(token).catch((err) => {
        console.error("Failed to fetch user data:", err);
        setError("Failed to verify user. Please log in again.");
        localStorage.removeItem("auth_token");
        setUser(null);
        navigate("/auth/login", { replace: true });
      });
    }
  }, [user, fetchUser, navigate, setUser]);

  useEffect(() => {
    if (user && user.role !== "admin") {
      setError("You must be an admin to register users.");
      navigate("/admin/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters long.");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("auth_token");
    console.log("Token used for registration:", token);

    const userData = {
      username: username.trim(),
      email: email.trim(),
      password,
      role,
    };

    console.log("Sending data:", userData);

    try {
      const response = await fetch("http://127.0.0.1:5000/auth/register", {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        setSuccess("User registered successfully!");
        setUsername("");
        setEmail("");
        setPassword("");
        setRole("user");
        setTimeout(() => {
          navigate("/admin/dashboard", { replace: true });
        }, 2000);
      } else if (response.status === 422) {
        // Token is invalid or expired
        setError("Your session has expired. Please log in again.");
        localStorage.removeItem("auth_token");
        setUser(null);
        navigate("/auth/login", { replace: true });
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred while registering the user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Body>
              <h3 className="text-center">Register New User</h3>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleRegister}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Control
                    as="select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={loading}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </Form.Control>
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
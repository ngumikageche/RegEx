import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Form, Container, Row, Col, Spinner } from "react-bootstrap";
import { UserContext } from "../context/UserContext";
import { NotificationContext } from "../context/NotificationContext";

const Register = () => {
  const { user, fetchUser, setUser } = useContext(UserContext);
  const { addNotification } = useContext(NotificationContext);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      addNotification({ message: "You must be logged in to register users.", type: "error" });
      navigate("/auth/login", { replace: true });
      return;
    }

    if (!user) {
      fetchUser(token).catch((err) => {
        console.error("Failed to fetch user data:", err);
        addNotification({ message: "Failed to verify user. Please log in again.", type: "error" });
        localStorage.removeItem("auth_token");
        setUser(null);
        navigate("/auth/login", { replace: true });
      });
    } else if (user.role !== "admin") {
      addNotification({ message: "You must be an admin to register users.", type: "error" });
      navigate("/admin/dashboard", { replace: true });
    }
  }, [user, fetchUser, navigate, setUser, showNotification]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (username.trim().length < 3) {
      addNotification({ message: "Username must be at least 3 characters long.", type: "error" });
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      addNotification({ message: "Please enter a valid email address.", type: "error" });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      addNotification({ message: "Password must be at least 6 characters long.", type: "error" });
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("auth_token");
    const userData = {
      username: username.trim(),
      email: email.trim(),
      password,
      role,
    };

    try {
      const response = await fetch("https://api.regisamtech.co.ke/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (response.ok) {
        addNotification({ message: "User registered successfully!", type: "success" });
        setUsername("");
        setEmail("");
        setPassword("");
        setRole("user");
        setTimeout(() => {
          navigate("/admin/user-list", { replace: true });
        }, 2000);
      } else {
        addNotification({ message: data.message || "Registration failed. Please try again.", type: "error" });
        if (response.status === 401 || response.status === 422) {
          addNotification({ message: "Your session has expired. Please log in again.", type: "error" });
          localStorage.removeItem("auth_token");
          setUser(null);
          navigate("/auth/login", { replace: true });
        }
      }
    } catch (error) {
      console.error("Error:", error);
      addNotification({ message: "An error occurred while registering the user.", type: "error" });
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
    <Container fluid className="mt-5 animate__animated animate__fadeIn">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h3 className="text-center">Register New User</h3>
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
                    <option value="doctor">Doctor</option>
                    <option value="marketer">Marketer</option>
                  </Form.Control>
                </Form.Group>
                <Button
                  type="submit"
                  variant="info"
                  className="w-100 btn-fill"
                  disabled={loading}
                >
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
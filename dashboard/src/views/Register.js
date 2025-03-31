import React, { useState, useContext } from "react";
import { Button, Card, Form, Container, Row, Col, Alert } from "react-bootstrap";
import { UserContext } from "context/UserContext"; // Import UserContext

const Register = () => {
  const { user } = useContext(UserContext); // Get user context
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("doctor"); // Default role
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const token = localStorage.getItem("auth_token"); // Use stored token

    if (!token || user?.role !== "admin") {
      setError("You must be logged in as an admin to register users.");
      setLoading(false);
      return;
    }

    const userData = {
      username: username.trim(),
      email: email.trim(),
      password,
      role
    };

    console.log("Sending data:", userData); // Debug request payload

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

      const data = await response.json();
      console.log("Response:", data); // Debug API response

      if (response.ok) {
        setSuccess("Registration successful!");
        setUsername("");
        setEmail("");
        setPassword("");
        setRole("doctor");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Registration request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Body>
              <h3 className="text-center">Register</h3>

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
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Control as="select" value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </Form.Control>
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                  {loading ? "Registering..." : "Register"}
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

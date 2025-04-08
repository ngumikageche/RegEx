// src/views/MyProfile.js
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Alert, Tabs, Tab } from "react-bootstrap";

// Custom styles for the component
const styles = {
  card: {
    marginTop: "20px",
    marginBottom: "20px",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#333",
  },
  formLabel: {
    fontWeight: "500",
    color: "#555",
  },
  submitButton: {
    marginTop: "20px",
    padding: "10px 20px",
    fontSize: "16px",
    fontWeight: "bold",
  },
};

function MyProfile() {
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
    aboutMe: "",
  });
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/user/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setUserData({
            username: data.username,
            email: data.email,
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            address: data.address || "",
            city: data.city || "",
            country: data.country || "",
            postalCode: data.postal_code || "",
            aboutMe: data.about_me || "",
          });
        } else {
          setError(data.error || "Failed to fetch user data.");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("An error occurred while fetching user data.");
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/user/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          address: userData.address,
          city: userData.city,
          country: userData.country,
          postalCode: userData.postalCode,
          aboutMe: userData.aboutMe,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Profile updated successfully!");
      } else {
        setError(data.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("An error occurred while updating the profile.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError("New password and confirm password do not match.");
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/user/users/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          old_password: passwordData.old_password,
          new_password: passwordData.new_password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Password updated successfully!");
        setPasswordData({
          old_password: "",
          new_password: "",
          confirm_password: "",
        });
      } else {
        setError(data.error || "Failed to update password.");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setError("An error occurred while updating the password.");
    }
  };

  return (
    <Container fluid>
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <Card style={styles.card}>
            <Card.Body>
              <h3 style={styles.title}>My Profile</h3>
              {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
                  {success}
                </Alert>
              )}
              <Tabs defaultActiveKey="profile" id="profile-tabs" className="mb-3">
                <Tab eventKey="profile" title="Update Profile">
                  <Form onSubmit={handleUpdateProfile}>
                    <Row>
                      <Col xs={12}>
                        <Form.Group className="mb-3">
                          <Form.Label style={styles.formLabel}>Username</Form.Label>
                          <Form.Control
                            type="text"
                            name="username"
                            value={userData.username}
                            onChange={handleInputChange}
                            placeholder="Enter username"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12}>
                        <Form.Group className="mb-3">
                          <Form.Label style={styles.formLabel}>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={userData.email}
                            onChange={handleInputChange}
                            placeholder="Enter email"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12} md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={styles.formLabel}>First Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="firstName"
                            value={userData.firstName}
                            onChange={handleInputChange}
                            placeholder="Enter first name"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={styles.formLabel}>Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="lastName"
                            value={userData.lastName}
                            onChange={handleInputChange}
                            placeholder="Enter last name"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12} md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={styles.formLabel}>Address</Form.Label>
                          <Form.Control
                            type="text"
                            name="address"
                            value={userData.address}
                            onChange={handleInputChange}
                            placeholder="Enter address"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={styles.formLabel}>City</Form.Label>
                          <Form.Control
                            type="text"
                            name="city"
                            value={userData.city}
                            onChange={handleInputChange}
                            placeholder="Enter city"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12} md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={styles.formLabel}>Country</Form.Label>
                          <Form.Control
                            type="text"
                            name="country"
                            value={userData.country}
                            onChange={handleInputChange}
                            placeholder="Enter country"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={styles.formLabel}>Postal Code</Form.Label>
                          <Form.Control
                            type="text"
                            name="postalCode"
                            value={userData.postalCode}
                            onChange={handleInputChange}
                            placeholder="Enter postal code"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12}>
                        <Form.Group className="mb-3">
                          <Form.Label style={styles.formLabel}>About Me</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="aboutMe"
                            value={userData.aboutMe}
                            onChange={handleInputChange}
                            placeholder="Tell us about yourself"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12} className="text-center">
                        <Button
                          type="submit"
                          variant="primary"
                          style={styles.submitButton}
                        >
                          Update Profile
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Tab>
                <Tab eventKey="password" title="Change Password">
                  <Form onSubmit={handleChangePassword}>
                    <Row>
                      <Col xs={12}>
                        <Form.Group className="mb-3">
                          <Form.Label style={styles.formLabel}>Old Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="old_password"
                            value={passwordData.old_password}
                            onChange={handlePasswordChange}
                            placeholder="Enter old password"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12}>
                        <Form.Group className="mb-3">
                          <Form.Label style={styles.formLabel}>New Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="new_password"
                            value={passwordData.new_password}
                            onChange={handlePasswordChange}
                            placeholder="Enter new password"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12}>
                        <Form.Group className="mb-3">
                          <Form.Label style={styles.formLabel}>Confirm New Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="confirm_password"
                            value={passwordData.confirm_password}
                            onChange={handlePasswordChange}
                            placeholder="Confirm new password"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={12} className="text-center">
                        <Button
                          type="submit"
                          variant="primary"
                          style={styles.submitButton}
                        >
                          Change Password
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default MyProfile;
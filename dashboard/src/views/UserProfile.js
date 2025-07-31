import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  Form,
  Container,
  Row,
  Col,
  Alert,
  Spinner,
} from "react-bootstrap";
import { UserContext } from "../context/UserContext";
import { NotificationContext } from "../context/NotificationContext";
import defaultAvatar from "../assets/img/default-avatar.png";

function UserProfile() {
  const { user, fetchUser } = useContext(UserContext);
  const { addNotification } = useContext(NotificationContext);
  const navigate = useNavigate();
  const token = localStorage.getItem("auth_token");

  // State for profile form
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [role, setRole] = useState("");

  // State for password change form
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [loadingUserCard, setLoadingUserCard] = useState(true);

  // Fetch user data on mount
  useEffect(() => {
    if (!token) {
      addNotification({ message: "No authentication token found. Please log in.", type: "error" });
      navigate("/auth/login", { replace: true });
      return;
    }

    if (!user) {
      setLoadingUserCard(true);
      fetchUser(token)
        .then(() => {
          setLoadingUserCard(false);
        })
        .catch((err) => {
          console.error("Failed to fetch user data:", err);
          addNotification({ message: "Failed to load user data. Please log in again.", type: "error" });
          setLoadingUserCard(false);
          localStorage.removeItem("auth_token");
          navigate("/auth/login", { replace: true });
        });
    } else {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setRole(user.role || "");
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setAddress(user.address || "");
      setCity(user.city || "");
      setCountry(user.country || "");
      setPostalCode(user.postal_code || "");
      setAboutMe(user.about_me || "");
      setLoadingUserCard(false);
    }
  }, [user, fetchUser, token, navigate, showNotification]);

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updatedData = {
      username,
      email,
      first_name: firstName, // Match API field names
      last_name: lastName,
      address,
      city,
      country,
      postal_code: postalCode,
      about_me: aboutMe,
      role: user.role === "admin" ? role : undefined, // Only include role for admins
    };

    try {
      const response = await fetch("https://api.regisamtech.co.ke/user/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();
      if (response.ok) {
        addNotification({ message: "Profile updated successfully!", type: "success" });
        fetchUser(token); // Refresh user data
      } else {
        addNotification({ message: data.error || "Failed to update profile.", type: "error" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      addNotification({ message: "An error occurred while updating the profile.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      addNotification({ message: "New password and confirm password do not match.", type: "error" });
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      addNotification({ message: "New password must be at least 6 characters long.", type: "error" });
      setLoading(false);
      return;
    }

    const passwordData = {
      old_password: oldPassword,
      new_password: newPassword,
    };

    try {
      const response = await fetch("https://api.regisamtech.co.ke/users/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();
      if (response.ok) {
        addNotification({ message: "Password updated successfully!", type: "success" });
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        addNotification({ message: data.error || "Failed to update password.", type: "error" });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      addNotification({ message: "An error occurred while changing the password.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!user && loadingUserCard) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid className="animate__animated animate__fadeIn">
      <Row>
        <Col md="8">
          <Card className="shadow-sm">
            <Card.Header>
              <Card.Title as="h4">Edit Profile</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleUpdateProfile}>
                <Row>
                  <Col className="pr-1" md="5">
                    <Form.Group>
                      <label>Company (disabled)</label>
                      <Form.Control
                        defaultValue="Creative Code Inc."
                        disabled
                        placeholder="Company"
                        type="text"
                      />
                    </Form.Group>
                  </Col>
                  <Col className="px-1" md="3">
                    <Form.Group>
                      <label>Username</label>
                      <Form.Control
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        type="text"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col className="pl-1" md="4">
                    <Form.Group>
                      <label htmlFor="exampleInputEmail1">Email address</label>
                      <Form.Control
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        type="email"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col className="pr-1" md="6">
                    <Form.Group>
                      <label>First Name</label>
                      <Form.Control
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        type="text"
                      />
                    </Form.Group>
                  </Col>
                  <Col className="pl-1" md="6">
                    <Form.Group>
                      <label>Last Name</label>
                      <Form.Control
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        type="text"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md="12">
                    <Form.Group>
                      <label>Address</label>
                      <Form.Control
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Home Address"
                        type="text"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col className="pr-1" md="4">
                    <Form.Group>
                      <label>City</label>
                      <Form.Control
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        type="text"
                      />
                    </Form.Group>
                  </Col>
                  <Col className="px-1" md="4">
                    <Form.Group>
                      <label>Country</label>
                      <Form.Control
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Country"
                        type="text"
                      />
                    </Form.Group>
                  </Col>
                  <Col className="pl-1" md="4">
                    <Form.Group>
                      <label>Postal Code</label>
                      <Form.Control
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="ZIP Code"
                        type="number"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md="12">
                    <Form.Group>
                      <label>About Me</label>
                      <Form.Control
                        cols="80"
                        value={aboutMe}
                        onChange={(e) => setAboutMe(e.target.value)}
                        placeholder="Here can be your description"
                        rows="4"
                        as="textarea"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                {user?.role === "admin" && (
                  <Row>
                    <Col md="12">
                      <Form.Group>
                        <label>Role</label>
                        <Form.Control
                          as="select"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                        >
                          <option value="doctor">Doctor</option>
                          <option value="admin">Admin</option>
                          <option value="marketer">Marketer</option>
                        </Form.Control>
                      </Form.Group>
                    </Col>
                  </Row>
                )}
                <Button
                  className="btn-fill pull-right"
                  type="submit"
                  variant="info"
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
                      Updating...
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </Button>
                <div className="clearfix"></div>
              </Form>
            </Card.Body>
          </Card>

          {/* Password Change Section */}
          <Card className="mt-4 shadow-sm">
            <Card.Header>
              <Card.Title as="h4">Change Password</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleChangePassword}>
                <Row>
                  <Col md="12">
                    <Form.Group>
                      <label>Old Password</label>
                      <Form.Control
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter old password"
                        type="password"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <Form.Group>
                      <label>New Password</label>
                      <Form.Control
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        type="password"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md="6">
                    <Form.Group>
                      <label>Confirm New Password</label>
                      <Form.Control
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        type="password"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button
                  className="btn-fill pull-right"
                  type="submit"
                  variant="info"
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
                      Changing...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
                <div className="clearfix"></div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md="4">
          <Card className="card-user shadow-sm">
            {loadingUserCard ? (
              <Card.Body className="text-center">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </Card.Body>
            ) : (
              <>
                <div className="card-image">
                  <img
                    alt="Background"
                    src={require("../assets/img/photo-1431578500526-4d9613015464.jpeg")}
                  />
                </div>
                <Card.Body>
                  <div className="author">
                    <a href="#pablo" onClick={(e) => e.preventDefault()}>
                      <img
                        alt="User Avatar"
                        className="avatar border-gray"
                        src={user?.avatar || defaultAvatar}
                      />
                      <h5 className="title">{`${firstName || "User"} ${lastName || ""}`}</h5>
                    </a>
                    <p className="description">{username}</p>
                  </div>
                  <p className="description text-center">{aboutMe || "Tell us about yourself!"}</p>
                </Card.Body>
                <hr />
                <div className="button-container mr-auto ml-auto">
                  <Button
                    className="btn-simple btn-icon"
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                    variant="link"
                  >
                    <i className="fab fa-facebook-square"></i>
                  </Button>
                  <Button
                    className="btn-simple btn-icon"
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                    variant="link"
                  >
                    <i className="fab fa-twitter"></i>
                  </Button>
                  <Button
                    className="btn-simple btn-icon"
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                    variant="link"
                  >
                    <i className="fab fa-google-plus-square"></i>
                  </Button>
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default UserProfile;
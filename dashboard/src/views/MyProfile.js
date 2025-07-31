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
import defaultAvatar from "../assets/img/default-avatar.png";

function MyProfile() {
  const { user, fetchUser } = useContext(UserContext);
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

  // State for password change form (using object to match original MyProfile.js)
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [loadingUserCard, setLoadingUserCard] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch user data on mount
  useEffect(() => {
    if (!token) {
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
          setError("Failed to load user data. Please log in again.");
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
  }, [user, fetchUser, token, navigate]);

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const updatedData = {
      username,
      email,
      firstName,
      lastName,
      address,
      city,
      country,
      postalCode,
      aboutMe,
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
        setSuccess("Profile updated successfully!");
        fetchUser(token); // Refresh user data
      } else {
        setError(data.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("An error occurred while updating the profile.");
    } finally {
      setLoading(false);
    }
  };

  // Handle password change (restored from original MyProfile.js)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError("New password and confirm password do not match.");
      setLoading(false);
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError("New password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      console.log("Sending password change request:", passwordData);
      const response = await fetch("https://api.regisamtech.co.ke/user/users/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: passwordData.old_password,
          new_password: passwordData.new_password,
        }),
      });

      console.log("Password change response status:", response.status);
      const data = await response.json();
      console.log("Password change response data:", data);

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
    } finally {
      setLoading(false);
    }
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    <>
      <Container fluid>
        <Row>
          <Col md="8">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Edit Profile</Card.Title>
              </Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
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
                  {user.role === "admin" && (
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
            <Card className="mt-4">
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
                    <Col md="6">
                      <Form.Group>
                        <label>New Password</label>
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
                    <Col md="6">
                      <Form.Group>
                        <label>Confirm New Password</label>
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
            <Card className="card-user">
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
                      alt="..."
                      src={require("../assets/img/photo-1431578500526-4d9613015464.jpeg")}
                    />
                  </div>
                  <Card.Body>
                    <div className="author">
                      <a href="#pablo" onClick={(e) => e.preventDefault()}>
                        <img
                          alt="..."
                          src={user?.avatar || defaultAvatar}
                          alt="User Avatar"
                          className="avatar border-gray"
                          src={require("../assets/img/faces/face-3.jpg")}
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
    </>
  );
}

export default MyProfile;
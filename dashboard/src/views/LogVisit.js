import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import { UserContext } from "../context/UserContext";
import Datetime from "react-datetime";
import moment from "moment";

function LogVisit() {
  const { user, fetchUser } = useContext(UserContext);
  const navigate = useNavigate();
  const token = localStorage.getItem("auth_token");

  // State for form fields
  const [doctorName, setDoctorName] = useState("");
  const [location, setLocation] = useState("");
  const [visitDate, setVisitDate] = useState(null); // Changed to null for Datetime
  const [notes, setNotes] = useState("");

  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch user data on mount
  useEffect(() => {
    if (!token) {
      console.log("No token found, redirecting to login.");
      navigate("/auth/login", { replace: true });
      return;
    }

    if (!user) {
      console.log("No user data, fetching user...");
      setLoadingUser(true);
      fetchUser(token)
        .then(() => {
          console.log("User data fetched successfully.");
          setLoadingUser(false);
        })
        .catch((err) => {
          console.error("Failed to fetch user data:", err);
          setError("Failed to load user data. Please log in again.");
          setLoadingUser(false);
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_role");
          navigate("/auth/login", { replace: true });
        });
    } else {
      console.log("User data available:", user);
      if (user.role !== "marketer") {
        setError("Unauthorized. Only marketers can log visits.");
      }
      setLoadingUser(false);
    }
  }, [user, fetchUser, token, navigate]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Client-side validation
    if (!doctorName.trim()) {
      setError("Doctor name is required.");
      setLoading(false);
      return;
    }

    if (!location.trim()) {
      setError("Location is required.");
      setLoading(false);
      return;
    }

    if (!visitDate || !moment(visitDate).isValid()) {
      setError("Please select a valid visit date and time.");
      setLoading(false);
      return;
    }

    const formattedVisitDate = moment(visitDate).format("YYYY-MM-DD HH:mm:ss");

    const visitData = {
      doctor_name: doctorName,
      location,
      visit_date: formattedVisitDate,
      notes,
    };

    console.log("Submitting visit data:", visitData);
    console.log("Token:", token);

    try {
      const response = await fetch("http://127.0.0.1:5000/visits/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(visitData),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        setSuccess("Visit logged successfully!");
        setDoctorName("");
        setLocation("");
        setVisitDate(null);
        setNotes("");
      } else {
        setError(data.error || "Failed to log visit.");
      }
    } catch (error) {
      console.error("Error during fetch:", error);
      setError("An error occurred while logging the visit. Check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser || !user) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row>
        <Col md="8">
          <Card>
            <Card.Header>
              <Card.Title as="h4">Log a Doctor Visit</Card.Title>
              <p className="card-category">For marketers only</p>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" onClose={() => setError("")} dismissible>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert variant="success" onClose={() => setSuccess("")} dismissible>
                  {success}
                </Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md="6">
                    <Form.Group>
                      <label>Doctor Name</label>
                      <Form.Control
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        placeholder="Enter doctor's name"
                        type="text"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md="6">
                    <Form.Group>
                      <label>Location</label>
                      <Form.Control
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter location"
                        type="text"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <Form.Group>
                      <label>Visit Date and Time</label>
                      <Datetime
                        value={visitDate}
                        onChange={(date) => setVisitDate(date)}
                        inputProps={{
                          placeholder: "Select date and time",
                          required: true,
                        }}
                        timeFormat="HH:mm:ss"
                        dateFormat="YYYY-MM-DD"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md="12">
                    <Form.Group>
                      <label>Notes</label>
                      <Form.Control
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Enter any notes (optional)"
                        as="textarea"
                        rows="3"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button
                  className="btn-fill pull-right"
                  type="submit"
                  variant="info"
                  disabled={loading || user.role !== "marketer"}
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
                      Logging...
                    </>
                  ) : (
                    "Log Visit"
                  )}
                </Button>
                <div className="clearfix"></div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        <Col md="4">
          <Card className="card-user">
            {loadingUser ? (
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
                        className="avatar border-gray"
                        src={require("../assets/img/faces/face-3.jpg")}
                      />
                      <h5 className="title">{`${user.first_name || "User"} ${user.last_name || ""}`}</h5>
                    </a>
                    <p className="description">{user.username}</p>
                  </div>
                  <p className="description text-center">{user.about_me || "Tell us about yourself!"}</p>
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

export default LogVisit;
// src/views/LogVisit.js
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
  const [visitDate, setVisitDate] = useState(null);  // Changed to null for Datetime
  const [notes, setNotes] = useState("");

  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch user data on mount
  useEffect(() => {
    if (!token) {
      navigate("/auth/login", { replace: true });
      return;
    }

    if (!user) {
      fetchUser(token).catch((err) => {
        console.error("Failed to fetch user data:", err);
        setError("Failed to load user data. Please log in again.");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_role");
        navigate("/auth/login", { replace: true });
      });
    } else if (user.role !== "marketer") {
      setError("Unauthorized. Only marketers can log visits.");
    }
  }, [user, fetchUser, token, navigate]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validate visit date
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

    try {
      const response = await fetch("http://127.0.0.1:5000/visit/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(visitData),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Visit logged successfully!");
        setDoctorName("");
        setLocation("");
        setVisitDate(null);  // Reset to null
        setNotes("");
      } else {
        setError(data.error || "Failed to log visit.");
      }
    } catch (error) {
      console.error("Error logging visit:", error);
      setError("An error occurred while logging the visit.");
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
    <Container fluid>
      <Row>
        <Col md="8" className="mx-auto">
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
      </Row>
    </Container>
  );
}

export default LogVisit;
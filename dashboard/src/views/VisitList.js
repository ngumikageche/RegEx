// src/views/VisitList.js
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Container,
  Row,
  Col,
  Table,
  Alert,
  Spinner,
  Button,
  Form,
} from "react-bootstrap";
import { UserContext } from "../context/UserContext";
import Datetime from "react-datetime";
import moment from "moment";

function VisitList() {
  const { user, fetchUser } = useContext(UserContext);
  const navigate = useNavigate();
  const token = localStorage.getItem("auth_token");

  // State for visits
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for admin filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [marketerId, setMarketerId] = useState("");
  const [doctorName, setDoctorName] = useState("");

  // State for editing a visit
  const [editingVisit, setEditingVisit] = useState(null);
  const [editDoctorName, setEditDoctorName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editVisitDate, setEditVisitDate] = useState(null);  // Changed to null for Datetime
  const [editNotes, setEditNotes] = useState("");

  // Fetch visits on mount
  useEffect(() => {
    if (!token) {
      navigate("/auth/login", { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        if (!user) {
          await fetchUser(token);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setError("Failed to load user data. Please log in again.");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_role");
        navigate("/auth/login", { replace: true });
        return;
      }

      if (user && !["marketer", "admin"].includes(user.role)) {
        setError("Unauthorized. Only marketers and admins can view visits.");
        setLoading(false);
        return;
      }

      await fetchVisits();
    };

    fetchData();
  }, [user, fetchUser, token, navigate]);

  // Function to fetch visits with filters
  const fetchVisits = async () => {
    setLoading(true);
    setError("");

    try {
      let url = "http://127.0.0.1:5000/visit/";
      if (user.role === "admin") {
        const params = new URLSearchParams();
        if (startDate) params.append("start_date", startDate);
        if (endDate) params.append("end_date", endDate);
        if (marketerId) params.append("marketer_id", marketerId);
        if (doctorName) params.append("doctor_name", doctorName);
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setVisits(data.visits);
      } else {
        setError(data.error || "Failed to fetch visits.");
      }
    } catch (error) {
      console.error("Error fetching visits:", error);
      setError("An error occurred while fetching visits.");
    } finally {
      setLoading(false);
    }
  };

  // Handle filter form submission for admins
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchVisits();
  };

  // Handle edit button click
  const handleEdit = (visit) => {
    setEditingVisit(visit);
    setEditDoctorName(visit.doctor_name);
    setEditLocation(visit.location);
    setEditVisitDate(moment(visit.visit_date, "YYYY-MM-DD HH:mm:ss"));  // Parse existing date
    setEditNotes(visit.notes);
  };

  // Handle update form submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!editVisitDate || !moment(editVisitDate).isValid()) {
      setError("Please select a valid visit date and time.");
      setLoading(false);
      return;
    }

    const formattedVisitDate = moment(editVisitDate).format("YYYY-MM-DD HH:mm:ss");

    const updatedVisit = {
      doctor_name: editDoctorName,
      location: editLocation,
      visit_date: formattedVisitDate,
      notes: editNotes,
    };

    try {
      const response = await fetch(`http://127.0.0.1:5000/visit/${editingVisit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedVisit),
      });

      const data = await response.json();
      if (response.ok) {
        setVisits(
          visits.map((visit) =>
            visit.id === editingVisit.id ? { ...visit, ...updatedVisit } : visit
          )
        );
        setEditingVisit(null);
        alert("Visit updated successfully!");
      } else {
        setError(data.error || "Failed to update visit.");
      }
    } catch (error) {
      console.error("Error updating visit:", error);
      setError("An error occurred while updating the visit.");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete button click
  const handleDelete = async (visitId) => {
    if (!window.confirm("Are you sure you want to delete this visit?")) {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/visit/${visitId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setVisits(visits.filter((visit) => visit.id !== visitId));
        alert("Visit deleted successfully!");
      } else {
        setError(data.error || "Failed to delete visit.");
      }
    } catch (error) {
      console.error("Error deleting visit:", error);
      setError("An error occurred while deleting the visit.");
    }
  };

  if (loading) {
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
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Card.Header>
              <Card.Title as="h4">Doctor Visits</Card.Title>
              <p className="card-category">
                {user.role === "marketer"
                  ? "Your logged visits"
                  : "All visits (Admin View)"}
              </p>
            </Card.Header>
            <Card.Body className="table-full-width table-responsive px-0">
              {error && (
                <Alert variant="danger" onClose={() => setError("")} dismissible>
                  {error}
                </Alert>
              )}
              {user.role === "admin" && (
                <Form onSubmit={handleFilterSubmit} className="mb-4">
                  <Row>
                    <Col md="3">
                      <Form.Group>
                        <Form.Label>Start Date (YYYY-MM-DD)</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g., 2025-04-01"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md="3">
                      <Form.Group>
                        <Form.Label>End Date (YYYY-MM-DD)</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g., 2025-04-30"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md="2">
                      <Form.Group>
                        <Form.Label>Marketer ID</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="e.g., 2"
                          value={marketerId}
                          onChange={(e) => setMarketerId(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md="2">
                      <Form.Group>
                        <Form.Label>Doctor Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g., Dr. Smith"
                          value={doctorName}
                          onChange={(e) => setDoctorName(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md="2" className="d-flex align-items-end">
                      <Button variant="info" type="submit">
                        Filter
                      </Button>
                    </Col>
                  </Row>
                </Form>
              )}
              {visits.length === 0 ? (
                <p className="text-center">No visits found.</p>
              ) : (
                <Table className="table-hover table-striped">
                  <thead>
                    <tr>
                      <th className="border-0">ID</th>
                      <th className="border-0">Marketer</th>
                      <th className="border-0">Doctor Name</th>
                      <th className="border-0">Location</th>
                      <th className="border-0">Visit Date</th>
                      <th className="border-0">Notes</th>
                      <th className="border-0">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits.map((visit) => (
                      <tr key={visit.id}>
                        <td>{visit.id}</td>
                        <td>{visit.marketer_name || `ID: ${visit.marketer_id}`}</td>
                        <td>{visit.doctor_name}</td>
                        <td>{visit.location}</td>
                        <td>{visit.visit_date}</td>
                        <td>{visit.notes || "N/A"}</td>
                        <td>
                          {user.role === "marketer" && (
                            <Button
                              variant="info"
                              size="sm"
                              onClick={() => handleEdit(visit)}
                              className="me-2"
                            >
                              Edit
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(visit.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Edit Visit Modal */}
      {editingVisit && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Visit</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingVisit(null)}
                ></button>
              </div>
              <Form onSubmit={handleUpdate}>
                <div className="modal-body">
                  <Form.Group className="mb-3">
                    <Form.Label>Doctor Name</Form.Label>
                    <Form.Control
                      value={editDoctorName}
                      onChange={(e) => setEditDoctorName(e.target.value)}
                      placeholder="Enter doctor's name"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      placeholder="Enter location"
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Visit Date and Time</Form.Label>
                    <Datetime
                      value={editVisitDate}
                      onChange={(date) => setEditVisitDate(date)}
                      inputProps={{
                        placeholder: "Select date and time",
                        required: true,
                      }}
                      timeFormat="HH:mm:ss"
                      dateFormat="YYYY-MM-DD"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Enter any notes (optional)"
                      as="textarea"
                      rows="3"
                    />
                  </Form.Group>
                </div>
                <div className="modal-footer">
                  <Button variant="secondary" onClick={() => setEditingVisit(null)}>
                    Cancel
                  </Button>
                  <Button variant="info" type="submit" disabled={loading}>
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
                      "Update Visit"
                    )}
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

export default VisitList;
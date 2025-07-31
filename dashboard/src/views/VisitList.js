import React, { useState, useEffect, useContext, useRef } from "react";
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
import defaultAvatar from "../assets/img/default-avatar.png";
import Datetime from "react-datetime";
import moment from "moment";
import { useReactToPrint } from "react-to-print";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function VisitList() {
  const { user, fetchUser } = useContext(UserContext);
  // Use user?.avatar || defaultAvatar wherever avatar is displayed
  const navigate = useNavigate();
  const token = localStorage.getItem("auth_token");

  // State for visits
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for admin filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [doctorName, setDoctorName] = useState("");

  // State for editing a visit
  const [editingVisit, setEditingVisit] = useState(null);
  const [editDoctorName, setEditDoctorName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editVisitDate, setEditVisitDate] = useState(null);
  const [editNotes, setEditNotes] = useState("");

  // Ref for printing and PDF
  const componentRef = useRef();

  // Print handler
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Visit_Report_${moment().format("YYYY-MM-DD")}`,
    onBeforeGetContent: () => {
      // Temporarily make the report visible for printing
      componentRef.current.style.visibility = "visible";
      componentRef.current.style.position = "absolute";
      componentRef.current.style.left = "0";
    },
    onAfterPrint: () => {
      // Restore hidden state after printing
      componentRef.current.style.visibility = "hidden";
      componentRef.current.style.position = "absolute";
      componentRef.current.style.left = "-9999px";
    },
  });

  // PDF generation handler
  const handleDownloadPDF = async () => {
    try {
      setError("");
      const element = componentRef.current;

      // Temporarily make the report visible for rendering
      element.style.visibility = "visible";
      element.style.position = "absolute";
      element.style.left = "0";

      // Wait for fonts and rendering to complete
      await document.fonts.ready;

      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        useCORS: true, // Handle cross-origin images if any
        logging: false, // Disable logging for cleaner console
        backgroundColor: "#fff", // Ensure white background
      });

      // Restore hidden state
      element.style.visibility = "hidden";
      element.style.position = "absolute";
      element.style.left = "-9999px";

      // Verify canvas is valid
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("Failed to generate a valid canvas.");
      }

      const imgData = canvas.toDataURL("image/png");

      // Verify image data
      if (!imgData || imgData === "data:,") {
        throw new Error("Generated image data is invalid.");
      }

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Visit_Report_${moment().format("YYYY-MM-DD")}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      setError("Failed to generate PDF. Please try again.");
    }
  };

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

      await fetchVisits();
    };

    fetchData();
  }, [user, fetchUser, token, navigate]);

  // Function to fetch visits with filters
  const fetchVisits = async () => {
    setLoading(true);
    setError("");

    try {
      let url = "https://api.regisamtech.co.ke/visit/";
      if (user.role === "admin") {
        const params = new URLSearchParams();
        if (startDate) params.append("start_date", startDate);
        if (endDate) params.append("end_date", endDate);
        if (userIdFilter) params.append("user_id", userIdFilter);
        if (doctorName) params.append("doctor_name", doctorName);
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
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
    setEditVisitDate(moment(visit.visit_date, "YYYY-MM-DD HH:mm:ss"));
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
      const response = await fetch(`https://api.regisamtech.co.ke/visit/${editingVisit.id}`, {
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
      const response = await fetch(`https://api.regisamtech.co.ke/visit/${visitId}`, {
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
      {editingVisit && (
        <Row className="mb-4">
          <Col md="12">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Edit Visit</Card.Title>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleUpdate}>
                  <Row>
                    <Col md="6">
                      <Form.Group>
                        <label>Doctor Name</label>
                        <Form.Control
                          value={editDoctorName}
                          onChange={(e) => setEditDoctorName(e.target.value)}
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
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
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
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                      <Form.Group>
                        <label>Notes</label>
                        <Form.Control
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Enter any notes (optional)"
                          as="textarea"
                          rows="3"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button variant="info" type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Visit"}
                  </Button>{" "}
                  <Button variant="secondary" onClick={() => setEditingVisit(null)}>
                    Cancel
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      <Row>
        <Col md="12">
          <Card className="strpied-tabled-with-hover">
            <Card.Header>
              <Card.Title as="h4">Doctor Visits</Card.Title>
              <p className="card-category">
                {user.role === "admin" ? "All visits (Admin View)" : "Your logged visits"}
              </p>
            </Card.Header>
            <Card.Body className="table-full-width table-responsive px-0">
              {error && (
                <Alert variant="danger" onClose={() => setError("")} dismissible>
                  {error}
                </Alert>
              )}
              <div className="mb-3">
                <Button variant="primary" onClick={handlePrint} className="me-2">
                  Print
                </Button>
                <Button variant="success" onClick={handleDownloadPDF}>
                  Download PDF
                </Button>
              </div>
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
                        <Form.Label>User ID</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="e.g., 2"
                          value={userIdFilter}
                          onChange={(e) => setUserIdFilter(e.target.value)}
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
              {/* Report Template */}
              <div
                style={{
                  position: "absolute",
                  left: "-9999px",
                  visibility: "hidden",
                  width: "210mm",
                  backgroundColor: "#fff",
                }}
              >
                <div
                  ref={componentRef}
                  style={{
                    padding: "20mm",
                    fontFamily: "'Helvetica', 'Arial', sans-serif",
                    fontSize: "12px",
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "#fff",
                  }}
                >
                  <div style={{ textAlign: "center", marginBottom: "15px" }}>
                    <h1 style={{ fontSize: "20px", margin: "0", fontWeight: "bold" }}>
                      Doctor Visit Report
                    </h1>
                    <p style={{ fontSize: "12px", color: "#555", margin: "5px 0" }}>
                      Generated on {moment().format("MMMM D, YYYY")}
                    </p>
                    {user.role === "admin" && (
                      <p style={{ fontSize: "10px", color: "#777", margin: "5px 0" }}>
                        {startDate && `From: ${startDate} `}
                        {endDate && `To: ${endDate} `}
                        {userIdFilter && `User ID: ${userIdFilter} `}
                        {doctorName && `Doctor: ${doctorName}`}
                      </p>
                    )}
                  </div>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "10px",
                      marginBottom: "15px",
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: "#f5f5f5" }}>
                        <th style={{ border: "1px solid #ccc", padding: "6px", fontWeight: "bold" }}>
                          ID
                        </th>
                        <th style={{ border: "1px solid #ccc", padding: "6px", fontWeight: "bold" }}>
                          Doctor
                        </th>
                        <th style={{ border: "1px solid #ccc", padding: "6px", fontWeight: "bold" }}>
                          Location
                        </th>
                        <th style={{ border: "1px solid #ccc", padding: "6px", fontWeight: "bold" }}>
                          Date
                        </th>
                        <th style={{ border: "1px solid #ccc", padding: "6px", fontWeight: "bold" }}>
                          Notes
                        </th>
                        {user.role === "admin" && (
                          <th style={{ border: "1px solid #ccc", padding: "6px", fontWeight: "bold" }}>
                            Logged By
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {visits.map((visit) => (
                        <tr key={visit.id}>
                          <td style={{ border: "1px solid #ccc", padding: "6px" }}>
                            {visit.id}
                          </td>
                          <td style={{ border: "1px solid #ccc", padding: "6px" }}>
                            {visit.doctor_name}
                          </td>
                          <td style={{ border: "1px solid #ccc", padding: "6px" }}>
                            {visit.location}
                          </td>
                          <td style={{ border: "1px solid #ccc", padding: "6px" }}>
                            {moment(visit.visit_date).format("YYYY-MM-DD HH:mm")}
                          </td>
                          <td style={{ border: "1px solid #ccc", padding: "6px" }}>
                            {visit.notes || "-"}
                          </td>
                          {user.role === "admin" && (
                            <td style={{ border: "1px solid #ccc", padding: "6px" }}>
                              {visit.user_name}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ textAlign: "center", fontSize: "10px", color: "#777" }}>
                    <p style={{ margin: "5px 0" }}>Total Visits: {visits.length}</p>
                    <p style={{ margin: "5px 0" }}>
                      © {new Date().getFullYear()} Healthcare System
                    </p>
                  </div>
                </div>
              </div>
              {/* Main Table */}
              {visits.length === 0 ? (
                <p className="text-center">No visits found.</p>
              ) : (
                <Table className="table-hover table-striped">
                  <thead>
                    <tr>
                      <th className="border-0">ID</th>
                      <th className="border-0">Doctor</th>
                      <th className="border-0">Location</th>
                      <th className="border-0">Date</th>
                      <th className="border-0">Notes</th>
                      {user.role === "admin" && <th className="border-0">Logged By</th>}
                      <th className="border-0">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits.map((visit) => (
                      <tr key={visit.id}>
                        <td>{visit.id}</td>
                        <td>{visit.doctor_name}</td>
                        <td>{visit.location}</td>
                        <td>{moment(visit.visit_date).format("YYYY-MM-DD HH:mm")}</td>
                        <td>{visit.notes}</td>
                        {user.role === "admin" && <td>{visit.user_name}</td>}
                        <td>
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => handleEdit(visit)}
                          >
                            Edit
                          </Button>{" "}
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
    </Container>
  );
}

export default VisitList;
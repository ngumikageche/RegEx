import React, { useState, useEffect, useCallback, useContext } from "react";
import { Modal, Button, Form, Spinner, Table, Nav } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { NotificationContext } from "../context/NotificationContext";
import { fetchVisits, createVisit, updateVisit, deleteVisit } from "../api/visits";

function VisitLog() {
  const [visits, setVisits] = useState([]);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [editVisitId, setEditVisitId] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("visitList");
  const { addNotification } = useContext(NotificationContext);

  const getToken = () => localStorage.getItem("auth_token");
  const user = JSON.parse(localStorage.getItem("user") || "{}"); // Assuming user data is stored in localStorage

  const { register, handleSubmit, reset, clearErrors, formState: { errors } } = useForm();
  const [filter, setFilter] = useState({
    startDate: "",
    endDate: "",
    userIdFilter: "",
    doctorName: "",
  });

  // Fetch visits with filters for admins
  const fetchVisitsCallback = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchVisits(getToken(), {
        user,
        startDate: filter.startDate,
        endDate: filter.endDate,
        userIdFilter: filter.userIdFilter,
        doctorName: filter.doctorName,
      });
      setVisits(data || []);
    } catch (err) {
      addNotification({ message: err.message || "Failed to fetch visits", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [addNotification, user, filter.startDate, filter.endDate, filter.userIdFilter, filter.doctorName]);

  useEffect(() => {
    fetchVisitsCallback();
  }, [fetchVisitsCallback]);

  // Handle creating or updating a visit
  const handleSaveVisit = async (data) => {
    setLoading(true);
    try {
      if (editVisitId) {
        await updateVisit(getToken(), editVisitId, {
          patient_name: data.patientName,
          doctor_name: data.doctorName,
          visit_date: data.visitDate,
          notes: data.notes,
        });
        addNotification({ message: "Visit updated successfully", type: "success" });
      } else {
        await createVisit(getToken(), {
          patient_name: data.patientName,
          doctor_name: data.doctorName,
          visit_date: data.visitDate,
          notes: data.notes,
        });
        addNotification({ message: "Visit logged successfully", type: "success" });
      }
      setShowVisitModal(false);
      setEditVisitId(null);
      reset();
      clearErrors();
      fetchVisitsCallback();
    } catch (err) {
      addNotification({ message: err.message || "Failed to save visit", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a visit
  const handleDeleteVisit = async (id) => {
    if (!window.confirm("Delete this visit?")) return;
    setLoading(true);
    try {
      await deleteVisit(getToken(), id);
      fetchVisitsCallback();
      addNotification({ message: "Visit deleted successfully", type: "success" });
    } catch (err) {
      addNotification({ message: err.message || "Failed to delete visit", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handle editing a visit
  const handleEditVisit = (visit) => {
    setEditVisitId(visit.id);
    reset({
      patientName: visit.patient_name,
      doctorName: visit.doctor_name,
      visitDate: visit.visit_date,
      notes: visit.notes,
    });
    setShowVisitModal(true);
  };

  // Handle viewing a visit
  const handleViewVisit = (visit) => {
    setSelectedVisit(visit);
    setShowViewModal(true);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  // Apply filters (trigger fetch)
  const handleApplyFilters = () => {
    fetchVisitsCallback();
  };

  // Calculate visit counts
  const totalVisits = visits.length;
  const activeVisits = visits.filter((visit) => visit.status === "Active").length;

  return (
    <div className="content">
      <div className="container-fluid p-4">
        <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
          <Nav.Item>
            <Nav.Link
              eventKey="visitList"
              active={activeTab === "visitList"}
              style={{ color: activeTab === "visitList" ? "#6f42c1" : "#000" }}
            >
              Visit List
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {activeTab === "visitList" && (
          <>
            {loading && (
              <div className="d-flex justify-content-center mb-4">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            )}
            <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3>Visits</h3>
                <div>
                  <Button variant="purple" style={{ marginRight: "10px" }} onClick={() => setShowVisitModal(true)}>
                    Log New Visit
                  </Button>
                  <Button variant="secondary">Export Visits (Excel)</Button>
                </div>
              </div>

              {/* Admin Filters */}
              {user?.role === "admin" && (
                <div style={{ marginBottom: "20px" }}>
                  <Form inline>
                    <Form.Group className="mb-2 mr-2">
                      <Form.Label className="mr-2">Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="startDate"
                        value={filter.startDate}
                        onChange={handleFilterChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-2 mr-2">
                      <Form.Label className="mr-2">End Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="endDate"
                        value={filter.endDate}
                        onChange={handleFilterChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-2 mr-2">
                      <Form.Label className="mr-2">User ID</Form.Label>
                      <Form.Control
                        type="text"
                        name="userIdFilter"
                        value={filter.userIdFilter}
                        onChange={handleFilterChange}
                        placeholder="Enter User ID"
                      />
                    </Form.Group>
                    <Form.Group className="mb-2 mr-2">
                      <Form.Label className="mr-2">Doctor Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="doctorName"
                        value={filter.doctorName}
                        onChange={handleFilterChange}
                        placeholder="Enter Doctor Name"
                      />
                    </Form.Group>
                    <Button variant="purple" onClick={handleApplyFilters}>
                      Apply Filters
                    </Button>
                  </Form>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
                <span>Total Visits: {totalVisits} | Active: {activeVisits}</span>
              </div>

              {loading ? (
                <div className="text-center">
                  <i className="fas fa-spinner fa-spin"></i> Loading...
                </div>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Doctor Name</th>
                      <th>Visit Date</th>
                      <th>Notes</th>
                      <th>Status</th>
                      <th>Operation</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center">
                          No visits available.
                        </td>
                      </tr>
                    ) : (
                      visits.map((visit) => (
                        <tr key={visit.id}>
                          <td>{visit.patient_name}</td>
                          <td>{visit.doctor_name}</td>
                          <td>{new Date(visit.visit_date).toLocaleDateString()}</td>
                          <td>{visit.notes || "N/A"}</td>
                          <td>
                            <span
                              style={{
                                backgroundColor: visit.status === "Active" ? "#d4edda" : "#f8d7da",
                                padding: "5px 10px",
                                borderRadius: "10px",
                                color: visit.status === "Active" ? "#155724" : "#721c24",
                              }}
                            >
                              {visit.status || "Active"}
                            </span>
                          </td>
                          <td>
                            <i
                              className="fas fa-pen"
                              onClick={() => handleEditVisit(visit)}
                              style={{ cursor: "pointer", marginRight: "10px" }}
                            ></i>
                            <i
                              className="fas fa-trash"
                              onClick={() => handleDeleteVisit(visit.id)}
                              style={{ cursor: "pointer" }}
                            ></i>
                          </td>
                          <td>
                            <Button variant="primary" size="sm" onClick={() => handleViewVisit(visit)}>
                              View
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </div>
          </>
        )}

        {/* Visit Modal (Create/Edit) */}
        <Modal
          show={showVisitModal}
          onHide={() => {
            setShowVisitModal(false);
            setEditVisitId(null);
            reset();
            clearErrors();
          }}
          centered
          animation
          className="animate__animated animate__slideInUp"
        >
          <Modal.Header closeButton>
            <Modal.Title>{editVisitId ? "Edit Visit" : "Log Visit"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit(handleSaveVisit)}>
              <Form.Group className="mb-3" controlId="patientName">
                <Form.Label>Patient Name</Form.Label>
                <Form.Control
                  {...register("patientName", { required: "Patient name is required" })}
                  isInvalid={!!errors.patientName}
                  placeholder="Enter patient name"
                  autoFocus
                />
                <Form.Control.Feedback type="invalid">
                  {errors.patientName?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="doctorName">
                <Form.Label>Doctor Name</Form.Label>
                <Form.Control
                  {...register("doctorName", { required: "Doctor name is required" })}
                  isInvalid={!!errors.doctorName}
                  placeholder="Enter doctor name"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.doctorName?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="visitDate">
                <Form.Label>Visit Date</Form.Label>
                <Form.Control
                  type="date"
                  {...register("visitDate", { required: "Visit date is required" })}
                  isInvalid={!!errors.visitDate}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.visitDate?.message}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="notes">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  {...register("notes")}
                  placeholder="Enter notes"
                />
              </Form.Group>
              <div className="d-flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowVisitModal(false);
                    setEditVisitId(null);
                    reset();
                    clearErrors();
                  }}
                  className="btn-fill flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="success"
                  type="submit"
                  className="btn-fill flex-1"
                  disabled={loading}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : editVisitId ? "Update Visit" : "Log Visit"}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* View Visit Modal */}
        <Modal
          show={showViewModal}
          onHide={() => setShowViewModal(false)}
          centered
          animation
          className="animate__animated animate__slideInUp"
        >
          <Modal.Header closeButton>
            <Modal.Title>Visit Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedVisit && (
              <div>
                <p><strong>Patient Name:</strong> {selectedVisit.patient_name}</p>
                <p><strong>Doctor Name:</strong> {selectedVisit.doctor_name}</p>
                <p><strong>Visit Date:</strong> {new Date(selectedVisit.visit_date).toLocaleDateString()}</p>
                <p><strong>Notes:</strong> {selectedVisit.notes || "N/A"}</p>
                <p><strong>Status:</strong> {selectedVisit.status || "Active"}</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default VisitLog;
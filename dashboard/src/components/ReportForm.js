import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

const ReportForm = ({ show, onHide, token, user, report, visits, onSave }) => {
  const [title, setTitle] = useState("");
  const [visitId, setVisitId] = useState("");
  const [reportText, setReportText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (report) {
      setTitle(report.title);
      setVisitId(report.visit_id);
      setReportText(report.report_text);
    } else {
      setTitle("");
      setVisitId("");
      setReportText("");
    }
  }, [report]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const data = {
      visit_id: visitId,
      title,
      report_text: reportText,
    };

    const url = report
      ? `http://127.0.0.1:5000/report/${report.id}`
      : "http://127.0.0.1:5000/report/";
    const method = report ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-User-Role": user.role,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        setSuccess(report ? "Report updated successfully." : "Report created successfully.");
        onSave();
        setTimeout(() => {
          onHide();
        }, 1000);
      } else {
        setError(result.error || "Failed to save report.");
      }
    } catch (err) {
      console.error("Error saving report:", err);
      setError("An error occurred while saving the report.");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{report ? "Edit Report" : "Create Report"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formVisit">
            <Form.Label>Visit</Form.Label>
            <Form.Control
              as="select"
              value={visitId}
              onChange={(e) => setVisitId(e.target.value)}
              required
              disabled={!!report} // Can't change visit when editing
            >
              <option value="">Select a visit</option>
              {visits.map((visit) => (
                <option key={visit.id} value={visit.id}>
                  {visit.doctor_name} - {visit.location} ({new Date(visit.visit_date).toLocaleDateString()})
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter report title"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formReportText">
            <Form.Label>Report Text</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              required
              placeholder="Enter report details"
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            {report ? "Update Report" : "Create Report"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ReportForm;
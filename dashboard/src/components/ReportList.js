import React, { useEffect, useState } from "react";
import { Table, Spinner } from "react-bootstrap";

const API_BASE = process.env.REACT_APP_API_URL || process.env.VITE_API_URL || "http://localhost:8000";

function ReportList({ user, token, role, onEdit }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };
        if (role === "admin") {
          headers["X-User-Role"] = role; // Add role header for admin
        }

        const response = await fetch(`${API_BASE}/report/`, {
          method: "GET",
          headers,
        });

        if (response.status === 401 || response.status === 422) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_role");
          window.location.href = "/auth/login"; // Redirect on auth failure
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch reports: ${response.status}`);
        }

        const data = await response.json();
        setReports(data.reports || []);
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [token, role]);

  if (loading) {
    return <Spinner animation="border" />;
  }

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((report) => (
          <tr key={report.id}>
            <td>{report.id}</td>
            <td>{report.title}</td>
            <td>
              <button onClick={() => onEdit(report)}>Edit</button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default ReportList;
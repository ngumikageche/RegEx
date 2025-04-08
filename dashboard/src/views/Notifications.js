// src/views/Notifications.js
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
} from "react-bootstrap";
import { UserContext } from "../context/UserContext";

function Notifications() {
  const { user, fetchUser } = useContext(UserContext);
  const navigate = useNavigate();
  const token = localStorage.getItem("auth_token");

  // State for notifications
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch notifications on mount
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

      await fetchNotifications();
    };

    fetchData();
  }, [user, fetchUser, token, navigate]);

  // Function to fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:5000/notification/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setNotifications(data.notifications);
      } else {
        setError(data.error || "Failed to fetch notifications.");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("An error occurred while fetching notifications.");
    } finally {
      setLoading(false);
    }
  };

  // Handle mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/notification/${notificationId}/read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setNotifications(
          notifications.map((notification) =>
            notification.id === notificationId ? { ...notification, is_read: true } : notification
          )
        );
      } else {
        setError(data.error || "Failed to mark notification as read.");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setError("An error occurred while marking the notification as read.");
    }
  };

  // Handle delete notification
  const handleDelete = async (notificationId) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/notification/${notificationId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setNotifications(notifications.filter((notification) => notification.id !== notificationId));
      } else {
        setError(data.error || "Failed to delete notification.");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      setError("An error occurred while deleting the notification.");
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
              <Card.Title as="h4">Notifications</Card.Title>
              <p className="card-category">Your recent notifications</p>
            </Card.Header>
            <Card.Body className="table-full-width table-responsive px-0">
              {error && (
                <Alert variant="danger" onClose={() => setError("")} dismissible>
                  {error}
                </Alert>
              )}
              {notifications.length === 0 ? (
                <p className="text-center">No notifications found.</p>
              ) : (
                <Table className="table-hover table-striped">
                  <thead>
                    <tr>
                      <th className="border-0">ID</th>
                      <th className="border-0">Message</th>
                      <th className="border-0">Created At</th>
                      <th className="border-0">Status</th>
                      <th className="border-0">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notifications.map((notification) => (
                      <tr key={notification.id}>
                        <td>{notification.id}</td>
                        <td>{notification.message}</td>
                        <td>{notification.created_at}</td>
                        <td>{notification.is_read ? "Read" : "Unread"}</td>
                        <td>
                          {!notification.is_read && (
                            <Button
                              variant="info"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="me-2"
                            >
                              Mark as Read
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(notification.id)}
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

export default Notifications;
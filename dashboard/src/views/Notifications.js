import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Container,
  Row,
  Col,
  Table,
  Spinner,
  Button,
} from "react-bootstrap";
import { useNotification } from "../context/NotificationContext";

function Notifications() {
  const { addNotification, fetchUnreadNotifications } = useNotification();
  const navigate = useNavigate();
  const token = localStorage.getItem("auth_token");

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      addNotification({ message: "No authentication token found. Please log in.", type: "error" });
      navigate("/auth/login", { replace: true });
      return;
    }
    fetchNotifications();
  }, [token, navigate, addNotification]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api.regisamtech.co.ke/notification/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setNotifications(data.notifications || []);
        fetchUnreadNotifications(); // Update unread count
      } else {
        addNotification({ message: data.error || "Failed to fetch notifications.", type: "error" });
      }
    } catch (error) {
      addNotification({ message: "An error occurred while fetching notifications.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch(`https://api.regisamtech.co.ke/notification/${notificationId}/read`, {
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
        fetchUnreadNotifications(); // Update unread count
        addNotification({ message: "Notification marked as read.", type: "success" });
      } else {
        addNotification({ message: data.error || "Failed to mark notification as read.", type: "error" });
      }
    } catch (error) {
      addNotification({ message: "An error occurred while marking the notification as read.", type: "error" });
    }
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    try {
      const response = await fetch(`https://api.regisamtech.co.ke/notification/${notificationId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setNotifications(notifications.filter((notification) => notification.id !== notificationId));
        fetchUnreadNotifications(); // Update unread count
        addNotification({ message: "Notification deleted successfully!", type: "success" });
      } else {
        addNotification({ message: data.error || "Failed to delete notification.", type: "error" });
      }
    } catch (error) {
      addNotification({ message: "An error occurred while deleting the notification.", type: "error" });
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
    <Container fluid className="animate__animated animate__fadeIn">
      <Row>
        <Col md="12">
          <Card className="shadow-sm">
            <Card.Header>
              <Card.Title as="h4">Notifications</Card.Title>
              <p className="card-category">Your recent notifications</p>
            </Card.Header>
            <Card.Body className="table-full-width table-responsive px-0">
              {notifications.length === 0 ? (
                <p className="text-center text-muted">No notifications found.</p>
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
                        <td>{new Date(notification.created_at).toLocaleString()}</td>
                        <td>{notification.is_read ? "Read" : "Unread"}</td>
                        <td>
                          {!notification.is_read && (
                            <Button
                              variant="info"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="me-2 btn-fill"
                            >
                              Mark as Read
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(notification.id)}
                            className="btn-fill"
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
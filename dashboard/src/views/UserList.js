import React, { useState, useEffect, useContext } from "react";
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
import { UserContext } from "../context/UserContext";
import { useNotification } from "../context/NotificationContext";

function UserList() {
  const { user, fetchUser } = useContext(UserContext);
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const token = localStorage.getItem("auth_token");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      addNotification({ message: "No authentication token found. Please log in.", type: "error" });
      navigate("/auth/login", { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        if (!user) {
          await fetchUser(token);
        }
      } catch (err) {
        addNotification({ message: "Failed to load user data. Please log in again.", type: "error" });
        navigate("/auth/login", { replace: true });
        return;
      }

      if (user && user.role !== "admin") {
        addNotification({ message: "Unauthorized. Only admins can view the user list.", type: "error" });
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      try {
        const response = await fetch("https://api.regisamtech.co.ke/user/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUsers(data || []);
        } else {
          addNotification({ message: data.error || "Failed to fetch users.", type: "error" });
        }
      } catch (error) {
        addNotification({ message: "An error occurred while fetching users.", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, fetchUser, token, navigate, addNotification]);

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`https://api.regisamtech.co.ke/user/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setUsers(users.filter((user) => user.id !== userId));
        addNotification({ message: "User deleted successfully!", type: "success" });
      } else {
        addNotification({ message: data.error || "Failed to delete user.", type: "error" });
      }
    } catch (error) {
      addNotification({ message: "An error occurred while deleting the user.", type: "error" });
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
              <Card.Title as="h4">User List</Card.Title>
              <p className="card-category">List of all registered users (Admin Only)</p>
            </Card.Header>
            <Card.Body className="table-full-width table-responsive px-0">
              {users.length === 0 ? (
                <p className="text-center text-muted">No users found.</p>
              ) : (
                <Table className="table-hover table-striped">
                  <thead>
                    <tr>
                      <th className="border-0">ID</th>
                      <th className="border-0">Username</th>
                      <th className="border-0">Email</th>
                      <th className="border-0">Role</th>
                      <th className="border-0">First Name</th>
                      <th className="border-0">Last Name</th>
                      <th className="border-0">Country</th>
                      <th className="border-0">City</th>
                      <th className="border-0">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{user.first_name || "N/A"}</td>
                        <td>{user.last_name || "N/A"}</td>
                        <td>{user.country || "N/A"}</td>
                        <td>{user.city || "N/A"}</td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
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

export default UserList;
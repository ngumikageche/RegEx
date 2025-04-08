// src/views/UserList.js
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
} from "react-bootstrap";
import { UserContext } from "../context/UserContext";

function UserList() {
  const { user, fetchUser } = useContext(UserContext);
  const navigate = useNavigate();
  const token = localStorage.getItem("auth_token");

  // State for the user list
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch user data and list of users on mount
  useEffect(() => {
    if (!token) {
      navigate("/auth/login", { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch the logged-in user's data if not already available
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

      // Check if the user is an admin
      if (user && user.role !== "admin") {
        setError("Unauthorized. Only admins can view the user list.");
        setLoading(false);
        return;
      }

      // Fetch the list of users
      try {
        const response = await fetch("http://127.0.0.1:5000/user/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUsers(data);
        } else {
          setError(data.error || "Failed to fetch users.");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("An error occurred while fetching users.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, fetchUser, token, navigate]);

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
              <Card.Title as="h4">User List</Card.Title>
              <p className="card-category">
                List of all registered users (Admin Only)
              </p>
            </Card.Header>
            <Card.Body className="table-full-width table-responsive px-0">
              {error && (
                <Alert variant="danger" onClose={() => setError("")} dismissible>
                  {error}
                </Alert>
              )}
              {users.length === 0 && !error ? (
                <p className="text-center">No users found.</p>
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
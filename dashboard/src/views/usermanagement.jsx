import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { NotificationContext } from "../context/NotificationContext";
import { Card, Button, Modal, Form, Container, Row, Col, Spinner, Table, Nav } from "react-bootstrap";
import defaultAvatar from "../assets/img/default-avatar.png";
import {
  fetchUsers as apiFetchUsers,
  fetchRoles as apiFetchRoles,
  addUser as apiAddUser,
  updateUser as apiUpdateUser,
  addRole as apiAddRole,
  changePassword as apiChangePassword
} from "../api/users";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [form, setForm] = useState({ name: "", mobile: "", email: "", status: "Active" });
  const [groupForm, setGroupForm] = useState({ groupName: "", description: "", status: "Active" });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" }); // For password change
  const [activeTab, setActiveTab] = useState("memberList");
  const token = localStorage.getItem("auth_token");
  const navigate = useNavigate();
  const { user, fetchUser, setUser } = useContext(UserContext);
  const { addNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const users = await apiFetchUsers();
      setUsers(users);
    } catch (err) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const roles = await apiFetchRoles();
      setRoles(roles);
    } catch (err) {
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (type, user = null, role = null) => {
    setModalType(type);
    if (type === "addUser" || type === "editUser") {
      setSelectedUser(user);
      setForm(user ? { name: user.name, mobile: user.mobile, email: user.email, status: user.status } : { name: "", mobile: "", email: "", status: "Active" });
    } else if (type === "addRole" || type === "editRole") {
      setSelectedRole(role);
      setRoleForm(role ? { roleName: role.roleName, description: role.description, status: role.status } : { roleName: "", description: "", status: "Active" });
    } else if (type === "changePassword") {
      setSelectedUser(user);
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setSelectedRole(null);
    setForm({ name: "", mobile: "", email: "", status: "Active" });
    setGroupForm({ groupName: "", description: "", status: "Active" });
    setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGroupFormChange = (e) => {
    setGroupForm({ ...groupForm, [e.target.name]: e.target.value });
  };

  const handlePasswordFormChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 3) {
      addNotification({ message: "Name must be at least 3 characters long.", type: "error" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      addNotification({ message: "Please enter a valid email address.", type: "error" });
      return;
    }
    const userData = {
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim(),
      status: form.status,
    };
    try {
      const { ok, data } = await apiAddUser(userData);
      if (ok) {
        addNotification({ message: "User added successfully!", type: "success" });
        setForm({ name: "", mobile: "", email: "", status: "Active" });
        fetchUsers();
        handleCloseModal();
      } else {
        addNotification({ message: data.message || "Failed to add user. Please try again.", type: "error" });
        if (data.status === 401 || data.status === 422) {
          addNotification({ message: "Your session has expired. Please log in again.", type: "error" });
          localStorage.removeItem("auth_token");
          setUser(null);
          navigate("/auth/login", { replace: true });
        }
      }
    } catch (error) {
      addNotification({ message: "An error occurred while adding the user.", type: "error" });
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    const updatedData = {
      name: form.name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim(),
      status: form.status,
    };
    try {
      const { ok, data } = await apiUpdateUser(selectedUser.id, updatedData);
      if (ok) {
        addNotification({ message: "User updated successfully!", type: "success" });
        fetchUsers();
        handleCloseModal();
      } else {
        addNotification({ message: data.error || "Failed to update user.", type: "error" });
      }
    } catch (error) {
      addNotification({ message: "An error occurred while updating the user.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async (e) => {
    e.preventDefault();
    if (roleForm.roleName.trim().length < 3) {
      addNotification({ message: "Role name must be at least 3 characters long.", type: "error" });
      return;
    }
    const roleData = {
      roleName: roleForm.roleName.trim(),
      description: roleForm.description.trim(),
      status: roleForm.status,
    };
    try {
      const { ok, data } = await apiAddRole(roleData);
      if (ok) {
        addNotification({ message: "Role added successfully!", type: "success" });
        setRoleForm({ roleName: "", description: "", status: "Active" });
        fetchRoles();
        handleCloseModal();
      } else {
        addNotification({ message: data.message || "Failed to add role. Please try again.", type: "error" });
      }
    } catch (error) {
      addNotification({ message: "An error occurred while adding the role.", type: "error" });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addNotification({ message: "New password and confirm password do not match.", type: "error" });
      setLoading(false);
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      addNotification({ message: "New password must be at least 6 characters long.", type: "error" });
      setLoading(false);
      return;
    }
    const passwordData = {
      old_password: passwordForm.oldPassword,
      new_password: passwordForm.newPassword,
    };
    try {
      const { ok, data } = await apiChangePassword(selectedUser.id, passwordData);
      if (ok) {
        addNotification({ message: "Password updated successfully!", type: "success" });
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        handleCloseModal();
      } else {
        addNotification({ message: data.error || "Failed to update password.", type: "error" });
      }
    } catch (error) {
      addNotification({ message: "An error occurred while changing the password.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const currentUser = user || null;

  // Calculate accurate counts
  const totalMembers = users.length;
  const currentUsed = users.filter(user => user.status === "Active").length;

  return (
    <Container className="mt-4">
      <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        <Nav.Item>
          <Nav.Link eventKey="memberList" active={activeTab === "memberList"} style={{ color: activeTab === "memberList" ? "#6f42c1" : "#000" }}>
            Member List
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="manageRoles" active={activeTab === "manageRoles"} style={{ color: activeTab === "manageRoles" ? "#6f42c1" : "#000" }}>
            Manage Roles
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {activeTab === "memberList" && (
        <Row>
          <Col md={12}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <Button variant="purple" onClick={() => handleShowModal("addUser")}>Add new</Button>
                <Button variant="secondary" className="ms-2">Import members</Button>
                <Button variant="secondary" className="ms-2">Export members (Excel)</Button>
              </div>
              <div>
                <span>Total members: {totalMembers}</span>
                <span className="ms-3">Current used: {currentUsed}</span>
                <Button variant="purple" className="ms-3">Filter</Button>
              </div>
            </div>
            {loading ? (
              <Spinner animation="border" />
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Member name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Operation</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td><img src={user.photo || defaultAvatar} alt="Profile" style={{ width: "40px", height: "40px", borderRadius: "50%" }} /></td>
                      <td>{user.name}</td>
                      <td>{user.mobile}</td>
                      <td>{user.email}</td>
                      <td>
                        <span style={{ color: user.status === "Inactive" ? "red" : "green" }}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <Button variant="link" className="p-0 me-2" onClick={() => handleShowModal("editUser", user)}><i className="bi bi-pencil"></i></Button>
                        <Button variant="link" className="p-0 me-2" onClick={() => {/* Delete logic */}}><i className="bi bi-trash"></i></Button>
                        <Button variant="link" className="p-0" onClick={() => handleShowModal("changePassword", user)}>Change Password</Button>
                      </td>
                      <td>
                        <Button variant="link" className="p-0">Login</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Col>
        </Row>
      )}

      {activeTab === "manageRoles" && (
        <Row>
          <Col md={12}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <Button variant="purple" onClick={() => handleShowModal("addRole")}>Add new</Button>
                <Button variant="secondary" className="ms-2">Import roles</Button>
                <Button variant="secondary" className="ms-2">Export roles (Excel)</Button>
              </div>
              <div>
                <span>Total roles: {roles.length}</span>
                <span className="ms-3">Current used: {roles.filter(r => r.status === "Active").length}</span>
                <Button variant="purple" className="ms-3">Filter</Button>
              </div>
            </div>
            {loading ? (
              <Spinner animation="border" />
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Role Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Operation</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr key={role.id}>
                      <td><img src={role.photo || defaultAvatar} alt="Role" style={{ width: "40px", height: "40px", borderRadius: "50%" }} /></td>
                      <td>{role.roleName}</td>
                      <td>{role.description || "N/A"}</td>
                      <td>
                        <span style={{ color: role.status === "Inactive" ? "red" : "green" }}>
                          {role.status}
                        </span>
                      </td>
                      <td>
                        <Button variant="link" className="p-0 me-2" onClick={() => handleShowModal("editRole", null, role)}><i className="bi bi-pencil"></i></Button>
                        <Button variant="link" className="p-0 me-2" onClick={() => {/* Delete logic */}}><i className="bi bi-trash"></i></Button>
                      </td>
                      <td>
                        <Button variant="link" className="p-0">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Col>
        </Row>
      )}

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "addUser" && "Add User"}
            {modalType === "editUser" && "Edit User"}
            {modalType === "addRole" && "Add Role"}
            {modalType === "editRole" && "Edit Role"}
            {modalType === "changePassword" && "Change Password"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === "addUser" && (
            <Form onSubmit={handleAddUser}>
              <Form.Group className="mb-3">
                <Form.Label>Member name</Form.Label>
                <Form.Control type="text" name="name" value={form.name} onChange={handleFormChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mobile</Form.Label>
                <Form.Control type="text" name="mobile" value={form.mobile} onChange={handleFormChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" value={form.email} onChange={handleFormChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Control as="select" name="status" value={form.status} onChange={handleFormChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Control>
              </Form.Group>
              <Button variant="purple" type="submit" disabled={loading}>
                {loading ? <><Spinner animation="border" size="sm" /> Adding...</> : "Add User"}
              </Button>
            </Form>
          )}
          {modalType === "editUser" && (
            <Form onSubmit={handleUpdateUser}>
              <Form.Group className="mb-3">
                <Form.Label>Member name</Form.Label>
                <Form.Control type="text" name="name" value={form.name} onChange={handleFormChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mobile</Form.Label>
                <Form.Control type="text" name="mobile" value={form.mobile} onChange={handleFormChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" value={form.email} onChange={handleFormChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Control as="select" name="status" value={form.status} onChange={handleFormChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Control>
              </Form.Group>
              <Button variant="info" type="submit" disabled={loading}>
                {loading ? <><Spinner animation="border" size="sm" /> Updating...</> : "Update User"}
              </Button>
            </Form>
          )}
          {modalType === "addRole" && (
            <Form onSubmit={handleAddRole}>
              <Form.Group className="mb-3">
                <Form.Label>Role Name</Form.Label>
                <Form.Control type="text" name="roleName" value={roleForm.roleName} onChange={handleRoleFormChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" name="description" value={roleForm.description} onChange={handleRoleFormChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Control as="select" name="status" value={roleForm.status} onChange={handleRoleFormChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Control>
              </Form.Group>
              <Button variant="purple" type="submit" disabled={loading}>
                {loading ? <><Spinner animation="border" size="sm" /> Adding...</> : "Add Role"}
              </Button>
            </Form>
          )}
          {modalType === "editRole" && (
            <Form onSubmit={handleAddRole}> {/* Reuse handleAddRole for simplicity; adjust if needed */}
              <Form.Group className="mb-3">
                <Form.Label>Role Name</Form.Label>
                <Form.Control type="text" name="roleName" value={roleForm.roleName} onChange={handleRoleFormChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" name="description" value={roleForm.description} onChange={handleRoleFormChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Control as="select" name="status" value={roleForm.status} onChange={handleRoleFormChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Control>
              </Form.Group>
              <Button variant="info" type="submit" disabled={loading}>
                {loading ? <><Spinner animation="border" size="sm" /> Updating...</> : "Update Role"}
              </Button>
            </Form>
          )}
          {modalType === "changePassword" && (
            <Form onSubmit={handleChangePassword}>
              <Form.Group className="mb-3">
                <Form.Label>Old Password</Form.Label>
                <Form.Control type="password" name="oldPassword" value={passwordForm.oldPassword} onChange={handlePasswordFormChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordFormChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordFormChange} required />
              </Form.Group>
              <Button variant="info" type="submit" disabled={loading}>
                {loading ? <><Spinner animation="border" size="sm" /> Changing...</> : "Change Password"}
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default UserManagement;
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { NotificationContext } from "../context/NotificationContext";
import { Card, Button, Modal, Form, Container, Row, Col, Spinner, Table, Nav } from "react-bootstrap";
import defaultAvatar from "../assets/img/default-avatar.png";
import {
  fetchUsers as apiFetchUsers,
  fetchGroups as apiFetchGroups,
  addUser as apiAddUser,
  updateUser as apiUpdateUser,
  addGroup as apiAddGroup,
  assignUsersToGroup,
  removeUsersFromGroup,
  deleteGroup,
  changePassword as apiChangePassword
} from "../api/users";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [form, setForm] = useState({ username: "", first_name: "", last_name: "", mobile: "", email: "", password: "", role: "user", status: "Active", groupId: "" });
  const [groupForm, setGroupForm] = useState({ groupName: "", description: "", status: "Active" });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" }); // For password change
  const [activeTab, setActiveTab] = useState("memberList");
  const [assignModal, setAssignModal] = useState(false);
  const [assignGroup, setAssignGroup] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const token = localStorage.getItem("auth_token");
  const navigate = useNavigate();
  const { user, fetchUser, setUser } = useContext(UserContext);
  const { addNotification } = useContext(NotificationContext);

  useEffect(() => {
    fetchUsers();
    fetchGroups();
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

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const groups = await apiFetchGroups();
      setGroups(groups);
    } catch (err) {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowAssignModal = (group) => {
    setAssignGroup(group);
    setSelectedUserIds([]);
    setAssignModal(true);
  };

  const handleCloseAssignModal = () => {
    setAssignModal(false);
    setAssignGroup(null);
    setSelectedUserIds([]);
  };

  const handleAssignUsers = async (e) => {
    e.preventDefault();
    if (!assignGroup || selectedUserIds.length === 0) {
      addNotification({ message: "Select a group and at least one user.", type: "error" });
      return;
    }
    try {
      const { ok, data } = await assignUsersToGroup(assignGroup.id, selectedUserIds);
      if (ok) {
        addNotification({ message: "Users assigned to group successfully!", type: "success" });
        fetchGroups();
        handleCloseAssignModal();
      } else {
        addNotification({ message: data.error || "Failed to assign users.", type: "error" });
      }
    } catch (error) {
      addNotification({ message: error?.message || "An error occurred while assigning users.", type: "error" });
    }
  };

  const handleShowModal = (type, user = null, group = null) => {
  const handleShowAssignModal = (group) => {
    setAssignGroup(group);
    setSelectedUserIds([]);
    setAssignModal(true);
  };

  const handleCloseAssignModal = () => {
    setAssignModal(false);
    setAssignGroup(null);
    setSelectedUserIds([]);
  };

  const handleAssignUsers = async (e) => {
    e.preventDefault();
    if (!assignGroup || selectedUserIds.length === 0) {
      addNotification({ message: "Select a group and at least one user.", type: "error" });
      return;
    }
    try {
      const { ok, data } = await assignUsersToGroup(assignGroup.id, selectedUserIds);
      if (ok) {
        addNotification({ message: "Users assigned to group successfully!", type: "success" });
        fetchGroups();
        handleCloseAssignModal();
      } else {
        addNotification({ message: data.error || "Failed to assign users.", type: "error" });
      }
    } catch (error) {
      addNotification({ message: error?.message || "An error occurred while assigning users.", type: "error" });
    }
  };
    setModalType(type);
    if (type === "addUser" || type === "editUser") {
      setSelectedUser(user);
      setForm(user ? {
        username: user.username || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        mobile: user.mobile || "",
        email: user.email || "",
        password: "",
        role: user.role || "user",
        status: user.status || "Active",
        groupId: user.group_id || ""
      } : { username: "", first_name: "", last_name: "", mobile: "", email: "", password: "", role: "user", status: "Active", groupId: "" });
    } else if (type === "addGroup" || type === "editGroup") {
      setSelectedRole(group);
      setGroupForm(group ? { groupName: group.name, description: group.description } : { groupName: "", description: "" });
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
    setForm({ username: "", first_name: "", last_name: "", mobile: "", email: "", password: "", role: "user", status: "Active", groupId: "" });
    setGroupForm({ groupName: "", description: "" });
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
    if (!form.username.trim()) {
      addNotification({ message: "Username is required.", type: "error" });
      return;
    }
    if (!form.first_name.trim()) {
      addNotification({ message: "First name is required.", type: "error" });
      return;
    }
    if (!form.last_name.trim()) {
      addNotification({ message: "Last name is required.", type: "error" });
      return;
    }
    if (!form.mobile.trim()) {
      addNotification({ message: "Mobile number is required.", type: "error" });
      return;
    }
    if (!form.email.trim()) {
      addNotification({ message: "Email is required.", type: "error" });
      return;
    }
    if (!form.password.trim()) {
      addNotification({ message: "Password is required.", type: "error" });
      return;
    }
    if (form.password.length < 6) {
      addNotification({ message: "Password must be at least 6 characters long.", type: "error" });
      return;
    }
    if (!form.role || !["admin", "user"].includes(form.role)) {
      addNotification({ message: "Role must be 'admin' or 'user'.", type: "error" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      addNotification({ message: "Email address is invalid.", type: "error" });
      return;
    }
    if (!form.groupId) {
      addNotification({ message: "Group selection is required.", type: "error" });
      return;
    }
    const userData = {
      username: form.username.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      status: form.status,
      group_id: form.groupId,
    };
    try {
      const { ok, data } = await apiAddUser(userData);
      if (ok) {
        addNotification({ message: "User added successfully!", type: "success" });
        setForm({ name: "", mobile: "", email: "", status: "Active", groupId: "" });
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
      username: form.username.trim(),
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim(),
      status: form.status,
      group_id: form.groupId,
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

  const handleAddGroup = async (e) => {
    e.preventDefault();
    if (groupForm.groupName.trim().length < 3) {
      addNotification({ message: "Group name must be at least 3 characters long.", type: "error" });
      return;
    }
    const groupData = {
      name: groupForm.groupName.trim(),
      description: groupForm.description.trim(),
    };
    try {
      const { ok, data } = await apiAddGroup(groupData);
      if (ok) {
        addNotification({ message: "Group added successfully!", type: "success" });
        setGroupForm({ groupName: "", description: "", status: "Active" });
        fetchGroups();
        handleCloseModal();
      } else {
        // Show backend error if available, else generic message
        addNotification({ message: data.error || data.message || "Failed to add group. Please try again.", type: "error" });
      }
    } catch (error) {
      // Show error message from backend if available
      addNotification({ message: error?.message || "An error occurred while adding the group.", type: "error" });
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
                <Button variant="purple" onClick={() => handleShowModal("addGroup")}>Add new</Button>
                <Button variant="secondary" className="ms-2">Import groups</Button>
                <Button variant="secondary" className="ms-2">Export groups (Excel)</Button>
              </div>
              <div>
                <span>Total groups: {groups.length}</span>
                <span className="ms-3">Current used: {groups.filter(g => g.status === "Active").length}</span>
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
                    <th>Group Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Operation</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => (
                    <tr key={group.id}>
                      <td><img src={group.photo || defaultAvatar} alt="Group" style={{ width: "40px", height: "40px", borderRadius: "50%" }} /></td>
                      <td>{group.name}</td>
                      <td>{group.description || "N/A"}</td>
                      <td>
                        <span style={{ color: group.status === "Inactive" ? "red" : "green" }}>
                          {group.status}
                        </span>
                      </td>
                      <td>
                        <Button variant="link" className="p-0 me-2" onClick={() => handleShowModal("editGroup", null, group)}><i className="bi bi-pencil"></i></Button>
                        <Button variant="link" className="p-0 me-2" onClick={() => {/* Delete logic */}}><i className="bi bi-trash"></i></Button>
                        <Button variant="link" className="p-0" onClick={() => handleShowAssignModal(group)}>Assign Users</Button>
                      </td>
                      <td>
                        <Button variant="link" className="p-0">View</Button>
                      </td>
                    </tr>
                  ))}
      {/* Assign Users to Group Modal */}
      <Modal show={assignModal} onHide={handleCloseAssignModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Assign Users to Group: {assignGroup?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAssignUsers}>
            <Form.Group className="mb-3">
              <Form.Label>Select Users</Form.Label>
              <Form.Control as="select" multiple value={selectedUserIds} onChange={e => setSelectedUserIds(Array.from(e.target.selectedOptions, option => option.value))}>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Button variant="purple" type="submit">Assign</Button>
          </Form>
        </Modal.Body>
      </Modal>
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
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" name="username" value={form.username} onChange={handleFormChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control type="text" name="first_name" value={form.first_name} onChange={handleFormChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control type="text" name="last_name" value={form.last_name} onChange={handleFormChange} required />
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
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" name="password" value={form.password} onChange={handleFormChange} required minLength={6} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Control as="select" name="role" value={form.role} onChange={handleFormChange} required>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </Form.Control>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Control as="select" name="status" value={form.status} onChange={handleFormChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Control>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Group</Form.Label>
                <Form.Control as="select" name="groupId" value={form.groupId} onChange={handleFormChange} required>
                  <option value="">Select group</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
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
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" name="username" value={form.username} onChange={handleFormChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control type="text" name="first_name" value={form.first_name} onChange={handleFormChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control type="text" name="last_name" value={form.last_name} onChange={handleFormChange} required />
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
              <Form.Group className="mb-3">
                <Form.Label>Group</Form.Label>
                <Form.Control as="select" name="groupId" value={form.groupId} onChange={handleFormChange} required>
                  <option value="">Select group</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Button variant="info" type="submit" disabled={loading}>
                {loading ? <><Spinner animation="border" size="sm" /> Updating...</> : "Update User"}
              </Button>
            </Form>
          )}
          {modalType === "addGroup" && (
            <Form onSubmit={handleAddGroup}>
              <Form.Group className="mb-3">
                <Form.Label>Group Name</Form.Label>
                <Form.Control type="text" name="groupName" value={groupForm.groupName} onChange={handleGroupFormChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" name="description" value={groupForm.description} onChange={handleGroupFormChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Control as="select" name="status" value={groupForm.status} onChange={handleGroupFormChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Control>
              </Form.Group>
              <Button variant="purple" type="submit" disabled={loading}>
                {loading ? <><Spinner animation="border" size="sm" /> Adding...</> : "Add Group"}
              </Button>
            </Form>
          )}
          {modalType === "editGroup" && (
            <Form onSubmit={handleAddGroup}> {/* Reuse handleAddGroup for simplicity; adjust if needed */}
              <Form.Group className="mb-3">
                <Form.Label>Group Name</Form.Label>
                <Form.Control type="text" name="groupName" value={groupForm.groupName} onChange={handleGroupFormChange} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" name="description" value={groupForm.description} onChange={handleGroupFormChange} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Control as="select" name="status" value={groupForm.status} onChange={handleGroupFormChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Control>
              </Form.Group>
              <Button variant="info" type="submit" disabled={loading}>
                {loading ? <><Spinner animation="border" size="sm" /> Updating...</> : "Update Group"}
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
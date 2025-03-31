// src/components/Navbars/AdminNavbar.js
import React, { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, Dropdown } from "react-bootstrap";
import { UserContext } from "context/UserContext";
import routes from "routes.js";

function AdminNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, fetchUser } = useContext(UserContext);

  // Fetch user data on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token && !user) {
      fetchUser(token);
    }
  }, [user, fetchUser]);

  const getBrandText = () => {
    for (let i = 0; i < routes.length; i++) {
      if (location.pathname.indexOf(routes[i].layout + routes[i].path) !== -1) {
        return routes[i].name;
      }
    }
    return "Brand";
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  return (
    <Navbar
      bg="white"
      expand="lg"
      className="border-bottom shadow-sm"
      style={{ height: "60px" }}
    >
      <Container fluid>
        {/* Left side: Page title */}
        <Navbar.Brand
          href="#home"
          onClick={(e) => e.preventDefault()}
          className="font-weight-bold text-dark"
          style={{ fontSize: "24px" }}
        >
          {getBrandText()}
        </Navbar.Brand>

        {/* Right side: User dropdown */}
        <Nav className="ml-auto" navbar>
          <Dropdown as={Nav.Item}>
            <Dropdown.Toggle
              as={Nav.Link}
              id="navbarDropdownMenuLink"
              variant="default"
              className="m-0 text-dark"
              style={{ fontSize: "16px", fontWeight: "500" }}
            >
              {user ? user.username : "User"}
            </Dropdown.Toggle>
            <Dropdown.Menu align="end">
              <Dropdown.Item href="#pablo" onClick={(e) => e.preventDefault()}>
                Profile
              </Dropdown.Item>
              <Dropdown.Item href="#pablo" onClick={(e) => e.preventDefault()}>
                Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout}>
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default AdminNavbar;

import React, { useContext } from "react"; // Import useContext to access UserContext
import { useLocation, NavLink } from "react-router-dom";
import { Nav } from "react-bootstrap";
import { UserContext } from "../../context/UserContext"; // Import UserContext

import logo from "assets/img/reactlogo.png";

function Sidebar({ color, image, routes }) {
  const location = useLocation();
  const { user } = useContext(UserContext); // Access the user from UserContext

  const activeRoute = (routeName) => {
    return location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };

  // Ensure user.role exists; default to "user" if missing
  const userRole = user ? user.role || "user" : "user";
  console.log("Sidebar - User Role:", userRole);

  // Filter routes based on the user's role
  const filteredRoutes = routes.filter((prop) => {
    if (userRole === "admin") {
      // Admins can only see /admin routes
      return prop.layout === "/admin";
    } else {
      // Non-admins can only see /user routes
      return prop.layout === "/user";
    }
  });

  console.log("Sidebar - Filtered Routes:", filteredRoutes);

  return (
    <div className="sidebar" data-image={image} data-color={color}>
      <div
        className="sidebar-background"
        style={{
          backgroundImage: "url(" + image + ")"
        }}
      />
      <div className="sidebar-wrapper">
        <div className="logo d-flex align-items-center justify-content-start">
          <a href="" className="simple-text logo-mini mx-1">
            <div className="logo-img">
              <img src={require("assets/img/reactlogo.png")} alt="..." />
            </div>
          </a>
          <a className="simple-text" href="#">
            Regisam Technologies
          </a>
        </div>
        <Nav>
          {filteredRoutes.map((prop, key) => {
            if (!prop.redirect)
              return (
                <li
                  className={
                    prop.upgrade
                      ? "active active-pro"
                      : activeRoute(prop.layout + prop.path)
                  }
                  key={key}
                >
                  <NavLink
                    to={prop.layout + prop.path}
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  >
                    <i className={prop.icon} />
                    <p>{prop.name}</p>
                  </NavLink>
                </li>
              );
            return null;
          })}
        </Nav>
      </div>
    </div>
  );
}

export default Sidebar;
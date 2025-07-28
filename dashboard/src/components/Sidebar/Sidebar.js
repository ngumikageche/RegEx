import React, { useContext } from "react"; // Import useContext to access UserContext
import { useLocation, NavLink } from "react-router-dom";
import { Nav } from "react-bootstrap";
import { UserContext } from "../../context/UserContext"; // Import UserContext

import logo from "assets/img/reactlogo.png";
import defaultAvatar from "assets/img/default-avatar.png";

function Sidebar({ color, image, routes }) {
  const location = useLocation();
  const { user } = useContext(UserContext); // Access the user from UserContext

  const activeRoute = (routeName) => {
    return location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };

  // Ensure user.role exists; default to "user" if missing
  const userRole = user ? user.role || "user" : "user";
  console.log("Sidebar - User Role:", userRole);


  // Recursively filter routes for the current user role
  const filterRoutes = (routesArr) =>
    routesArr
      .map((route) => {
        if (route.collapse && Array.isArray(route.views)) {
          // Recursively filter subroutes
          const filteredViews = filterRoutes(route.views);
          return filteredViews.length > 0 ? { ...route, views: filteredViews } : null;
        }
        if (route.layout) {
          if (userRole === "admin" && route.layout === "/admin") return route;
          if (userRole !== "admin" && route.layout === "/user") return route;
          return null;
        }
        return null;
      })
      .filter(Boolean);

  const filteredRoutes = filterRoutes(routes);

  console.log("Sidebar - Filtered Routes:", filteredRoutes);

  return (
    <div className="sidebar shadow-lg" data-image={image} data-color={color} style={{ minHeight: "100vh", borderTopRightRadius: 24, borderBottomRightRadius: 24, overflow: "hidden" }}>
      <div
        className="sidebar-background"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.7)), url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.9,
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 0
        }}
      />
      <div className="sidebar-wrapper relative z-10 flex flex-col h-full justify-between">
        {/* Logo and Brand */}
        <div
          className="logo flex flex-col items-center py-6 border-b border-gray-200 mb-4 sticky top-0 z-30"
          style={{
            background: "rgba(23, 37, 84, 0.97)",
            boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            minHeight: 96,
            maxHeight: 120
          }}
        >
          <div className="logo-img mb-2">
            <img src={logo} alt="Logo" className="w-14 h-14 rounded-full shadow-md border-2 border-white bg-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-wide drop-shadow text-center truncate w-full px-2" style={{maxWidth: '100%'}}>Regisam Technologies</span>
        </div>

        {/* User Info */}
        <div className="flex flex-col items-center mb-6">
          <img src={user?.avatar || defaultAvatar} alt="User Avatar" className="w-2 h-2 rounded-full border-2 border-green-400 shadow" />
          <span className="mt-2 text-white font-semibold text-base drop-shadow">{user?.name || "User"}</span>
          <span className="text-xs text-green-200 bg-green-700 px-2 py-0.5 rounded mt-1 uppercase tracking-wider">{userRole}</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-1 px-2">
            <li className="text-xs text-gray-300 uppercase tracking-wider px-3 py-2">Menu</li>
            {filteredRoutes.map((prop, key) => {
              if (prop.collapse && Array.isArray(prop.views)) {
                // Collapsible group
                return (
                  <li key={key} className="sidebar-group">
                    <div className="flex items-center gap-2 px-4 py-2 text-gray-400 uppercase text-xs tracking-wider">
                      <i className={prop.icon + " text-base"} />
                      <span>{prop.name}</span>
                    </div>
                    <ul className="ml-4 border-l border-gray-700 pl-2">
                      {prop.views.map((sub, subKey) => (
                        !sub.redirect && (
                          <li
                            className={
                              (sub.upgrade
                                ? "active active-pro"
                                : activeRoute(sub.layout + sub.path)) +
                              " group"
                            }
                            key={subKey}
                          >
                            <NavLink
                              to={sub.layout + sub.path}
                              className={({ isActive }) =>
                                `nav-link flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
                                  isActive ? "bg-green-600 text-white shadow" : "text-gray-200 hover:bg-green-700 hover:text-white"
                                }`
                              }
                            >
                              <i className={sub.icon + " text-lg"} />
                              <span className="font-medium">{sub.name}</span>
                            </NavLink>
                          </li>
                        )
                      ))}
                    </ul>
                  </li>
                );
              } else if (!prop.redirect) {
                return (
                  <li
                    className={
                      (prop.upgrade
                        ? "active active-pro"
                        : activeRoute(prop.layout + prop.path)) +
                      " group"
                    }
                    key={key}
                  >
                    <NavLink
                      to={prop.layout + prop.path}
                      className={({ isActive }) =>
                        `nav-link flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 ${
                          isActive ? "bg-green-600 text-white shadow" : "text-gray-200 hover:bg-green-700 hover:text-white"
                        }`
                      }
                    >
                      <i className={prop.icon + " text-lg"} />
                      <span className="font-medium">{prop.name}</span>
                    </NavLink>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="text-center text-xs text-gray-300 py-4 border-t border-gray-700 bg-black bg-opacity-20">
          &copy; {new Date().getFullYear()} Regisam Technologies
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
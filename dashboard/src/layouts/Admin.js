import React from "react";
import { useLocation, Route, Routes } from "react-router-dom";
import AdminNavbar from "components/Navbars/AdminNavbar";
import Footer from "components/Footer/Footer";
import Sidebar from "components/Sidebar/Sidebar";
import FixedPlugin from "components/FixedPlugin/FixedPlugin.js";
import routes from "../routes.js";
import sidebarImage from "assets/img/sidebar-3.jpg";

function Admin() {
  const [image, setImage] = React.useState(sidebarImage);
  const [color, setColor] = React.useState("black");
  const [hasImage, setHasImage] = React.useState(true);
  const location = useLocation();
  const mainPanel = React.useRef(null);

  const getRoutes = (routes) => {
    return routes
      .flatMap((prop, key) => {
        // Handle top-level routes
        const topLevelRoute = prop.layout === "/admin" && prop.component
          ? [
              <Route
                path={prop.path}
                element={<prop.component />}
                key={`top-${key}`}
              />,
            ]
          : [];

        // Handle nested views
        const nestedRoutes =
          prop.collapse && prop.views
            ? prop.views
                .filter((sub) => sub.layout === "/admin" && sub.component)
                .map((sub, subKey) => (
                  <Route
                    path={`${sub.layout}${sub.path}`}
                    element={<sub.component />}
                    key={`sub-${key}-${subKey}`}
                  />
                ))
            : [];

        return [...topLevelRoute, ...nestedRoutes];
      })
      .filter(Boolean);
  };

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    if (mainPanel.current) mainPanel.current.scrollTop = 0;

    if (
      window.innerWidth < 993 &&
      document.documentElement.classList.contains("nav-open")
    ) {
      document.documentElement.classList.toggle("nav-open");
      const element = document.getElementById("bodyClick");
      if (element) element.parentNode.removeChild(element);
    }
  }, [location]);

  return (
    <>
      <div className="wrapper">
        <Sidebar color={color} image={hasImage ? image : ""} routes={routes} />
        <div className="main-panel" ref={mainPanel}>
          <AdminNavbar />
          <div className="content">
            <Routes>{getRoutes(routes)}</Routes>
          </div>
          <Footer />
        </div>
      </div>
      <FixedPlugin
        hasImage={hasImage}
        setHasImage={() => setHasImage(!hasImage)}
        color={color}
        setColor={setColor}
        image={image}
        setImage={setImage}
      />
    </>
  );
}

export default Admin;
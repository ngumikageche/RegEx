import React from "react";
import { useLocation, Route, Routes } from "react-router-dom";

import AdminNavbar from "components/Navbars/AdminNavbar";
import Footer from "components/Footer/Footer";
import Sidebar from "components/Sidebar/Sidebar";
import FixedPlugin from "components/FixedPlugin/FixedPlugin.js";

import routes from "../routes.js";

function User() {
  const [image, setImage] = React.useState("");
  const [color, setColor] = React.useState("blue");
  const [hasImage, setHasImage] = React.useState(false);
  const location = useLocation();
  const mainPanel = React.useRef(null);

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/user") {
        const Component = prop.component;
        return <Route path={prop.path} element={<Component />} key={key} />;
      }
      return null;
    });
  };

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    if (mainPanel.current) mainPanel.current.scrollTop = 0;

    if (window.innerWidth < 993 && document.documentElement.classList.contains("nav-open")) {
      document.documentElement.classList.toggle("nav-open");
      const element = document.getElementById("bodyClick");
      if (element) element.parentNode.removeChild(element);
    }
  }, [location]);

  return (
    <>
      <div className="wrapper">
        <Sidebar
          color={color}
          image={hasImage ? image : ""}
          routes={routes}
          layout="user"
        />
        <div className="main-panel" ref={mainPanel}>
          <AdminNavbar layout="user" />
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

export default User;
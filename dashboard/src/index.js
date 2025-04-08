// src/index.js
import React, { useContext } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import styles
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/animate.min.css";
import "./assets/scss/light-bootstrap-dashboard-react.scss?v=2.0.0";
import "./assets/css/demo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "react-datetime/css/react-datetime.css";

// Import layouts
import AdminLayout from "layouts/Admin.js";
import MarketerLayout from "layouts/Marketer.js"; // Add this import
import AuthLayout from "layouts/Auth.js";

// Import UserProvider, NotificationProvider, and ProtectedRoute
import { UserProvider, UserContext } from "./context/UserContext";
import { NotificationProvider } from "./context/NotificationContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Spinner } from "react-bootstrap";

const App = () => {
  const { loading } = useContext(UserContext);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Routes>
      {/* Admin Routes (Protected) */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      />

      {/* Marketer Routes (Protected) */}
      <Route
        path="/marketer/*"
        element={
          <ProtectedRoute>
            <MarketerLayout />
          </ProtectedRoute>
        }
      />

      {/* Auth Routes (Login/Register) */}
      <Route path="/auth/*" element={<AuthLayout />} />

      {/* Default Redirect */}
      <Route path="*" element={<Navigate to="/auth/login" />} />
    </Routes>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <UserProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </UserProvider>
  </BrowserRouter>
);
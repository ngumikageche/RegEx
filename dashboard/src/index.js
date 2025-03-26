import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import styles
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/animate.min.css";
import "./assets/scss/light-bootstrap-dashboard-react.scss?v=2.0.0";
import "./assets/css/demo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Import layouts
import AdminLayout from "layouts/Admin.js";
import AuthLayout from "layouts/Auth.js"; // New layout for login/register

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin/*" element={<AdminLayout />} />

      {/* Auth Routes (Login/Register) */}
      <Route path="/auth/*" element={<AuthLayout />} />

      {/* Default Redirect */}
      <Route path="*" element={<Navigate to="/auth/login" />} />
    </Routes>
  </BrowserRouter>
);

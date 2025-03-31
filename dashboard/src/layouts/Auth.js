import React from "react";
import { Route, Routes } from "react-router-dom"; // ✅ Use Routes instead of Switch
import Login from "../views/Login";
import Register from "../views/Register";


const AuthLayout = () => {
  return (
    <div className="auth-container">
      <Routes> {/* ✅ Ensure this is using Routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Routes>
    </div>
  );
};

export default AuthLayout;

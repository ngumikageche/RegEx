// src/components/ProtectedRoute.js
import React, { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "context/UserContext";

function ProtectedRoute({ children }) {
  const { user, fetchUser } = useContext(UserContext);
  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    if (token && !user) {
      console.log("ProtectedRoute - Fetching user data on mount");
      fetchUser(token);
    }
  }, [token, user, fetchUser]);

  console.log("ProtectedRoute - Token:", token);
  console.log("ProtectedRoute - User:", user);

  if (!token) {
    console.log("Redirecting to /auth/login due to missing token");
    return <Navigate to="/auth/login" replace />;
  }

  console.log("Rendering protected route");
  return children;
}

export default ProtectedRoute;
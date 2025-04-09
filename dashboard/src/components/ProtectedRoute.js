import React, { useContext, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

function ProtectedRoute({ children, role }) {
  const { user, fetchUser } = useContext(UserContext);
  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    if (token && !user) {
      console.log("ProtectedRoute - Fetching user data on mount");
      fetchUser(token).catch((err) => {
        console.error("ProtectedRoute - Error fetching user:", err);
        localStorage.removeItem("auth_token");
      });
    }
  }, [token, user, fetchUser]);

  console.log("ProtectedRoute - Token:", token);
  console.log("ProtectedRoute - User:", user);
  console.log("ProtectedRoute - Required Role:", role);

  if (!token) {
    console.log("Redirecting to /auth/login due to missing token");
    return <Navigate to="/auth/login" replace />;
  }

  if (!user) {
    console.log("Waiting for user data to load...");
    return null;
  }

  // Ensure user.role exists; default to "user" if missing
  const userRole = user.role || "user";
  console.log("ProtectedRoute - User Role (after default):", userRole);

  if (role === "admin") {
    // Only allow users with role="admin" to access admin routes
    if (userRole !== "admin") {
      console.log("Redirecting to /user/dashboard because user is not an admin");
      return <Navigate to="/user/dashboard" replace />;
    }
  } else if (role === "user") {
    // Redirect users with role="admin" to admin dashboard
    if (userRole === "admin") {
      console.log("Redirecting to /admin/dashboard because user is an admin");
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Allow all other roles (e.g., "user", "doctor") to access user routes
    console.log("Allowing access to user route for role:", userRole);
  }

  console.log("Rendering protected route for role:", role);
  return children;
}

export default ProtectedRoute;
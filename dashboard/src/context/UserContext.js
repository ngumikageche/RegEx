// src/context/UserContext.js
import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  const fetchUser = async (token) => {
    try {
      console.log("Fetching user with token:", token);
      const response = await fetch("http://127.0.0.1:5000/user/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Fetch user response status:", response.status);
      const userData = await response.json();
      console.log("Fetch user response data:", userData);

      if (response.ok) {
        setUser(userData);
        console.log("User data set:", userData);
        localStorage.setItem("user_role", userData.role);
      } else {
        console.error("Failed to fetch user data:", userData.error || userData.msg);
        if (response.status === 401 || response.status === 422) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_role");
          setUser(null);
          navigate("/auth/login", { replace: true });
        } else {
          setUser({
            id: null,
            username: "Guest",
            email: "",
            role: localStorage.getItem("user_role") || "user",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_role");
      setUser(null);
      navigate("/auth/login", { replace: true });
    } finally {
      setLoading(false); // Set loading to false after fetch
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, fetchUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
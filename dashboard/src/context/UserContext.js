import React, { createContext, useState, useEffect, useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";

export const UserContext = createContext();

// Use environment variable for API base URL
const API_BASE = process.env.REACT_APP_API_URL || process.env.VITE_API_URL;

export const UserProvider = ({ children }) => {
  const { addNotification, unreadCount, fetchUnreadNotifications } = useContext(NotificationContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (token) => {
    try {
      console.log("Fetching user with token:", token);
      const response = await fetch(`${API_BASE}/user/me`, {
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
        const userWithRole = {
          ...userData,
          role: userData.role || "user",
        };
        setUser(userWithRole);
        // Optionally refresh unread notifications after user loads
        if (typeof fetchUnreadNotifications === "function") {
          fetchUnreadNotifications();
        }
        console.log("User data set:", userWithRole);
      } else {
        console.error("Failed to fetch user data:", userData.error || userData.msg);
        if (typeof addNotification === "function") {
          addNotification({ message: userData.error || "Failed to fetch user data.", type: "error" });
        }
        if (response.status === 401 || response.status === 422) {
          localStorage.removeItem("auth_token");
          setUser(null);
          throw new Error("Token expired or invalid");
        } else {
          setUser({
            id: null,
            username: "Guest",
            email: "",
            role: "user",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      if (typeof addNotification === "function") {
        addNotification({ message: "An error occurred while fetching user data.", type: "error" });
      }
      localStorage.removeItem("auth_token");
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      fetchUser(token).catch((err) => {
        console.error("Initial fetchUser failed:", err);
      });
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, fetchUser, loading, unreadCount, fetchUnreadNotifications }}>
      {children}
    </UserContext.Provider>
  );
};
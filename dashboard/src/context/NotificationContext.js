import React, { createContext, useState, useEffect, useContext } from "react";
import { Toaster, toast } from "react-hot-toast";

export const NotificationContext = createContext();

// Use environment variable for API base URL
const API_BASE = process.env.REACT_APP_API_URL || process.env.VITE_API_URL;

export const NotificationProvider = ({ children }) => {
  const token = localStorage.getItem("auth_token");
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadNotifications = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/notification/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();
      const list = Array.isArray(data.notifications) ? data.notifications : [];
      const unread = list.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      toast.error("Failed to fetch notifications");
    }
  };

  const addNotification = ({ message, type }) => {
    if (type === "success") {
      toast.success(message, { duration: 3000, position: "top-right" });
    } else if (type === "error") {
      toast.error(message, { duration: 3000, position: "top-right" });
    } else {
      toast(message, { duration: 3000, position: "top-right" });
    }
  };

  useEffect(() => {
    if (token) {
      fetchUnreadNotifications();
      const interval = setInterval(fetchUnreadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  return (
    <NotificationContext.Provider value={{ unreadCount, fetchUnreadNotifications, addNotification }}>
      {children}
      <Toaster />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
// src/context/NotificationContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { Toaster, toast } from "react-hot-toast";
import { UserContext } from "./UserContext";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const token = localStorage.getItem("auth_token");
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications from the backend
  const fetchUnreadNotifications = async () => {
    if (!token || !user) return;

    try {
      const response = await fetch("http://127.0.0.1:5000/notification/", {
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
      const unread = data.notifications.filter((notification) => !notification.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      toast.error("Failed to fetch notifications");
    }
  };

  // Add a notification (for Catalogue component)
  const addNotification = ({ message, type }) => {
    if (type === "success") {
      toast.success(message, {
        duration: 3000,
        position: "top-right",
      });
    } else if (type === "error") {
      toast.error(message, {
        duration: 3000,
        position: "top-right",
      });
    } else {
      toast(message, {
        duration: 3000,
        position: "top-right",
      });
    }
  };

  // Fetch notifications on mount and every 30 seconds
  useEffect(() => {
    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, [token, user]);

  return (
    <NotificationContext.Provider value={{ unreadCount, fetchUnreadNotifications, addNotification }}>
      {children}
      <Toaster />
    </NotificationContext.Provider>
  );
};
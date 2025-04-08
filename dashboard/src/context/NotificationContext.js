// src/context/NotificationContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { UserContext } from "./UserContext";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const token = localStorage.getItem("auth_token");
  const [unreadCount, setUnreadCount] = useState(0);

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

      const data = await response.json();
      if (response.ok) {
        const unread = data.notifications.filter((notification) => !notification.is_read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, [token, user]);

  return (
    <NotificationContext.Provider value={{ unreadCount, fetchUnreadNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
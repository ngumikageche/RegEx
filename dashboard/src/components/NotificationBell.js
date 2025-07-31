// src/components/NotificationBell.js
import React, { useState, useEffect, useContext } from "react";
import { NavLink } from "react-router-dom";
import { Badge } from "react-bootstrap";
import { UserContext } from "../context/UserContext";

function NotificationBell({ layout }) {
  const { user, fetchUser } = useContext(UserContext);
  const token = localStorage.getItem("auth_token");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token || !user) return;

    const fetchUnreadNotifications = async () => {
      try {
        const response = await fetch("https://api.regisamtech.co.ke/notifications/", {
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

    fetchUnreadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, [token, user]);

  return (
    <li>
      <NavLink to={`${layout}/notifications`} activeClassName="active">
        <i className="nc-icon nc-bell-55"></i>
        <p>
          Notifications{" "}
          {unreadCount > 0 && (
            <Badge bg="danger" className="ms-1">
              {unreadCount}
            </Badge>
          )}
        </p>
      </NavLink>
    </li>
  );
}

export default NotificationBell;
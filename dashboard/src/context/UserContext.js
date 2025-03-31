// src/context/UserContext.js
import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const fetchUser = async (token) => {
    try {
      console.log("Fetching user with token:", token);
      const response = await fetch("http://127.0.0.1:5000/auth/protected", {
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
      } else {
        console.error("Failed to fetch user data:", userData.error);
        // Fallback user data
        setUser({
          id: null,
          username: "Guest",
          email: "",
          role: localStorage.getItem("user_role") || "user",
        });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser({
        id: null,
        username: "Guest",
        email: "",
        role: localStorage.getItem("user_role") || "user",
      });
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};
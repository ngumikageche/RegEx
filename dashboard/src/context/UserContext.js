import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
        // Ensure the user object has a role; default to "user" if missing
        const userWithRole = {
          ...userData,
          role: userData.role || "user", // Default to "user" if role is missing
        };
        setUser(userWithRole);
        console.log("User data set:", userWithRole);
        localStorage.setItem("user_role", userWithRole.role);
      } else {
        console.error("Failed to fetch user data:", userData.error || userData.msg);
        // Handle 401 (Unauthorized) or 422 (Invalid Token) explicitly
        if (response.status === 401 || response.status === 422) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_role");
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
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_role");
      setUser(null);
      throw error; // Re-throw the error for components to handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      fetchUser(token).catch((err) => {
        console.error("Initial fetchUser failed:", err);
        // No redirect here; let components handle it
      });
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, fetchUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
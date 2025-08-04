// User API utility functions

const API_URL = process.env.REACT_APP_API_URL || "https://api.regisamtech.co.ke";
const getToken = () => localStorage.getItem("auth_token");

export async function fetchUsers() {
    const response = await fetch(`${API_URL}/user/users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await response.json();
    if (Array.isArray(data.users)) return data.users;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data)) return data;
    return [];
}

export async function fetchRoles() {
    const response = await fetch(`${API_URL}/user/roles`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await response.json();
    if (Array.isArray(data.roles)) return data.roles;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data)) return data;
    return [];
}

export async function addUser(userData) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(userData),
    });
    const data = await response.json();
    return { ok: response.ok, data };
}

export async function updateUser(id, updatedData) {
    const response = await fetch(`${API_URL}/user/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(updatedData),
    });
    const data = await response.json();
    return { ok: response.ok, data };
}

export async function addRole(roleData) {
    const response = await fetch(`${API_URL}/user/roles`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(roleData),
    });
    const data = await response.json();
    return { ok: response.ok, data };
}

export async function changePassword(userId, passwordData) {
    const response = await fetch(`${API_URL}/users/${userId}/change-password`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(passwordData),
    });
    const data = await response.json();
    return { ok: response.ok, data };
}
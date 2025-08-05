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


// GROUPS API
export async function fetchGroups() {
    const response = await fetch(`${API_URL}/usergroups/`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await response.json();
    if (Array.isArray(data.groups)) return data.groups;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data)) return data;
    return [];
}

export async function addGroup(groupData) {
    const response = await fetch(`${API_URL}/usergroups/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(groupData),
    });
    const data = await response.json();
    return { ok: response.ok, data };
}

export async function assignUsersToGroup(groupId, userIds) {
    const response = await fetch(`${API_URL}/usergroups/${groupId}/assign`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ user_ids: userIds }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
}

export async function removeUsersFromGroup(groupId, userIds) {
    const response = await fetch(`${API_URL}/usergroups/${groupId}/remove`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ user_ids: userIds }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
}

export async function deleteGroup(groupId) {
    const response = await fetch(`${API_URL}/usergroups/${groupId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });
    const data = await response.json();
    return { ok: response.ok, data };
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

// ...existing code...

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
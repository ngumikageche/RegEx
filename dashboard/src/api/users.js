const API_URL = process.env.REACT_APP_API_URL || process.env.VITE_API_URL;
const getToken = () => localStorage.getItem("auth_token");

// Login API utility

export async function loginUser(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    return { ok: response.ok, data };
}
// Get a single group by ID
export async function fetchGroup(groupId) {
    const response = await fetch(`${API_URL}/usergroups/${groupId}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await response.json();
    return { ok: response.ok, data };
}

// Update a group
export async function updateGroup(groupId, groupData) {
    const response = await fetch(`${API_URL}/usergroups/${groupId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(groupData),
    });
    const data = await response.json();
    return { ok: response.ok, data };
}

// Get users in a group
export async function fetchGroupUsers(groupId) {
    const response = await fetch(`${API_URL}/usergroups/${groupId}/users`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await response.json();
    return { ok: response.ok, data };
}
// User API utility functions



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
    const response = await fetch(`${API_URL}/usergroups/all`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await response.json();
    if (Array.isArray(data.groups)) return data.groups;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data)) return data;
    return [];
}

export async function addGroup(groupData) {
    const response = await fetch(`${API_URL}/usergroups/create`, {
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
    const response = await fetch(`${API_URL}/user/users/${id}`, {
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

export async function changePassword(userId, passwordData) {
    const response = await fetch(`${API_URL}/user/users/${userId}/change-password`, {
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
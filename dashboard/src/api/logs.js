    // Visit API utility functions
// Uses: fetchVisits, createVisit, updateVisit, deleteVisit
// API URL can be replaced with environment variable if needed

const API_URL = process.env.REACT_APP_API_URL || process.env.VITE_API_URL;

export async function fetchVisits(token, { user, startDate, endDate, userIdFilter, doctorName } = {}) {
    let url = API_URL;
    if (user ?.role === "admin") {
        const params = new URLSearchParams();
        if (startDate) params.append("start_date", startDate);
        if (endDate) params.append("end_date", endDate);
        if (userIdFilter) params.append("user_id", userIdFilter);
        if (doctorName) params.append("doctor_name", doctorName);
        if (params.toString()) url += `?${params.toString()}`;
    }
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch visits.");
    return data.visits;
}

export async function createVisit(token, visitData) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(visitData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to log visit.");
    return data;
}

export async function updateVisit(token, visitId, updatedVisit) {
    const response = await fetch(`${API_URL}${visitId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedVisit),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to update visit.");
    return data;
}

export async function deleteVisit(token, visitId) {
    const response = await fetch(`${API_URL}${visitId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to delete visit.");
    return data;
}
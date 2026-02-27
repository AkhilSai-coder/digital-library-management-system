const API_BASE = "http://localhost:8080";

function getToken() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Login required");
        window.location.href = "login.html";
        return null;
    }
    return token;
}

async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    if (!token) return;

    const response = await fetch(API_BASE + endpoint, {
        ...options,
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        throw new Error("Request failed");
    }

    return response.json().catch(() => null);
}
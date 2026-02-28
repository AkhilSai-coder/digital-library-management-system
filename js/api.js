const API_BASE = "https://library-backend-production-a8a4.up.railway.app";

function getToken() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Login required");
        window.location.href = "login.html";
        return null;
    }
    return token;
}

async function apiFetch(url, options = {}) {

    const token = localStorage.getItem("token");

    return fetch("https://library-backend-production-a8a4.up.railway.app" + url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
            ...(options.headers || {})
        }
    }).then(res => res.json());
}
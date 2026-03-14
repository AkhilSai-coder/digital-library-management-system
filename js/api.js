const API_BASE = "https://library-backend-1-e3r2.onrender.com";

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

    return fetch("https://library-backend-1-e3r2.onrender.com" + url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
            ...(options.headers || {})
        }
    }).then(res => res.json());
}
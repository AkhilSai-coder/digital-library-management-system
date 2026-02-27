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

async function apiFetch(url, options = {}) {

    const token = localStorage.getItem("token");

    return fetch("http://localhost:8080" + url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
            ...(options.headers || {})
        }
    }).then(res => res.json());
}
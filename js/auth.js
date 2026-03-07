/* =========================
   AUTH HELPERS
   ========================= */

function getToken() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Login required");
        window.location.href = "login.html";
        return null;
    }
    return token;
}

function getRoleFromToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role; // e.g. "ROLE_STUDENT"
    } catch(e) {
        return null;
    }
}

/* =========================
   DASHBOARD PROTECTION
   ========================= */
function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login first");
        window.location.href = "login.html";
    }
}

// Legacy alias used in some pages
function protectDashboard(expectedRole) {
    checkAuth();
}

/* =========================
   LOGOUT
   ========================= */
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "login.html";
}

/* =========================
   API FETCH HELPER
   ========================= */
async function apiFetch(url, options = {}) {
    const token = localStorage.getItem("token");
    return fetch("https://library-backend-1-e3r2.onrender.com" + url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token,
            ...(options.headers || {})
        }
    });
}

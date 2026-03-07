/* ============================================
   GRIET LIBRARY — AUTH HELPERS
============================================ */

function getToken(){
  return localStorage.getItem("token");
}

function getRoleFromToken(){
  const token = getToken();
  if(!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch(e){ return null; }
}

function checkAuth(){
  const token = getToken();
  if(!token){ window.location.href = "login.html"; }
}

function protectDashboard(expectedRole){ checkAuth(); }

function logout(){
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}

async function apiFetch(url, options={}){
  const token = getToken();
  const res = await fetch("https://library-backend-1-e3r2.onrender.com" + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
      ...(options.headers || {})
    }
  });
  return res;
}

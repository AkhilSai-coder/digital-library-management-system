/* GRIET Library — Auth & Mobile Sidebar v2.0 */

function getToken(){ return localStorage.getItem('token'); }

function getRoleFromToken(){
  const token = getToken();
  if(!token) return null;
  try{ return JSON.parse(atob(token.split('.')[1])).role; }
  catch(e){ return null; }
}

function checkAuth(){
  if(!getToken()) window.location.href='login.html';
}

function protectDashboard(expectedRole){ checkAuth(); }

function logout(){
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  window.location.href='login.html';
}

async function apiFetch(url, options={}){
  const token = getToken();
  return fetch('https://library-backend-1-e3r2.onrender.com'+url,{
    ...options,
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+token,...(options.headers||{})}
  });
}

/* ── Inject mobile top-bar into every dashboard page ── */
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('.sidebar');
  if(!sidebar) return;

  /* 1. Build mob-topbar */
  const topbar = document.createElement('div');
  topbar.className = 'mob-topbar';
  topbar.innerHTML = `
    <div class="mob-logo">
      <img src="GRIET_Logo.png" alt="GRIET">
      <div>
        <div class="mob-title">Central Library</div>
        <div class="mob-sub">GRIET · Hyderabad</div>
      </div>
    </div>
    <button class="ham-btn" id="hamBtn" aria-label="Toggle menu">
      <span></span><span></span><span></span>
    </button>`;
  document.body.prepend(topbar);

  /* 2. Build overlay */
  const overlay = document.createElement('div');
  overlay.className = 'sb-overlay';
  document.body.appendChild(overlay);

  /* 3. Wire up toggle */
  const hamBtn = document.getElementById('hamBtn');

  function openSidebar(){
    sidebar.classList.add('open');
    overlay.classList.add('show');
    hamBtn.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar(){
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    hamBtn.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamBtn.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });

  overlay.addEventListener('click', closeSidebar);

  /* 4. Close sidebar when any nav link is tapped on mobile */
  sidebar.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      if(window.innerWidth <= 768) closeSidebar();
    });
  });

  /* 5. Close on resize back to desktop */
  window.addEventListener('resize', () => {
    if(window.innerWidth > 768) closeSidebar();
  });
});
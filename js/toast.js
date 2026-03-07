/* ============================================
   GRIET LIBRARY — GLOBAL TOAST + UI HELPERS
   No popups. No reloads. Premium feel.
============================================ */

// ─── TOAST SYSTEM ───────────────────────────
(function(){
  const style = document.createElement("style");
  style.textContent = `
    #toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 500;
      color: #fff;
      min-width: 280px;
      max-width: 380px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.18);
      pointer-events: all;
      animation: toastIn 0.35s cubic-bezier(0.175,0.885,0.32,1.275) forwards;
      backdrop-filter: blur(12px);
    }
    .toast.hide {
      animation: toastOut 0.3s ease forwards;
    }
    .toast-success { background: linear-gradient(135deg,#059669,#047857); }
    .toast-error   { background: linear-gradient(135deg,#dc2626,#b91c1c); }
    .toast-info    { background: linear-gradient(135deg,#1d4ed8,#1e3a8a); }
    .toast-warning { background: linear-gradient(135deg,#d97706,#b45309); }
    .toast-icon    { font-size: 18px; flex-shrink: 0; }
    .toast-msg     { flex: 1; line-height: 1.4; }
    @keyframes toastIn  { from{opacity:0;transform:translateX(60px)} to{opacity:1;transform:translateX(0)} }
    @keyframes toastOut { from{opacity:1;transform:translateX(0)}    to{opacity:0;transform:translateX(60px)} }
  `;
  document.head.appendChild(style);

  let container;
  function getContainer(){
    if(!container){
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }
    return container;
  }

  const icons = { success:"✅", error:"❌", info:"ℹ️", warning:"⚠️" };

  window.toast = function(message, type="success", duration=3500){
    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span class="toast-icon">${icons[type]||"💬"}</span><span class="toast-msg">${message}</span>`;
    getContainer().appendChild(el);
    setTimeout(()=>{
      el.classList.add("hide");
      setTimeout(()=>el.remove(), 350);
    }, duration);
  };
})();

// ─── LOADING BUTTON HELPERS ──────────────────
window.btnLoad = function(btn, text="Processing..."){
  btn.disabled = true;
  btn._orig = btn.innerHTML;
  btn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:8px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spin 0.8s linear infinite"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>${text}</span>`;
  if(!document.getElementById("spin-style")){
    const s=document.createElement("style");
    s.id="spin-style";
    s.textContent="@keyframes spin{to{transform:rotate(360deg)}}";
    document.head.appendChild(s);
  }
};

window.btnReset = function(btn){
  btn.disabled = false;
  if(btn._orig) btn.innerHTML = btn._orig;
};

// ─── SKELETON LOADER ─────────────────────────
window.skeleton = function(count=3, cols=4){
  return Array(count).fill(0).map(()=>`
    <tr>${Array(cols).fill(0).map(()=>`
      <td><div style="height:14px;background:linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%);background-size:200% 100%;border-radius:6px;animation:shimmer 1.2s infinite"></div></td>
    `).join("")}</tr>
  `).join("") + `<style>@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}</style>`;
};

// ─── EMPTY STATE ─────────────────────────────
window.emptyState = function(msg, icon="📭"){
  return `<div style="padding:50px 20px;text-align:center;color:#94a3b8">
    <div style="font-size:48px;margin-bottom:12px">${icon}</div>
    <div style="font-size:15px;font-weight:500">${msg}</div>
  </div>`;
};

/* ============================================================
   GRIET LIBRARY — GLOBAL THEME + PERFORMANCE ENGINE
   Handles: Dark/Light toggle, page transitions, lazy loading,
            scroll reveal, back-to-top, tab refresh
============================================================ */

(function(){
  'use strict';

  // ── 1. THEME: apply before paint to avoid flash ──
  const THEME_KEY = 'griet_theme';
  const saved = localStorage.getItem(THEME_KEY) || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', saved);

  // ── 2. INJECT TOGGLE BUTTON into header after DOM loads ──
  function injectThemeToggle(){
    const nav = document.querySelector('.site-nav') || document.querySelector('.top-bar');
    if(!nav || document.getElementById('themeToggle')) return;
    const btn = document.createElement('button');
    btn.id = 'themeToggle';
    btn.title = 'Toggle dark/light mode';
    btn.setAttribute('aria-label','Toggle theme');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.innerHTML = isDark ? '☀️' : '🌙';
    btn.style.cssText = `
      width:38px;height:38px;border-radius:10px;border:1.5px solid var(--border);
      background:var(--surface);color:var(--text);font-size:16px;cursor:pointer;
      transition:all 0.2s;display:flex;align-items:center;justify-content:center;
      margin-left:8px;flex-shrink:0;
    `;
    btn.addEventListener('click', toggleTheme);
    nav.appendChild(btn);
  }

  function toggleTheme(){
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    const btn = document.getElementById('themeToggle');
    if(btn) btn.innerHTML = next === 'dark' ? '☀️' : '🌙';
    // Smooth transition flash
    document.body.style.transition = 'background 0.3s, color 0.3s';
    setTimeout(() => document.body.style.transition = '', 400);
  }

  // ── 3. PAGE TRANSITIONS (instant feel) ──
  function initPageTransitions(){
    // Fade in on load
    document.body.style.opacity = '0';
    document.body.style.transform = 'translateY(8px)';
    document.body.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
      document.body.style.transform = 'translateY(0)';
    });

    // Fade out on internal link click
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if(!link) return;
      const href = link.getAttribute('href');
      if(!href || href.startsWith('#') || href.startsWith('http') || 
         href.startsWith('mailto') || link.target === '_blank') return;
      e.preventDefault();
      document.body.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      document.body.style.opacity = '0';
      document.body.style.transform = 'translateY(-6px)';
      setTimeout(() => { window.location.href = href; }, 200);
    });
  }

  // ── 4. SCROLL REVEAL (IntersectionObserver — no layout thrash) ──
  function initReveal(){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if(en.isIntersecting){
          en.target.classList.add('show');
          io.unobserve(en.target); // stop watching after shown
        }
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal,.reveal-left,.reveal-right').forEach(el => io.observe(el));
  }

  // ── 5. LAZY LOAD IMAGES ──
  function initLazyImages(){
    if('loading' in HTMLImageElement.prototype){
      document.querySelectorAll('img:not([loading])').forEach(img => {
        img.loading = 'lazy';
      });
    } else {
      const imgIo = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if(en.isIntersecting){
            const img = en.target;
            if(img.dataset.src) img.src = img.dataset.src;
            imgIo.unobserve(img);
          }
        });
      });
      document.querySelectorAll('img[data-src]').forEach(img => imgIo.observe(img));
    }
  }

  // ── 6. BACK TO TOP BUTTON ──
  function initBackToTop(){
    if(document.getElementById('topBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'topBtn';
    btn.innerHTML = '↑';
    btn.title = 'Back to top';
    btn.style.cssText = `
      position:fixed;bottom:32px;right:32px;
      width:44px;height:44px;border-radius:12px;
      border:1.5px solid var(--border);background:var(--surface);
      color:var(--text);font-size:17px;cursor:pointer;
      box-shadow:0 4px 18px var(--shadow);z-index:997;
      display:none;transition:all 0.2s;font-weight:700;
    `;
    btn.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'var(--navy, #081c3a)';
      btn.style.color = '#fff';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'var(--surface)';
      btn.style.color = 'var(--text)';
    });
    document.body.appendChild(btn);

    let ticking = false;
    window.addEventListener('scroll', () => {
      if(!ticking){
        requestAnimationFrame(() => {
          btn.style.display = window.scrollY > 500 ? 'flex' : 'none';
          btn.style.alignItems = 'center';
          btn.style.justifyContent = 'center';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ── 7. PROGRESS BAR ──
  function initProgressBar(){
    if(document.getElementById('grietProgress')) return;
    const bar = document.createElement('div');
    bar.id = 'grietProgress';
    bar.style.cssText = `
      position:fixed;top:0;left:0;height:2.5px;width:0%;
      background:linear-gradient(90deg,var(--navy,#081c3a),var(--crimson,#b30000),var(--gold,#c9a84c));
      z-index:9999;transition:width 0.1s;border-radius:0 2px 2px 0;
    `;
    document.body.appendChild(bar);
    let ticking = false;
    window.addEventListener('scroll', () => {
      if(!ticking){
        requestAnimationFrame(() => {
          const el = document.documentElement;
          const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
          bar.style.width = pct + '%';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ── 8. COUNTER ANIMATION (number counting up) ──
  function initCounters(){
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if(en.isIntersecting){
          const el = en.target;
          const target = +(el.dataset.target || el.dataset.t || 0);
          let cur = 0; const inc = target / 70;
          const t = setInterval(() => {
            cur = Math.min(cur + inc, target);
            el.textContent = Math.floor(cur).toLocaleString();
            if(cur >= target) clearInterval(t);
          }, 18);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.counter,.dc,.tc').forEach(el => io.observe(el));
  }

  // ── 9. PRELOAD NEXT PAGES on hover (instant navigation feel) ──
  function initPrefetch(){
    const prefetched = new Set();
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if(!href || href.startsWith('#') || href.startsWith('http') || prefetched.has(href)) return;
      link.addEventListener('mouseenter', () => {
        if(prefetched.has(href)) return;
        const l = document.createElement('link');
        l.rel = 'prefetch'; l.href = href;
        document.head.appendChild(l);
        prefetched.add(href);
      }, { once: true });
    });
  }

  // ── 10. INIT ALL ──
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', () => {
      injectThemeToggle();
      initPageTransitions();
      initReveal();
      initLazyImages();
      initBackToTop();
      initProgressBar();
      initCounters();
      setTimeout(initPrefetch, 1000); // defer prefetch
    });
  } else {
    injectThemeToggle();
    initPageTransitions();
    initReveal();
    initLazyImages();
    initBackToTop();
    initProgressBar();
    initCounters();
    setTimeout(initPrefetch, 1000);
  }

})();

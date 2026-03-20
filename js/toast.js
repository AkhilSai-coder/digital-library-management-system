/* GRIET Library — Toast System */
(function(){
  let container = document.querySelector('.toast-container');
  if(!container){
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  window.toast = function(msg, type='info'){
    const el = document.createElement('div');
    el.className = 'toast' + (type==='error'?' error':type==='success'?' success':'');
    const icon = type==='error'?'⚠':'✓';
    el.innerHTML = `<span style="font-size:15px;flex-shrink:0;">${icon}</span><span>${msg}</span>`;
    container.appendChild(el);
    setTimeout(()=>{
      el.style.animation='toastOut .25s ease forwards';
      setTimeout(()=>el.remove(),260);
    },3000);
  };
})();
(function(){
  var KEY='nodo_cookies',V=1;
  function get(){try{var d=JSON.parse(localStorage.getItem(KEY));return d&&d.v===V?d:null}catch(e){return null}}
  function save(an){
    var d={v:V,necesarias:true,analiticas:!!an,fecha:new Date().toISOString()};
    try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}
    window.nodoCookies=d;
    document.dispatchEvent(new CustomEvent('nodo:cookies',{detail:d}));
  }
  window.nodoCookies=get()||{necesarias:true,analiticas:false};
  window.abrirCookies=function(){build(true)};

  var css='#ck{position:fixed;left:12px;bottom:12px;z-index:100;width:min(440px,calc(100vw - 24px));background:#fff;color:#1B2420;border:1px solid #E3EAE5;border-radius:14px;box-shadow:0 8px 28px rgba(31,59,44,.18);padding:12px 14px;font:13px/1.45 Figtree,"Segoe UI",sans-serif;animation:ckIn .35s cubic-bezier(.2,.7,.2,1) both}'
  +'@keyframes ckIn{from{opacity:0;transform:translateY(10px)}}'
  +'#ck p{margin:0 0 10px;color:#55625B}#ck p b{color:#1F3B2C}#ck a{color:#407558;font-weight:600}'
  +'#ck .ck-row{display:flex;align-items:center;gap:8px}'
  +'#ck button{font:inherit;font-weight:700;padding:7px 14px;border-radius:8px;cursor:pointer;border:1.5px solid #407558;background:#fff;color:#1F3B2C}'
  +'#ck button.p{background:#407558;color:#fff}#ck button:hover{background:#1F3B2C;color:#fff;border-color:#1F3B2C}'
  +'#ck button.l{border:0;background:none;padding:7px 4px;color:#407558;text-decoration:underline;margin-left:auto}#ck button.l:hover{background:none;color:#1F3B2C}'
  +'#ck button:focus-visible{outline:3px solid #8FD3AE;outline-offset:2px}'
  +'#ck .ck-opt{display:none;margin:0 0 8px;border-top:1px solid #E3EAE5}#ck.cfg .ck-opt{display:block}'
  +'#ck label{display:flex;gap:8px;align-items:flex-start;padding:7px 0;border-bottom:1px solid #E3EAE5}'
  +'#ck input{margin-top:3px;accent-color:#407558;width:15px;height:15px}#ck label small{display:block;color:#55625B;font-size:12px}'
  +'@media(prefers-reduced-motion:reduce){#ck{animation:none}}';

  function build(cfg){
    var old=document.getElementById('ck');if(old)old.remove();
    if(!document.getElementById('ck-css')){var s=document.createElement('style');s.id='ck-css';s.textContent=css;document.head.appendChild(s)}
    var cur=get(),b=document.createElement('div');b.id='ck';if(cfg)b.className='cfg';
    b.setAttribute('role','dialog');b.setAttribute('aria-labelledby','ckT');
    b.innerHTML='<p><b>Usamos cookies.</b> Técnicas para que el sitio funcione y, si lo autorizas, analíticas. <a href="privacidad.html#s10">Más info</a></p>'
    +'<div class="ck-opt"><label><input type="checkbox" checked disabled><span><b>Necesarias</b><small>Siempre activas.</small></span></label>'
    +'<label><input type="checkbox" id="ckAn"'+(cur&&cur.analiticas?' checked':'')+'><span><b>Analíticas</b><small>Miden el uso del sitio de forma agregada.</small></span></label></div>'
    +'<div class="ck-row"><button type="button" class="p" id="ckOk">Aceptar</button><button type="button" id="ckNo">Rechazar</button><button type="button" class="l" id="ckCfg">'+(cfg?'Guardar':'Configurar')+'</button></div>';
    document.body.appendChild(b);
    function close(){b.remove()}
    document.getElementById('ckOk').onclick=function(){save(true);close()};
    document.getElementById('ckNo').onclick=function(){save(false);close()};
    document.getElementById('ckCfg').onclick=function(){
      if(b.classList.contains('cfg')){save(document.getElementById('ckAn').checked);close()}
      else{b.classList.add('cfg');this.textContent='Guardar'}
    };
    document.getElementById('ckOk').focus({preventScroll:true});
  }
  function init(){
    if(!get())build(false);
    Array.prototype.forEach.call(document.querySelectorAll('[data-cookies]'),function(a){
      a.addEventListener('click',function(e){e.preventDefault();build(true)});
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

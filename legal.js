(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

  /* Título palabra por palabra */
  var h1=$('#lTitle');
  if(h1&&!reduce){
    var words=h1.textContent.trim().split(/\s+/);
    h1.setAttribute('aria-label',h1.textContent.trim());
    h1.innerHTML=words.map(function(w,i){return '<span class="wd" aria-hidden="true"><span style="--i:'+i+'">'+w+'</span></span>'}).join(' ');
  }

  /* Progreso, nav y botón de subir */
  var prog=$('#progress'),nav=$('#nav'),top=$('#toTop'),tick=false;
  function onScroll(){
    var y=window.scrollY,h=document.documentElement.scrollHeight-innerHeight;
    prog.style.transform='scaleX('+(h>0?y/h:0)+')';
    nav.classList.toggle('scrolled',y>10);
    top.classList.toggle('on',y>700);
    tick=false;
  }
  window.addEventListener('scroll',function(){if(!tick){requestAnimationFrame(onScroll);tick=true}},{passive:true});
  onScroll();
  top.addEventListener('click',function(){window.scrollTo({top:0,behavior:reduce?'auto':'smooth'})});

  /* Índice lateral generado desde los títulos */
  var arts=$$('.art'),content=$('.content'),body=$('.lbody');
  if(arts.length&&body){
    var toc=document.createElement('aside');toc.className='toc';toc.setAttribute('aria-label','Contenido');
    var items=arts.map(function(a,i){
      a.id=a.id||'s'+(i+1);
      var num=a.querySelector('.art-num'),h=a.querySelector('h2');
      return '<li><a href="#'+a.id+'"><span class="toc-n">'+(i+1)+'</span>'+h.textContent+'</a></li>';
    }).join('');
    toc.innerHTML='<h2>En esta página</h2><ol>'+items+'</ol>';
    body.insertBefore(toc,content);
    var tocLinks=$$('a',toc);
    var spy=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting)return;
        arts.forEach(function(x){x.classList.toggle('cur',x===e.target)});
        tocLinks.forEach(function(l){
          var on=l.getAttribute('href')==='#'+e.target.id;
          l.classList.toggle('act',on);
          var ol=$('ol',toc);
          if(on&&ol&&toc.offsetParent){var r=l.getBoundingClientRect(),o=ol.getBoundingClientRect();
            if(r.top<o.top||r.bottom>o.bottom)ol.scrollTop+=r.top-o.top-40}
        });
      });
    },{rootMargin:'-30% 0px -60% 0px'});
    arts.forEach(function(a){spy.observe(a)});
  }

  /* Tiempo de lectura e imprimir en la cabecera */
  var heroW=$('.lhero .w');
  if(heroW&&content){
    var words2=content.textContent.trim().split(/\s+/).length,mins=Math.max(1,Math.round(words2/200));
    var meta=document.createElement('div');meta.className='meta';
    meta.innerHTML='<span class="chip">'+arts.length+' secciones</span><span class="chip">'+mins+' min de lectura</span>'+
      '<button type="button" class="chip" id="printBtn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>Imprimir</button>';
    heroW.appendChild(meta);
    $('#printBtn').addEventListener('click',function(){window.print()});
  }

  /* Buscador dentro del documento */
  if(content&&arts.length){
    var box=document.createElement('div');
    box.innerHTML='<div class="search" id="search"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#55625B" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>'+
      '<input type="search" id="q" placeholder="Buscar en este documento…" aria-label="Buscar en este documento" autocomplete="off"><button type="button" class="clear" aria-label="Borrar búsqueda">×</button></div>'+
      '<p class="search-n" id="qn" role="status" aria-live="polite"></p>';
    var sb=$('#search',box),q=$('#q',box),qn=$('#qn',box);
    content.insertBefore(box.children[1],content.firstChild);
    content.insertBefore(box.children[0],content.firstChild);
    var none=document.createElement('p');none.className='noresult';none.textContent='No encontramos resultados. Prueba con otra palabra.';
    content.appendChild(none);
    var intro=$('.intro',content);
    var orig=arts.map(function(a){return a.innerHTML});
    function esc(t){return t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
    function norm(t){return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
    function run(){
      var v=q.value.trim();sb.classList.toggle('has',!!v);
      var shown=0;
      arts.forEach(function(a,i){
        a.innerHTML=orig[i];
        if(!v){a.classList.remove('hide');shown++;return}
        var ok=norm(a.textContent).indexOf(norm(v))>-1;
        a.classList.toggle('hide',!ok);
        if(ok){shown++;
          var w=document.createTreeWalker(a,NodeFilter.SHOW_TEXT),nodes=[],n;
          while(n=w.nextNode())nodes.push(n);
          nodes.forEach(function(t){
            var txt=t.nodeValue,nt=norm(txt),nv=norm(v),idx=nt.indexOf(nv);
            if(idx<0||txt.length!==nt.length)return;
            var f=document.createDocumentFragment(),last=0;
            while(idx>-1){f.appendChild(document.createTextNode(txt.slice(last,idx)));var m=document.createElement('mark');m.textContent=txt.slice(idx,idx+v.length);f.appendChild(m);last=idx+v.length;idx=nt.indexOf(nv,last)}
            f.appendChild(document.createTextNode(txt.slice(last)));t.parentNode.replaceChild(f,t);
          });
        }
      });
      if(intro)intro.style.display=v?'none':'';
      none.classList.toggle('on',!!v&&!shown);
      qn.textContent=v?(shown?shown+' de '+arts.length+' secciones coinciden':''):'';
      if(toc)$$('li',toc).forEach(function(li,i){li.style.display=arts[i].classList.contains('hide')?'none':''});
    }
    q.addEventListener('input',run);
    $('.clear',sb).addEventListener('click',function(){q.value='';run();q.focus()});
  }

  /* Revelado al hacer scroll */
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
  },{threshold:.08,rootMargin:'0px 0px -30px 0px'});
  $$('.intro,.art').forEach(function(el){el.classList.add('rv');io.observe(el)});

  /* Red de nodos en la cabecera */
  var cv=$('#net');
  if(cv&&!reduce){
    var ctx=cv.getContext('2d'),pts=[],W,H,dpr=Math.min(window.devicePixelRatio||1,2),run=false;
    var size=function(){
      W=cv.offsetWidth;H=cv.offsetHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
      var n=Math.round(Math.min(50,W*H/14000));pts=[];
      for(var i=0;i<n;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35});
    };
    var draw=function(){
      if(!run)return;
      ctx.clearRect(0,0,W,H);
      for(var i=0;i<pts.length;i++){
        var p=pts[i];p.x+=p.vx;p.y+=p.vy;
        if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
        for(var j=i+1;j<pts.length;j++){
          var q=pts[j],dx=p.x-q.x,dy=p.y-q.y,d=dx*dx+dy*dy;
          if(d<17000){ctx.strokeStyle='rgba(143,211,174,'+(1-d/17000)*.35+')';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke()}
        }
        ctx.fillStyle='rgba(143,211,174,.7)';ctx.beginPath();ctx.arc(p.x,p.y,2,0,6.283);ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    size();window.addEventListener('resize',size);
    new IntersectionObserver(function(es){var v=es[0].isIntersecting;if(v&&!run){run=true;draw()}else if(!v)run=false}).observe(cv);
  }

  /* Enlaces de WhatsApp con mensaje personalizado */
  $$('[data-wa]').forEach(function(a){a.href='https://wa.me/573115633264?text='+encodeURIComponent(a.getAttribute('data-wa'))});
})();

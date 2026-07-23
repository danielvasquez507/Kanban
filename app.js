/* ═══════════ AUTH & API ═══════════ */
const originalFetch = window.fetch;
window.fetch = async function() {
  if (arguments[1]) {
    arguments[1].credentials = 'include';
  } else {
    arguments[1] = { credentials: 'include' };
  }
  const res = await originalFetch.apply(this, arguments);
  if (res.status === 401 && !arguments[0].includes('/api/login')) {
    document.getElementById('appWrap').style.display = 'none';
    document.getElementById('loginWrap').style.display = 'flex';
  }
  return res;
};

async function login(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.disabled = true;
  const pwd = document.getElementById('f-login-pwd').value;
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd })
    });
    if (res.ok) {
      document.getElementById('loginWrap').style.display = 'none';
      document.getElementById('appWrap').style.display = '';
      document.getElementById('loginError').style.display = 'none';
      loadApi();
    } else {
      document.getElementById('loginError').textContent = 'Contraseña incorrecta';
      document.getElementById('loginError').style.display = 'block';
    }
  } catch (err) {
    console.error(err);
  }
  btn.disabled = false;
}

async function logout() {
  await fetch('/api/logout', { method: 'POST' });
  location.reload();
}


/* ═══════════ DATA ═══════════ */
const MAX_COLS=8;
const COLORS=['#34d399','#22d3ee','#f87171','#3b82f6','#f472b6','#fb923c','#fbbf24','#a78bfa','#e879f9','#94a3b8','#f43f5e','#06b6d4','#8b5cf6','#84cc16','#ffd700','#c0c0c0','#000000','#ffffff','#b87333','#cd7f32'];
const DEFAULT={activeEnv:'env-main',view:'board',envs:[{
 id:'env-main',name:'Ruta de progresión',desc:'CARRERA IT · PLAN DE ESTUDIO 2026',icon:'🚀',logs:[],
 columns:[
  {id:'badges',num:1,name:'Badges rápidos',icon:'⚡',color:'#34d399'},
  {id:'powerplatform',num:2,name:'Power Platform',icon:'🟪',color:'#fb923c'},
  {id:'ms365',num:3,name:'MS365',icon:'🤖',color:'#f472b6'},
  {id:'redesec',num:4,name:'Redes · SysAdmin · Seguridad',icon:'🛡️',color:'#22d3ee'},
  {id:'cloud',num:5,name:'Cloud Computing',icon:'☁️',color:'#3b82f6'}
 ],
 items:[
  {id:'scrum',col:'badges',title:'Scrum Fundamentals',detail:'Marco Scrum, roles y ceremonias · renovación anual',time:3,cert:'CertiProf',impact:'Alto',url:'',state:0,comments:[],activity:[]},
  {id:'pm',col:'badges',title:'Project Management Essentials',detail:'Planificación, control y cierre de proyectos',time:10,cert:'CertiProf',impact:'Medio-alto',url:'',state:0,comments:[],activity:[]},
  {id:'busiag',col:'badges',title:'Business Agility',detail:'Agilidad organizacional y liderazgo adaptativo',time:8,cert:'CertiProf',impact:'Alto',url:'',state:0,comments:[],activity:[]},
  {id:'bi',col:'badges',title:'Business Intelligence (Foundation)',detail:'KPIs, dashboards y decisiones basadas en datos',time:6,cert:'CertiProf',impact:'Medio',url:'',state:0,comments:[],activity:[]},
  {id:'power-automate',col:'powerplatform',title:'Procesos automatizados con Power Automate',detail:'Crear y administrar procesos automatizados con Power Automate · Microsoft Power Platform y automatización de procesos empresariales',time:3,cert:'Applied Skills',impact:'Alto',url:'https://learn.microsoft.com/es-mx/credentials/applied-skills/create-and-manage-automated-processes-with-power-automate/',state:0,comments:[],activity:[]},
  {id:'canvas-apps',col:'powerplatform',title:'Apps de lienzo con Power Apps',detail:'Resolver problemas empresariales creando aplicaciones de lienzo con Microsoft Power Platform · desarrollo de apps, fórmulas tipo Excel, crear/leer/actualizar/eliminar datos',time:3,cert:'Applied Skills',impact:'Medio-alto',url:'https://learn.microsoft.com/es-mx/credentials/applied-skills/create-manage-canvas-apps-power-apps/',state:0,comments:[],activity:[]},
  {id:'model-apps',col:'powerplatform',title:'Apps basadas en modelo con Power Apps y Dataverse',detail:'Crear aplicaciones controladas por modelos con Microsoft Power Apps · modelado de datos en Dataverse, Portal de Creadores',time:3,cert:'Applied Skills',impact:'Medio-alto',url:'https://learn.microsoft.com/es-mx/credentials/applied-skills/create-and-manage-model-driven-apps-with-power-apps-and-dataverse/',state:0,comments:[],activity:[]},
  {id:'pl900',col:'powerplatform',title:'Power Platform Fundamentals',detail:'Power Platform, Dataverse, Power Apps, Power Automate',time:8,cert:'PL-900',impact:'Alto',url:'https://learn.microsoft.com/es-mx/credentials/certifications/power-platform-fundamentals/',state:0,comments:[],activity:[]},
  {id:'ab410',col:'powerplatform',title:'Asociado Constructor de Aplicaciones Inteligentes',detail:'Diseño y creación de apps con IA generativa · Copilot Studio, Power Apps, Power Automate, AI Builder',time:30,cert:'AB-410',impact:'Muy alto',url:'https://learn.microsoft.com/es-mx/credentials/certifications/intelligent-app-builder/',state:0,comments:[],activity:[]},
  {id:'ai-chat',col:'ms365',title:'Simplificar flujos de trabajo con chat de IA',detail:'Simplificar flujos de trabajo empresariales mediante chat de IA · M365 Copilot, Edge, Word, PowerPoint, Outlook, Excel',time:3,cert:'Applied Skills',impact:'Alto',url:'https://learn.microsoft.com/es-mx/credentials/applied-skills/streamline-business-workflows-with-ai-chat/',state:0,comments:[],activity:[]},
  {id:'ai-reports',col:'ms365',title:'Generar informes con agentes de investigación IA',detail:'Generar informes empresariales con agentes de investigación de IA · IA generativa y sugerencias en Microsoft Copilot',time:3,cert:'Applied Skills',impact:'Alto',url:'https://learn.microsoft.com/es-mx/credentials/applied-skills/generate-reports-with-ai-research-agents/',state:0,comments:[],activity:[]},
  {id:'copilot-sec',col:'ms365',title:'Seguridad y cumplimiento para M365 Copilot',detail:'Preparar la seguridad y el cumplimiento de Microsoft 365 para admitir Copilot · Defender XDR, Entra, Intune, Purview',time:3,cert:'Applied Skills',impact:'Alto',url:'https://learn.microsoft.com/es-mx/credentials/applied-skills/prepare-security-and-compliance-to-support-microsoft-365-copilot/',state:0,comments:[],activity:[]},
  {id:'ab900',col:'ms365',title:'Copilot & Agent Administration Fundamentals',detail:'Administración de Copilot y agentes en Microsoft 365',time:4,cert:'AB-900',impact:'Alto',url:'https://learn.microsoft.com/es-mx/credentials/certifications/copilot-and-agent-administration-fundamentals/',state:0,comments:[],activity:[]},
  {id:'networking',col:'redesec',title:'Computer Networking (Google)',detail:'TCP/IP, DNS, DHCP y troubleshooting de redes',time:15,cert:'Coursera · Google',impact:'Alto',url:'',state:0,comments:[],activity:[]},
  {id:'sysadmin',col:'redesec',title:'System Administration & IT Infra (Google)',detail:'Servidores, Active Directory y servicios de infraestructura',time:22,cert:'Coursera · Google',impact:'Muy alto',url:'',state:0,comments:[],activity:[]},
  {id:'cisco',col:'redesec',title:'Intro to Cybersecurity (Cisco NetAcad)',detail:'Amenazas, vectores de ataque y buenas prácticas de defensa',time:15,cert:'Cisco · Credly',impact:'Alto',url:'',state:0,comments:[],activity:[]},
  {id:'azure-ess',col:'cloud',title:'Cloud Computing Essentials · Azure (Microsoft)',detail:'VMs, redes virtuales, monitorización y gestión de recursos',time:25,cert:'Coursera · Microsoft',impact:'Alto',url:'',state:0,comments:[],activity:[]},
  {id:'az900',col:'cloud',title:'Aspectos básicos de Azure',detail:'Conceptos cloud, servicios Azure, pricing, SLA y soporte',time:12,cert:'AZ-900',impact:'Alto',url:'https://learn.microsoft.com/es-mx/credentials/certifications/azure-fundamentals/',state:0,comments:[],activity:[]},
  {id:'az104',col:'cloud',title:'Administrador de Azure',detail:'Implementar, administrar y supervisar Azure: redes virtuales, almacenamiento, proceso, identidad, seguridad y gobernanza · PowerShell, CLI de Azure, Portal, Bicep, Entra ID',time:40,cert:'AZ-104',impact:'Muy alto',url:'https://learn.microsoft.com/es-mx/credentials/certifications/azure-administrator/',state:0,comments:[],activity:[]}
 ]}]};

let DATA = JSON.parse(JSON.stringify(DEFAULT));
function getSlug(name) { 
  return String(name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, ''); 
}
function goHome() { if(DATA.envs && DATA.envs.length) switchEnv(DATA.envs[0].id); }

async function loadApi() {
  try {
    const res = await fetch('/api/state');
    if (res.status === 401) return; // intercepted by fetch
    document.getElementById('loginWrap').style.display = 'none';
    document.getElementById('appWrap').style.display = '';
    const state = await res.json();
    if (state.envs && state.envs.length > 0) {
      DATA.envs = state.envs;
      const path = window.location.pathname;
      const slug = path.substring(1);
      
      if (path === '/' || slug === 'index.html' || slug === '') {
        DATA.activeEnv = state.envs[0].id;
        DATA.notFound = false;
        history.replaceState({id: DATA.activeEnv}, '', '/' + getSlug(state.envs[0].name));
      } else {
        const env = DATA.envs.find(e => getSlug(e.name) === slug);
        if (env) {
          DATA.activeEnv = env.id;
          DATA.notFound = false;
        } else {
          DATA.notFound = true;
        }
      }
    } else {
      // Seed if empty
      const id = uid();
      await fetch('/api/envs', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name: 'Ruta de progresión'}) });
      DATA.envs[0].id = id;
      DATA.activeEnv = id;
      history.replaceState({id}, '', '/' + getSlug(DATA.envs[0].name));
    }
    render();
  } catch(e) {}
}
loadApi();

window.addEventListener('popstate', (e) => {
  if (e.state && e.state.id) {
    DATA.activeEnv = e.state.id;
    DATA.notFound = false;
    render();
  } else if (DATA.envs && DATA.envs.length > 0) {
    const slug = window.location.pathname.substring(1);
    if (slug === '' || slug === 'index.html') {
      DATA.activeEnv = DATA.envs[0].id;
      DATA.notFound = false;
      history.replaceState({id: DATA.activeEnv}, '', '/' + getSlug(DATA.envs[0].name));
    } else {
      const env = DATA.envs.find(env => getSlug(env.name) === slug);
      if (env) {
        DATA.activeEnv = env.id;
        DATA.notFound = false;
      } else {
        DATA.notFound = true;
      }
    }
    render();
  }
});
function persist() { /* Optimistic UI, fetch handled in functions */ }

function uid(){return 'x'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function hexToRgb(h){const r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return`${r},${g},${b}`}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function trunc(s){s=String(s==null?'':s);const t=s.length>90?s.slice(0,90)+'…':s;return escapeHtml(t);}
function curEnv(){return DATA.envs.find(e=>e.id===DATA.activeEnv)||DATA.envs[0]}
function sortedCols(env){return[...env.columns].sort((a,b)=>a.num-b.num)}
function stepVal(id,d){const el=document.getElementById(id);const min=+el.min||0,max=+el.max||999;el.value=Math.max(min,Math.min(max,(+el.value||0)+d));}
function nowStr(){const d=new Date();return d.toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'})+' · '+d.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'});}

/* ═══════════ AUDITORÍA POR ITEM ═══════════ */
const STATE_LABELS=['PENDIENTE','EN CURSO','COMPLETADO'],STATE_CLS=['pending','active','done'];
const FIELD_LABELS={title:'Título',detail:'Detalle',time:'Tiempo',cert:'Certificación',impact:'Impacto',url:'URL',col:'Columna'};
function fmtVal(field,v,env){
  if(field==='state')return STATE_LABELS[v]??String(v);
  if(field==='time')return (v||0)+' h';
  if(field==='col'){const c=(env.columns||[]).find(x=>x.id===v);return c?c.name:(v||'—');}
  return (v===undefined||v===null||v==='')?'—':String(v);
}
function pushActivity(it,entry){
  if(!it.activity)it.activity=[];
  entry.id=uid();entry.date=nowStr();
  it.activity.unshift(entry);
  it.activity=it.activity.slice(0,50);
}
function diffAndTrack(it,before,env){
  const fields=['title','detail','time','cert','impact','url','col'];
  let n=0;
  fields.forEach(f=>{
    if(String(before[f]??'')!==String(it[f]??'')){
      pushActivity(it,{type:'edit',field:f,fieldLabel:FIELD_LABELS[f]||f,oldVal:fmtVal(f,before[f],env),newVal:fmtVal(f,it[f],env)});
      n++;
    }
  });
  return n;
}

/* ═══════════ PWA ═══════════ */
(function initPWA(){
  const ICON=document.querySelector('link[rel="icon"]').href;
  const start=location.href.split('#')[0];
  const manifest={name:'Ruta de Progresión — Panel IT',short_name:'Ruta IT',description:'Tracker de estudios IT: badges, Power Platform, MS365, redes, seguridad y cloud',id:start,start_url:start,scope:location.pathname,display:'standalone',orientation:'any',background_color:'#060d1c',theme_color:'#060d1c',
    icons:[{src:ICON,sizes:'any',type:'image/svg+xml',purpose:'any'},{src:ICON,sizes:'any',type:'image/svg+xml',purpose:'maskable'}]};
  const ml=document.createElement('link');ml.rel='manifest';
  ml.href='data:application/manifest+json,'+encodeURIComponent(JSON.stringify(manifest));
  document.head.appendChild(ml);
  if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  }
})();
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;document.getElementById('installBtn').hidden=false;});
window.addEventListener('appinstalled',()=>toast(CHECK_SVG+'App instalada — ¡a estudiar!'));
function installApp(){
  if(!deferredPrompt){toast('Usa "Añadir a pantalla de inicio" del navegador','muted');return;}
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(()=>{deferredPrompt=null;document.getElementById('installBtn').hidden=true;});
}

/* ═══════════ VISTA ═══════════ */
function setView(v){DATA.view=v;persist();render();}

/* ═══════════ SCROLL BOARD ═══════════ */
function scrollBoard(dir){document.getElementById('boardScroll').scrollBy({left:dir*290,behavior:'smooth'});}
function updateNav(){
  const el=document.getElementById('boardScroll');
  const overflows=el.scrollWidth>el.clientWidth+4;
  document.getElementById('navLeft').disabled=!overflows||el.scrollLeft<=4;
  document.getElementById('navRight').disabled=!overflows||el.scrollLeft>=el.scrollWidth-el.clientWidth-4;
}
document.getElementById('boardScroll').addEventListener('scroll',updateNav);
window.addEventListener('resize',updateNav);



/* ═══════════ RENDER ═══════════ */
let firstRender=true;
const _svgIcon = (c,d)=>`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
const CHECK_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px;vertical-align:text-bottom"><polyline points="20 6 9 17 4 12"></polyline></svg>';
const REOPEN_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:text-bottom"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>';
const IMP_ICONS = {
  'Bajo': _svgIcon('var(--emerald)', 'M12 5v14M19 12l-7 7-7-7'),
  'Medio': _svgIcon('var(--amber)', 'M4 12h16'),
  'Alto': _svgIcon('var(--orange)', 'M12 19V5M5 12l7-7 7 7'),
  'Muy alto': _svgIcon('var(--red)', 'M17 11l-5-5-5 5M17 18l-5-5-5 5')
};
function render(){
  const boardScroll=document.getElementById('boardScroll');
  const listView=document.getElementById('listView');
  const notFoundView=document.getElementById('notFoundView');
  const navL=document.getElementById('navLeft'),navR=document.getElementById('navRight');
  const quotesEl=document.querySelector('.quotes');
  const statsEl=document.querySelector('.stats');
  const metroEl=document.getElementById('metro');
  const logEl=document.getElementById('logSection');

  if(DATA.notFound) {
    const hdr = document.querySelector('header'); if(hdr) hdr.style.display = 'none';
    document.querySelector('.toolbar').style.display = 'none';
    boardScroll.style.display = 'none';
    listView.style.display = 'none';
    if(quotesEl) quotesEl.style.display = 'none';
    if(statsEl) statsEl.style.display = 'none';
    if(metroEl) metroEl.style.display = 'none';
    if(logEl) logEl.style.display = 'none';
    if(notFoundView) notFoundView.style.display = 'flex';
    document.title = "404 No Encontrado - Kanban";
    return;
  }
  
  const hdr = document.querySelector('header'); if(hdr) hdr.style.display = '';
  document.querySelector('.toolbar').style.display = 'flex';
  if(notFoundView) notFoundView.style.display = 'none';
  if(quotesEl) quotesEl.style.display = 'block';
  if(statsEl) statsEl.style.display = '';
  if(metroEl) metroEl.style.display = '';
  if(logEl) logEl.style.display = '';

  const env=curEnv(),cols=sortedCols(env);
  document.getElementById('envKicker').textContent=env.desc||'PLAN DE ESTUDIO';
  document.getElementById('envTitle').textContent=env.name;
  document.getElementById('envSwitchBtn').textContent=env.icon||'🏢';
  document.title=env.name+' — Panel IT';
  const colStats=cols.map(c=>{
    const items=env.items.filter(it=>it.col===c.id);
    const done=items.filter(it=>it.state===2).length;
    return{c,total:items.length,done,frac:items.length?done/items.length:0,complete:items.length>0&&done===items.length};
  });
  const metro=document.getElementById('metro');
  if(metro){
    metro.innerHTML=colStats.map((s,i)=>
      `<div class="station${s.complete?' done':''}" data-cat="${s.c.id}" style="--c:${s.c.color};--p:${s.frac.toFixed(3)}" title="${s.c.name}: ${s.done}/${s.total}">
        <span class="dot"></span>
        <span class="lbl" style="color:${s.c.color}">${s.c.name.toUpperCase().replace(/ · /g,'·')}</span>
      </div>${i<colStats.length-1?'<span class="sep">⟷</span>':''}`
    ).join('');
  }

  /* flat + next (común a ambas vistas) */
  const flat=[];
  cols.forEach(c=>env.items.filter(it=>it.col===c.id).forEach(it=>flat.push(it)));

  /* toggle de vista */
  const view=DATA.view||'board';
  document.getElementById('viewBoard').classList.toggle('active',view==='board');
  document.getElementById('viewList').classList.toggle('active',view==='list');

  if(view==='board'){
    boardScroll.style.display='';listView.style.display='none';navL.style.display='';navR.style.display='';
    const board=document.getElementById('board');
    board.style.setProperty('--ncols',Math.max(1,cols.length));
    board.innerHTML='';
    cols.forEach((c,ci)=>{
      const items=flat.filter(it=>it.col===c.id);
      const IMP_ORDER = {'Muy alto':4, 'Alto':3, 'Medio':2, 'Bajo':1};
      items.sort((a,b) => (a.state===2 ? 1 : 0) - (b.state===2 ? 1 : 0) || (IMP_ORDER[b.impact]||0) - (IMP_ORDER[a.impact]||0));
      const done=items.filter(it=>it.state===2).length;
      const sec=document.createElement('section');
      sec.className='col';sec.style.setProperty('--c',c.color);sec.style.setProperty('--rgb',hexToRgb(c.color));
      let html=`<div class="col-head"><span class="idx">${String(c.num).padStart(2,'0')}</span><h3>${c.icon} ${c.name}</h3><span class="cnt">${done}/${items.length}</span><button class="col-edit" onclick="openColModal('${c.id}')" title="Editar columna"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button><button class="col-edit" onclick="openItemModal(null,'${c.id}')" title="Añadir item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg></button></div>`;
      items.forEach((it,ii)=>{
        const linkHtml=it.url?`<a class="lnk" href="${it.url}" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="Abrir enlace" style="margin-left:auto">🔗</a>`:'';
        const plat = it.platform ? ' — ' + escapeHtml(it.platform) : '';
        const imp = (it.impact && IMP_ICONS[it.impact]) ? `<span class="m" title="Impacto: ${escapeHtml(it.impact)}">${IMP_ICONS[it.impact]}</span>` : '';
        const crt = (it.cert && it.cert !== '—' || it.platform) ? `<span class="m">📜 ${escapeHtml(it.cert==='—'?'':it.cert)}${plat}</span>` : '';
        html+=`<article class="card st${it.state}" data-id="${it.id}" style="animation-delay:${ci*70+ii*50}ms" onclick="openItemModal('${it.id}')">
          <div class="card-head"><h4>${escapeHtml(it.title)}</h4>
            <button class="ibtn reopen" onclick="event.stopPropagation();reopenItem('${it.id}')" title="Reabrir">${REOPEN_SVG}</button></div>
          <div class="card-body">
            <div class="meta-row">${crt}${linkHtml}</div>
            <div class="chips"><span class="chip ${STATE_CLS[it.state]}">${STATE_LABELS[it.state]}</span><div style="margin-left:auto;display:flex;gap:5px;align-items:center"><span class="m">⏱ ${it.time} h</span>${imp}</div></div>
            <button class="act ${it.state===0?'start':'finish'}" onclick="event.stopPropagation();cycleState('${it.id}',event)">${it.state===0?'▶ Iniciar':CHECK_SVG+'Completar'}</button>
          </div></article>`;
      });
      sec.innerHTML=html;
      board.appendChild(sec);
    });
    if(firstRender){requestAnimationFrame(()=>board.classList.add('loaded'));firstRender=false;}
    else board.classList.add('loaded');
    updateNav();
  }else{
    boardScroll.style.display='none';listView.style.display='';navL.style.display='none';navR.style.display='none';
    renderList(flat,cols);
  }

  const total=flat.length,done=flat.filter(it=>it.state===2).length;
  const pct=total?Math.round(done/total*100):0;
  updateStats(flat,pct);
  renderLog();
}
let shown=0;
function updateStats(flat,pct){
  const total=flat.length,done=flat.filter(it=>it.state===2).length,active=flat.filter(it=>it.state===1).length;
  const el=document.getElementById('pctNum'),bar=document.getElementById('pctBar');
  const from=shown,t0=performance.now();
  (function f(t){const k=Math.min(1,(t-t0)/600),e=1-Math.pow(1-k,3),v=Math.round(from+(pct-from)*e);
    el.textContent=v+'%';bar.style.width=v+'%';if(k<1)requestAnimationFrame(f);else shown=pct;})(t0);
  document.getElementById('stDone').textContent=`${done}/${total}`;
  document.getElementById('doneBar').style.width=(total?done/total*100:0)+'%';
  document.getElementById('stActive').textContent=active;
  document.getElementById('activeBar').style.width=(total?active/total*100:0)+'%';
  let totalH=0,rem=0;flat.forEach(it=>{totalH+=it.time;if(it.state!==2)rem+=it.time});
  const doneH=totalH-rem;
  document.getElementById('hoursDone').textContent=`${doneH} h`;
  document.getElementById('hoursTotal').textContent=`${totalH} h`;
  document.getElementById('hoursBar').style.width=(totalH?doneH/totalH*100:0)+'%';
}

/* ═══════════ VISTA LISTA ═══════════ */
function renderList(flat,cols){
  const lv=document.getElementById('listView');
  let html='';
  cols.forEach(c=>{
    const items=flat.filter(it=>it.col===c.id);
    const IMP_ORDER = {'Muy alto':4, 'Alto':3, 'Medio':2, 'Bajo':1};
    items.sort((a,b) => (a.state===2 ? 1 : 0) - (b.state===2 ? 1 : 0) || (IMP_ORDER[b.impact]||0) - (IMP_ORDER[a.impact]||0));
    const done=items.filter(i=>i.state===2).length;
    html+=`<div class="list-group"><div class="list-group-head" style="--c:${c.color};--rgb:${hexToRgb(c.color)}"><span>${c.icon} ${escapeHtml(c.name)}</span><span class="list-group-cnt">${done}/${items.length}</span><button class="list-add" onclick="openItemModal(null,'${c.id}')" title="Añadir item">＋</button></div>`;
    if(!items.length) html+=`<div class="empty">// sin items en esta columna</div>`;
    items.forEach(it=>{
      const linkHtml=it.url?`<a class="lnk" href="${it.url}" target="_blank" rel="noopener" onclick="event.stopPropagation()" title="Abrir enlace" style="margin-left:auto">🔗</a>`:'';
      const plat = it.platform ? ' — ' + escapeHtml(it.platform) : '';
      const imp = (it.impact && IMP_ICONS[it.impact]) ? `<span class="m" title="Impacto: ${escapeHtml(it.impact)}">${IMP_ICONS[it.impact]}</span>` : '';
      const crt = (it.cert && it.cert !== '—' || it.platform) ? `<span class="m">📜 ${escapeHtml(it.cert==='—'?'':it.cert)}${plat}</span>` : '';
      const stBtnCls=it.state===0?'start':it.state===1?'finish':'done';
      const stBtnIcon=it.state===0?'▶':CHECK_SVG;
      html+=`<div class="list-row st${it.state}" style="--c:${c.color};--rgb:${hexToRgb(c.color)}" onclick="openItemModal('${it.id}')">
        <button class="list-state-btn ${stBtnCls}" onclick="event.stopPropagation();cycleState('${it.id}',event)" title="Cambiar estado">${stBtnIcon}</button>
        <div class="list-main">
          <div class="list-title"><h4>${escapeHtml(it.title)}</h4></div>
          <div class="list-sub"><span class="chip ${STATE_CLS[it.state]}">${STATE_LABELS[it.state]}</span><div style="margin-left:auto;display:flex;gap:5px;align-items:center"><span class="m">⏱ ${it.time} h</span>${imp}</div></div>
        </div>
        <div class="list-side">
          <div class="list-meta">${crt}${linkHtml}</div>
        </div>
      </div>`;
    });
    html+=`</div>`;
  });
  lv.innerHTML=html||'<div class="empty">Sin columnas.</div>';
}

/* ═══════════ STATE ═══════════ */
function cycleState(id,e){
  const env=curEnv(),it=env.items.find(i=>i.id===id);if(!it)return;
  const oldState=it.state;
  
  it.state=(it.state+1)%3;
  fetch('/api/items/'+id+'/state', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({state: it.state}) });
  pushActivity
(it,{type:'state',oldVal:fmtVal('state',oldState,env),newVal:fmtVal('state',it.state,env)});
  persist();
  if(it.state===2){toast(`${CHECK_SVG} ${escapeHtml(it.title)} completado`);log(`${CHECK_SVG} ${escapeHtml(it.title)} — completado`,'ok');
    if(e){const r=e.target.getBoundingClientRect();burst(r.left+r.width/2,r.top,colColor(it.col));}}
  else if(it.state===1){toast(`▶ En curso: ${escapeHtml(it.title)}`,'amber');log(`▶ ${escapeHtml(it.title)} — en curso`,'run');}
  else log(`${REOPEN_SVG} ${escapeHtml(it.title)} — reabierto`,'rs');
  render();
}
function reopenItem(id){
  const env=curEnv(),it=env.items.find(i=>i.id===id);if(!it)return;
  const oldState=it.state;
  it.state=0;
  if(oldState!==0)pushActivity(it,{type:'state',oldVal:fmtVal('state',oldState,env),newVal:fmtVal('state',0,env)});
  persist();log(`${REOPEN_SVG} ${escapeHtml(it.title)} — reabierto`,'rs');render();
}
function colColor(cid){const c=curEnv().columns.find(c=>c.id===cid);return c?c.color:'#34d399';}

/* ═══════════ ITEM MODAL + PESTAÑAS + COMENTARIOS + ACTIVIDAD ═══════════ */
let currentItemId=null;
let editingCommentId=null;
function switchItemTab(tab){
  document.querySelectorAll('#itemModal .tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===tab));
  document.querySelectorAll('#itemModal .tab-panel').forEach(p=>p.classList.toggle('active',p.id==='panel-'+tab));
  document.getElementById('btnSaveItem').style.display=(tab==='details')?'':'none';
  document.getElementById('btnAddComment').style.display=(tab==='comments'&&currentItemId)?'':'none';
}
function openItemModal(id,presetCol){
  const env=curEnv(),sel=document.getElementById('f-col');
  sel.innerHTML=sortedCols(env).map(c=>`<option value="${c.id}">${c.num}. ${c.name}</option>`).join('');
  document.getElementById('btnDelItem').style.display=id?'inline-block':'none';
  currentItemId=id||null;
  editingCommentId=null;
  if(id){
    const it=env.items.find(i=>i.id===id);if(!it)return;
    document.getElementById('imTitle').textContent=it.title||'Detalle del item';
    document.getElementById('imState').innerHTML=`<span class="chip ${STATE_CLS[it.state]}">${STATE_LABELS[it.state]}</span>`;
    document.getElementById('f-id').value=it.id;
    document.getElementById('f-title').value=it.title;
    document.getElementById('f-detail').value=it.detail;
    document.getElementById('f-time').value=it.time;
    document.getElementById('f-cert').value=it.cert;
    document.getElementById('f-platform').value=it.platform||'';
    document.getElementById('f-impact').value=it.impact||'Bajo';
    document.getElementById('f-url').value=it.url;
    sel.value=it.col;
  }else{
    document.getElementById('imTitle').textContent='Nuevo item';
    document.getElementById('imState').innerHTML=`<span class="chip pending">NUEVO</span>`;
    document.getElementById('f-id').value='';
    ['f-title','f-detail','f-cert','f-platform','f-url'].forEach(f=>document.getElementById(f).value='');
    document.getElementById('f-time').value=3;
    document.getElementById('f-impact').value='Bajo';
    if(presetCol)sel.value=presetCol;
  }
  document.getElementById('f-comment').value='';
  switchItemTab('details');
  renderComments();
  renderActivity();
  document.getElementById('itemModal').classList.add('open');
}
function renderComments(){
  const list=document.getElementById('commentList');
  const wrap=document.getElementById('commentInputWrap');
  const countEl=document.getElementById('commentCount');
  const item=currentItemId?curEnv().items.find(i=>i.id===currentItemId):null;
  if(!item){list.innerHTML='<div class="empty">Guarda el item para poder añadir comentarios.</div>';wrap.style.display='none';countEl.textContent='0';return;}
  wrap.style.display='';
  const cs=item.comments||[];
  countEl.textContent=cs.length;
  list.innerHTML=cs.length?cs.map(c=>{
    if(c.id===editingCommentId){
      return `<div class="comment editing">
        <div class="comment-meta"><span class="comment-date">Editando comentario…</span></div>
        <textarea class="comment-edit-area" id="cedit-${c.id}">${escapeHtml(c.text)}</textarea>
        <div class="comment-edit-actions">
          <button type="button" class="btn-cancel" onclick="cancelCommentEdit()">Cancelar</button>
          <button type="button" class="btn-save" onclick="saveCommentEdit('${c.id}')">Guardar</button>
        </div>
      </div>`;
    }
    return `<div class="comment">
      <div class="comment-meta"><span class="comment-date">${escapeHtml(c.date)}</span>
        <span class="comment-btns">
          <button class="comment-edit" onclick="editComment('${c.id}')" title="Editar">✎</button>
          <button class="comment-del" onclick="delComment('${c.id}')" title="Eliminar">✕</button>
        </span></div>
      <div class="comment-text">${escapeHtml(c.text)}</div>
    </div>`;
  }).join(''):'<div class="empty">// sin comentarios todavía — sé el primero</div>';
  if(editingCommentId){const ta=document.getElementById('cedit-'+editingCommentId);if(ta){ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length);}}
}
function addComment(){
  const ta=document.getElementById('f-comment');const txt=ta.value.trim();if(!txt)return;
  const item=curEnv().items.find(i=>i.id===currentItemId);if(!item)return;
  if(!item.comments)item.comments=[];
  item.comments.unshift({id:uid(),text:txt,date:nowStr()});
  pushActivity(item,{type:'comment',action:'add',text:txt});
  persist();ta.value='';renderComments();renderActivity();toast('💬 Comentario añadido');
}
function editComment(cid){editingCommentId=cid;renderComments();}
function cancelCommentEdit(){editingCommentId=null;renderComments();}
function saveCommentEdit(cid){
  const item=curEnv().items.find(i=>i.id===currentItemId);if(!item)return;
  const c=(item.comments||[]).find(x=>x.id===cid);if(!c)return;
  const ta=document.getElementById('cedit-'+cid);if(!ta)return;
  const nv=ta.value.trim();if(!nv){toast('El comentario no puede quedar vacío','muted');return;}
  if(nv===c.text){editingCommentId=null;renderComments();return;}
  const ov=c.text;c.text=nv;
  pushActivity(item,{type:'comment',action:'edit',oldVal:ov,newVal:nv});
  editingCommentId=null;persist();renderComments();renderActivity();toast('✎ Comentario editado');
}
function delComment(cid){
  const item=curEnv().items.find(i=>i.id===currentItemId);if(!item)return;
  const c=(item.comments||[]).find(x=>x.id===cid);const oldText=c?c.text:'';
  item.comments=(item.comments||[]).filter(x=>x.id!==cid);
  pushActivity(item,{type:'comment',action:'del',text:oldText});
  if(editingCommentId===cid)editingCommentId=null;
  persist();renderComments();renderActivity();
}
function renderActivity(){
  const list=document.getElementById('activityList');
  const countEl=document.getElementById('activityCount');
  const item=currentItemId?curEnv().items.find(i=>i.id===currentItemId):null;
  if(!item){list.innerHTML='<div class="empty">Sin actividad.</div>';countEl.textContent='0';return;}
  const ac=item.activity||[];
  countEl.textContent=ac.length;
  list.innerHTML=ac.length?ac.map(a=>{
    let body='';
    if(a.type==='create') body=`<div class="activity-field">🆕 Item creado</div>`;
    else if(a.type==='state') body=`<div class="activity-field">🔄 Cambio de estado</div><div class="activity-diff"><span class="val-old">${escapeHtml(a.oldVal)}</span><span class="val-arrow">→</span><span class="val-new">${escapeHtml(a.newVal)}</span></div>`;
    else if(a.type==='comment'){
      const lbl=a.action==='add'?'💬 Comentario añadido':a.action==='del'?'💬 Comentario eliminado':'💬 Comentario editado';
      let diff='';
      if(a.action==='add') diff=`<div class="activity-diff"><span class="val-new">${trunc(a.text)}</span></div>`;
      else if(a.action==='del') diff=`<div class="activity-diff"><span class="val-old">${trunc(a.text)}</span></div>`;
      else diff=`<div class="activity-diff"><span class="val-old">${trunc(a.oldVal)}</span><span class="val-arrow">→</span><span class="val-new">${trunc(a.newVal)}</span></div>`;
      body=`<div class="activity-field">${lbl}</div>${diff}`;
    }
    else body=`<div class="activity-field">✎ ${escapeHtml(a.fieldLabel)}</div><div class="activity-diff"><span class="val-old">${escapeHtml(a.oldVal)}</span><span class="val-arrow">→</span><span class="val-new">${escapeHtml(a.newVal)}</span></div>`;
    return `<div class="activity-item act-${a.type}"><div class="activity-date">${escapeHtml(a.date)}</div>${body}</div>`;
  }).join(''):'<div class="empty">// sin actividad registrada para este item</div>';
}
function saveItem(e){
  e.preventDefault();
  const env=curEnv(),id=document.getElementById('f-id').value;
  const colId=document.getElementById('f-col').value;
  const colName=(env.columns.find(c=>c.id===colId)||{}).name||'—';
  const obj={
    title:document.getElementById('f-title').value.trim(),
    detail:document.getElementById('f-detail').value.trim(),
    time:+document.getElementById('f-time').value||0,
    cert:document.getElementById('f-cert').value.trim()||'—',
    platform:document.getElementById('f-platform').value.trim()||'',
    impact:document.getElementById('f-impact').value,
    url:document.getElementById('f-url').value.trim(),
    col:colId
  };
  if(id){
    const it=env.items.find(i=>i.id===id);if(!it)return;
    const before={title:it.title,detail:it.detail,time:it.time,cert:it.cert,platform:it.platform,impact:it.impact,url:it.url,col:it.col};
    
Object.assign(it,obj);
fetch('/api/items/'+id, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...obj, column_id: colId}) });

    const n=diffAndTrack(it,before,env);
    persist();closeModal('itemModal');render();
    if(n>0){log(`✎ ${escapeHtml(obj.title)} — ${n} cambio(s)`,'rs');toast(CHECK_SVG+'Item actualizado');}
    else{toast('Sin cambios','muted');}
  }else{
    obj.id=uid();obj.state=0;obj.comments=[];obj.activity=[];
    
env.items.push(obj);
fetch('/api/columns/'+colId+'/items', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(obj) });

    pushActivity(obj,{type:'create'});
    persist();closeModal('itemModal');render();
    log(`+ ${escapeHtml(obj.title)} — creado en ${escapeHtml(colName)}`,'ok');
    toast(CHECK_SVG+'Item creado');
  }
}
function deleteItem(){
  const env=curEnv(),id=document.getElementById('f-id').value;
  const it=env.items.find(i=>i.id===id);if(!it)return;
  if(!confirm(`¿Eliminar "${it.title}"?`))return;
  
env.items=env.items.filter(i=>i.id!==id);
fetch('/api/items/'+id, { method:'DELETE' });

  persist();closeModal('itemModal');render();
  log(`✕ ${escapeHtml(it.title)} — eliminado`,'rs');toast('Item eliminado','muted');
}

/* ═══════════ SELECTOR DE ENTORNOS (popup) ═══════════ */
function openEnvSwitcher(){renderEnvList();document.getElementById('envSwitcher').classList.add('open');}
function renderEnvList(){
  document.getElementById('envList').innerHTML=DATA.envs.map((e,i)=>{
    const items=e.items||[];
    const done=items.filter(it=>it.state===2).length;
    const pct=items.length?Math.round(done/items.length*100):0;
    const active=e.id===DATA.activeEnv;
    return`<div class="env-card${active?' active':''}" style="animation-delay:${i*60}ms" onclick="switchEnv('${e.id}');closeModal('envSwitcher')">
      <span class="env-card-icon">${e.icon}</span>
      <div class="env-card-info">
        <div class="env-card-name">${escapeHtml(e.name)}${active?'<span class="env-active-badge">ACTIVO</span>':''}</div>
        <div class="env-card-desc">${escapeHtml(e.desc||'')}</div>
        <div class="env-card-meta">${e.columns.length} columnas · ${items.length} items · ${pct}%</div>
        <div class="env-card-bar"><i style="width:${pct}%"></i></div>
      </div>
      <button class="env-card-edit" onclick="event.stopPropagation();openEnvModal('${e.id}')" title="Editar">✎</button>
    </div>`;
  }).join('');
}
function switchEnv(id){
  DATA.activeEnv=id;
  DATA.notFound=false;
  const e=curEnv();
  history.pushState({id: e.id}, '', '/' + getSlug(e.name));
  persist();
  render();
  toast(`${e.icon} Entorno: ${e.name}`);
}

/* ═══════════ FORMULARIO DE ENTORNO ═══════════ */
const ENV_EMOJIS=['🚀','🌱','💼','🎓','📚','🧠','⚙️','🛡️','☁️','🏢','🏠','🎯','💻','💰','📈','👦🏽','🚗','👩'];
let selEnvIcon='🚀';
function buildEmojiRow(){
  document.getElementById('emojiRow').innerHTML=ENV_EMOJIS.map(e=>
    `<button type="button" class="emoji-opt${e===selEnvIcon?' sel':''}" onclick="pickEnvIcon('${e}')">${e}</button>`).join('');
}
function pickEnvIcon(e){
  selEnvIcon=e;buildEmojiRow();document.getElementById('fe-icon').value=e;
  const p=document.getElementById('iconPreview');p.textContent=e;p.style.animation='none';void p.offsetWidth;p.style.animation='';
}
function previewDesc(){document.getElementById('descPreview').textContent=document.getElementById('fe-desc').value;}
function openEnvModal(id){
  document.getElementById('btnDelEnv').style.display=id&&DATA.envs.length>1?'inline-block':'none';
  if(id){
    const e=DATA.envs.find(x=>x.id===id);if(!e)return;
    document.getElementById('emTitle').textContent='Editar entorno';
    document.getElementById('fe-id').value=e.id;
    document.getElementById('fe-name').value=e.name;
    document.getElementById('fe-desc').value=e.desc||'';
    selEnvIcon=e.icon||'🚀';
  }else{
    document.getElementById('emTitle').textContent='Nuevo entorno';
    document.getElementById('fe-id').value='';
    document.getElementById('fe-name').value='';
    document.getElementById('fe-desc').value='';
    selEnvIcon='🚀';
  }
  document.getElementById('fe-icon').value=selEnvIcon;
  document.getElementById('iconPreview').textContent=selEnvIcon;
  buildEmojiRow();previewDesc();
  document.getElementById('envModal').classList.add('open');
}
function saveEnv(e){
  e.preventDefault();
  const id=document.getElementById('fe-id').value;
  const obj={
    name:document.getElementById('fe-name').value.trim(),
    desc:(document.getElementById('fe-desc').value.trim()||'PLAN DE ESTUDIO').toUpperCase(),
    icon:document.getElementById('fe-icon').value||'🚀'
  };
  if(id){const env=DATA.envs.find(x=>x.id===id);
if(env)Object.assign(env,obj);log(`✎ Entorno "${escapeHtml(obj.name)}" editado`,'rs');
fetch('/api/envs/'+id, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(obj) });
}
  else{const env={id:uid(),...obj,columns:[],items:[],logs:[]};
DATA.envs.push(env);DATA.activeEnv=env.id;log(`+ Entorno "${escapeHtml(obj.name)}" creado`,'ok');
fetch('/api/envs', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(env) });
}
  persist();closeModal('envModal');render();
  toast(id?CHECK_SVG+'Entorno actualizado':CHECK_SVG+'Entorno creado');
}
function deleteEnv(){
  const id=document.getElementById('fe-id').value;
  const e=DATA.envs.find(x=>x.id===id);if(!e)return;
  if(DATA.envs.length<=1){toast('Debe existir al menos un entorno','muted');return;}
  if(!confirm(`¿Eliminar entorno "${e.name}" con ${e.columns.length} columnas y ${e.items.length} items?`))return;
  
DATA.envs=DATA.envs.filter(x=>x.id!==id);
fetch('/api/envs/'+id, { method:'DELETE' });

  if(DATA.activeEnv===id)DATA.activeEnv=DATA.envs[0].id;
  persist();closeModal('envModal');render();
  toast('Entorno eliminado','muted');
}
function closeModal(id){document.getElementById(id).classList.remove('open');}

/* ═══════════ COL MODAL ═══════════ */
let selColor=COLORS[0];
function buildSwatches(used){
  let available = COLORS.filter(c => !used.includes(c));
  let disabled = COLORS.filter(c => used.includes(c));
  let sortedColors = [...available, ...disabled];
  document.getElementById('swatches').innerHTML=sortedColors.map(c=>{
    const dis=used.includes(c);
    const attrs = dis ? `title="En uso (bloqueado)" onclick="alert('Este color ya está en uso por otra columna.')"` : `onclick="pickColor('${c}')"`;
    return`<div class="swatch${dis?' dis':''}" style="background:${c}" data-c="${c}" ${attrs}>${dis?'<span class="swatch-lock">🔒</span>':''}</div>`;
  }).join('');
}
function pickColor(c){selColor=c;document.querySelectorAll('.swatch').forEach(s=>s.classList.toggle('sel',s.dataset.c===c));}

function pickIcon(el, icon){
  document.getElementById('fc-icon').value=icon;
  document.querySelectorAll('#iconGrid span').forEach(s=>s.classList.remove('sel'));
  if(el) el.classList.add('sel');
}

function openColModal(id){
  const env=curEnv();
  if(!id&&env.columns.length>=MAX_COLS){toast(`Máximo ${MAX_COLS} columnas por entorno`,'muted');return;}
  const used=env.columns.filter(c=>c.id!==id).map(c=>c.color);
  buildSwatches(used);
  document.getElementById('btnDelCol').style.display=id?'inline-block':'none';
  if(id){
    const c=env.columns.find(x=>x.id===id);if(!c)return;
    document.getElementById('fc-id').value=c.id;
    document.getElementById('fc-name').value=c.name;
    const iconEl = Array.from(document.querySelectorAll('#iconGrid span')).find(s => s.innerText === c.icon);
    pickIcon(iconEl, c.icon);
    pickColor(c.color);
  }else{
    document.getElementById('fc-id').value='';
    document.getElementById('fc-name').value='';
    const iconEl = Array.from(document.querySelectorAll('#iconGrid span')).find(s => s.innerText === '📁');
    pickIcon(iconEl, '📁');
    pickColor(COLORS.find(c=>!used.includes(c))||COLORS[0]);
  }
  document.getElementById('colModal').classList.add('open');
}
function saveCol(e){
  e.preventDefault();
  const env=curEnv(),id=document.getElementById('fc-id').value;
  const obj={name:document.getElementById('fc-name').value.trim(),num:id?env.columns.find(x=>x.id===id).num:env.columns.length+1,icon:document.getElementById('fc-icon').value.trim()||'📁',color:selColor};
  if(id){const c=env.columns.find(x=>x.id===id);
if(c)Object.assign(c,obj);log(`✎ Columna "${escapeHtml(obj.name)}" editada`,'rs');
fetch('/api/columns/'+id, { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(obj) });
}
  else{obj.id=uid();
env.columns.push(obj);log(`+ Columna "${escapeHtml(obj.name)}" creada`,'ok');
fetch('/api/envs/'+env.id+'/columns', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(obj) });
}
  persist();closeModal('colModal');render();
  toast(id?CHECK_SVG+'Columna actualizada':CHECK_SVG+'Columna creada');
}
function deleteCol(){
  const env=curEnv(),id=document.getElementById('fc-id').value;
  const c=env.columns.find(x=>x.id===id);if(!c)return;
  const count=env.items.filter(i=>i.col===id).length;
  if(!confirm(`¿Eliminar columna "${c.name}" y sus ${count} items?`))return;
  env.columns=env.columns.filter(x=>x.id!==id);
  
env.items=env.items.filter(i=>i.col!==id);
fetch('/api/columns/'+id, { method:'DELETE' });

  persist();closeModal('colModal');render();
  log(`✕ Columna "${escapeHtml(c.name)}" eliminada (${count} items)`,'rs');toast('Columna eliminada','muted');
}

/* ═══════════ LOG POR TENANT + COLAPSABLE ═══════════ */
function toggleLog(){
  const s=document.getElementById('logSection');
  s.classList.toggle('collapsed');
  document.getElementById('logToggleTxt').textContent=s.classList.contains('collapsed')?'▸ Expandir':'▾ Colapsar';
}
function log(msg,cls){
  const env=curEnv();
  if(!Array.isArray(env.logs))env.logs=[];
  const t=new Date(),hh=String(t.getHours()).padStart(2,'0')+':'+String(t.getMinutes()).padStart(2,'0');
  
env.logs.unshift({t:hh,msg,cls});env.logs=env.logs.slice(0,12);
fetch('/api/logs', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({env_name: env.name, message: msg, cls: cls}) });

  persist();renderLog();
}
function renderLog(){
  const logs=curEnv().logs||[];
  document.getElementById('logBody').innerHTML=logs.length?logs.map(l=>
    `<div class="log-line"><span class="t">[${l.t}]</span> <span class="${l.cls}">${l.msg}</span></div>`).join('')
    :'<div class="empty">// sin actividad en este entorno — marca tu primera tarea</div>';
}

/* ═══════════ FRASES ═══════════ */
const QUOTES=[
 {t:"El experto en cualquier cosa fue una vez un principiante.",a:"Helen Hayes"},
 {t:"El éxito es la suma de pequeños esfuerzos repetidos día tras día.",a:"Robert Collier"},
 {t:"La mejor manera de predecir el futuro es creándolo.",a:"Peter Drucker"},
 {t:"Aprender es la única cosa de la que la mente nunca se cansa ni se arrepiente.",a:"Leonardo da Vinci"},
 {t:"El fracaso es solo la oportunidad de comenzar de nuevo con más inteligencia.",a:"Henry Ford"},
 {t:"La disciplina es el puente entre las metas y los logros.",a:"Jim Rohn"},
 {t:"No te detengas cuando estés cansado. Detente cuando hayas terminado.",a:"Marilyn Monroe"},
 {t:"El conocimiento es poder.",a:"Francis Bacon"},
 {t:"La constancia vence lo que la dicha no alcanza.",a:"Proverbio"},
 {t:"Primero resuelve el problema. Luego, escribe el código.",a:"John Johnson"},
 {t:"Hablar es barato. Enséñame el código.",a:"Linus Torvalds"},
 {t:"La única forma de hacer un gran trabajo es amar lo que haces.",a:"Steve Jobs"},
 {t:"Un viaje de mil millas comienza con un solo paso.",a:"Lao Tse"},
 {t:"No importa lo lento que vayas, siempre que no te detengas.",a:"Confucio"},
 {t:"La educación es el arma más poderosa para cambiar el mundo.",a:"Nelson Mandela"},
 {t:"Cree que puedes y ya estarás a medio camino.",a:"Theodore Roosevelt"},
 {t:"El mejor momento para empezar fue ayer. El segundo mejor momento es ahora.",a:"Proverbio chino"},
 {t:"Los límites solo existen si tú los pones.",a:"Anónimo"},
 {t:"Cada línea de código que escribes te acerca a tu meta.",a:"Anónimo"},
 {t:"No cuentes los días, haz que los días cuenten.",a:"Muhammad Ali"}
];
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
let qOrder=shuffle([...QUOTES.keys()]),qIdx=0;
function showQuotes(){
  const a=QUOTES[qOrder[qIdx%qOrder.length]],b=QUOTES[qOrder[(qIdx+1)%qOrder.length]];
  const q1=document.getElementById('q1'),q2=document.getElementById('q2');
  q1.innerHTML=`“${a.t}” <span class="qauthor">— ${a.a}</span>`;
  q2.innerHTML=`“${b.t}” <span class="qauthor">— ${b.a}</span>`;
  [q1,q2].forEach(el=>{el.style.animation='none';void el.offsetWidth;el.style.animation='';});
  const bar=document.getElementById('qbarFill');
  bar.style.animation='none';void bar.offsetWidth;bar.style.animation='';
  qIdx=(qIdx+2)%qOrder.length;
}

/* ═══════════ TERMINAL TYPING ═══════════ */
const TERM_TEXT=' ~/estudios — ./aprender --modo-enfoque';
let termVisible=true,typing=false;
const termText=document.getElementById('termText');
function typeTerm(){
  if(typing||!termVisible)return;
  typing=true;let i=0;termText.textContent='';
  const iv=setInterval(()=>{
    if(!termVisible){clearInterval(iv);typing=false;termText.textContent=TERM_TEXT;return;}
    termText.textContent=TERM_TEXT.slice(0,++i);
    if(i>=TERM_TEXT.length){clearInterval(iv);typing=false;}
  },40);
}
new IntersectionObserver(es=>{termVisible=es[0].isIntersecting;if(termVisible&&!typing)typeTerm();},{threshold:.3}).observe(document.querySelector('.term'));
showQuotes();typeTerm();
setInterval(()=>{showQuotes();typeTerm();},120000);

/* ═══════════ TOAST + FX ═══════════ */
function toast(msg,type=''){
  const d=document.createElement('div');d.className='toast '+type;d.innerHTML=msg;
  document.getElementById('toasts').appendChild(d);
  setTimeout(()=>{d.classList.add('out');setTimeout(()=>d.remove(),320)},3000);
}
function burst(x,y,color){
  for(let i=0;i<12;i++){
    const s=document.createElement('i');s.className='spark';
    s.style.background=[color,'#fff','#fbbf24'][i%3];s.style.left=x+'px';s.style.top=y+'px';
    document.body.appendChild(s);
    const a=Math.random()*Math.PI*2,dist=35+Math.random()*55;
    s.animate([{transform:'translate(0,0)',opacity:1},{transform:`translate(${Math.cos(a)*dist}px,${Math.sin(a)*dist+25}px) rotate(${Math.random()*300}deg)`,opacity:0}],
      {duration:600+Math.random()*200,easing:'cubic-bezier(.2,.7,.3,1)'}).onfinish=()=>s.remove();
  }
}
const PC=['#34d399','#22d3ee','#3b82f6','#f472b6','#fb923c'];
for(let i=0;i<7;i++){
  const p=document.createElement('i');p.className='packet';
  const sz=3+Math.random()*3;p.style.width=p.style.height=sz+'px';
  p.style.left=Math.random()*100+'vw';p.style.top=Math.random()*100+'vh';
  p.style.background=PC[i%PC.length];
  p.style.animationDuration=(16+Math.random()*16)+'s';
  p.style.animationDelay=(-Math.random()*18)+'s';
  document.body.appendChild(p);
}
document.querySelectorAll('.modal-overlay').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open')}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal-overlay.open').forEach(o=>o.classList.remove('open'))});
// EOF
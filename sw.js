// sw.js — cache offline para la PWA
const CACHE='ruta-it-v42';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html','./manifest.json','./icon.svg'])));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url = new URL(e.request.url);
  if(url.pathname.startsWith('/api/')) return; // No cachear llamadas a la API

  e.respondWith(
    caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
      if(res.ok&&url.origin===location.origin)
        caches.open(CACHE).then(c=>c.put(e.request,res.clone()));
      return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
// sw.js — cache offline para la PWA
const CACHE='ruta-it-v1';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html'])));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
      if(res.ok&&new URL(e.request.url).origin===location.origin)
        caches.open(CACHE).then(c=>c.put(e.request,res.clone()));
      return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
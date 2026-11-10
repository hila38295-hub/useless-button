const CACHE='useless-button-v17';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;
  const url=new URL(r.url);
  if(url.origin===location.origin){
    // app files: use cache first, refresh in background so updates arrive next launch
    e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>{const net=fetch(r).then(res=>{if(res.ok)caches.open(CACHE).then(c=>c.put(r,res.clone()));return res}).catch(()=>hit||caches.match('./index.html'));return hit||net}));
  }else if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    // fonts: cache on first online visit, then work offline
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{caches.open(CACHE).then(c=>c.put(r,res.clone()));return res}).catch(()=>new Response('',{status:503}))));
  }
});

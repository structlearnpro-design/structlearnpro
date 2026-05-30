// StructLearn Pro — Service Worker
const CACHE = 'slp-v1';

self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(self.clients.claim());
});

// Network first — always fetch fresh, fall back to cache
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).catch(function(){
      return caches.match(e.request);
    })
  );
});

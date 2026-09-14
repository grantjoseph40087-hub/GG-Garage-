const C='gg-garage-v3';

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(C).then(cache=>{
      return cache.addAll([
        './',
        './index.html',
        './manifest.json'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>{
      return Promise.all(
        keys
          .filter(key=>key!==C)
          .map(key=>caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch',event=>{
  const request=event.request;

  if(
    request.mode==='navigate' ||
    new URL(request.url).pathname.endsWith('/index.html')
  ){
    event.respondWith(
      fetch(request,{cache:'no-store'})
        .then(response=>{
          const copy=response.clone();
          caches.open(C).then(cache=>{
            cache.put(request,copy);
          });
          return response;
        })
        .catch(()=>{
          return caches.match(request).then(cached=>{
            return cached || caches.match('./index.html');
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached=>{
      return cached || fetch(request);
    })
  );
});

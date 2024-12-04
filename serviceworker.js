const cacheName = "sai-v4";
const cacheAssets = ["index.html", "js/main.js", "img/a.png"];

// Install Event
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");
  event.waitUntil(
    caches
      .open(cacheName)
      .then((cache) => {
        console.log("Service Worker: Caching Files");
        return cache.addAll(cacheAssets);
      })
      .catch((err) => console.error("Caching Failed", err))
      .then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
  // Remove old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== cacheName) {
            console.log("Service Worker: Clearing Old Cache", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch Event
// The fetch event in a service worker intercepts network requests and allows you to serve responses either from the cache or the network.
// The service worker decides:
// Serve the response from the cache.
// Fetch the response from the network.
// Provide a fallback response if both fail.
self.addEventListener("fetch", (event) => {
  console.log("Service Worker: Fetching", event.request.url);
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // make clone of response
        const resClone = res.clone();
        //open cache
        caches.open(cacheName).then((cache) => {
          //add response to cache
          cache.put(event.request, resClone);
        });
        return res;
        //if connection drop then cache run
      })
      .catch((err) => caches.match(event.request).then((res) => res))
  );
});

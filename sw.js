const CACHE_NAME = 'health-app-v2';
const urlsToCache = [
  "index.html",
  "dashboard.html",
  "medications.html",
  "reports.html",
  "signup.html",
  "steps.html",
  "vitals.html",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
  "styles.css",
  "reports.js",
  "dashboard.js",
  "signup.js",
  "login.js",
  "steps.js",
  "vitals.js",
  "utils.js",
  "medications.js"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

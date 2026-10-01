// Service Worker: App offline starten können.
// Mit Netz kommt immer die neueste Datei (und landet im Speicher),
// ohne Netz die zuletzt gespeicherte. Deshalb braucht ein Update keinen Versionszähler.
// Neue Dateien der App hier eintragen – tests/sw.test.js prüft das.

const CACHE = 'messtermine';

const APP_FILES = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './logic.js',
  './ics.js',
  './settings.js',
  './templates.js',
  './backup.js',
  './manifest.webmanifest',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(request, { cache: 'no-cache' })
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, copy)));
        }
        return response;
      })
      .catch(() => caches.match(request, { ignoreSearch: true })),
  );
});

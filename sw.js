/* Service worker voor de webversie (de Android-app gebruikt hem niet: die laadt de bestanden lokaal).
   Belangrijk: index.html gaat NETWERK-EERST. Vroeger was alles cache-eerst met een handmatig
   versienummer erbij; vergat je dat te verhogen bij een update, dan bleef de webversie voor altijd op
   de oude app hangen zonder dat iemand dat doorhad. Nu wordt bij elke start de nieuwste versie gepakt
   en is de cache puur een vangnet voor als er geen internet is. Vaste bestanden (lettertype, iconen)
   blijven wel cache-eerst — die veranderen niet en hoeven het opstarten niet te vertragen. */
const CACHE = 'gridlife-v37';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-maskable.svg', './nunito.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Is dit het opvragen van de app zelf (en niet van een los bestand)? */
function isApp(req) {
  if (req.mode === 'navigate') return true;
  const p = new URL(req.url).pathname;
  return p === '/' || p.endsWith('/index.html');
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (isApp(e.request)) {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put('./index.html', copy)).catch(() => {});
        return res;
      }).catch(() => caches.match('./index.html').then(hit => hit || caches.match('./')))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});

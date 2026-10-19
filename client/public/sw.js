// Service worker for admin phone alerts. It only handles push notifications; it never caches pages.
// Registered at the shop's root: / on its own subdomain, /s/<link>/ while shops share the platform's address.
const BASE = new URL(self.registration.scope).pathname.replace(/\/$/, '');
const inShop = (url) => (url.startsWith('/') && !url.startsWith(`${BASE}/`) ? `${BASE}${url}` : url);
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'Anjugu Peanut Butter', body: event.data ? event.data.text() : '' };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'New order', {
      body: data.body || '',
      icon: '/icons/admin-192.png',
      badge: '/icons/badge-96.png',
      tag: data.tag,
      renotify: Boolean(data.tag),
      vibrate: [120, 60, 120],
      data: { url: inShop(data.url || '/admin/orders') },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || inShop('/admin/orders'), self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const admin = windows.find((w) => new URL(w.url).pathname.startsWith(`${BASE}/admin`));
      if (admin) return admin.navigate(url).then((w) => (w || admin).focus());
      return self.clients.openWindow(url);
    }),
  );
});

// Service worker for admin phone alerts. It only handles push notifications; it never caches pages.
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
      data: { url: data.url || '/admin/orders' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || '/admin/orders', self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const admin = windows.find((w) => new URL(w.url).pathname.startsWith('/admin'));
      if (admin) return admin.navigate(url).then((w) => (w || admin).focus());
      return self.clients.openWindow(url);
    }),
  );
});

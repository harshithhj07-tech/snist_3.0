// Service Worker for Bharat Navigator Notifications & SLA Compliance Tracking

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming messages from the main thread
self.addEventListener('message', (event) => {
  if (!event.data) return;

  const { type, payload } = event.data;

  if (type === 'TRIGGER_NOTIFICATION') {
    const { title, body, icon, tag, data } = payload;
    self.registration.showNotification(title || 'Bharat Navigator Alert', {
      body: body || 'Action required for your state compliance roadmap.',
      icon: icon || '/favicon.ico',
      tag: tag || 'compliance-alert',
      badge: icon || '/favicon.ico',
      data: data || {},
      vibrate: [200, 100, 200],
      actions: [
        { action: 'open', title: 'View Roadmap' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

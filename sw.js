// ForgeLog Service Worker — background timer notifications
let timerToken = 0;

self.addEventListener('message', e => {
  if (!e.data) return;
  if (e.data.type === 'TIMER_SCHEDULE') {
    const token = ++timerToken;
    const delay = Math.max(0, e.data.endTime - Date.now());
    // e.waitUntil keeps the SW alive until the Promise resolves —
    // without this the OS suspends the worker seconds after the message.
    e.waitUntil(
      new Promise(resolve => {
        setTimeout(() => {
          if (token !== timerToken) { resolve(); return; }
          self.registration.showNotification('ForgeLog', {
            body: 'Rest over — time to hit your next set.',
            tag: 'rest-timer',
            renotify: true,
            vibrate: [200, 100, 200],
            silent: false
          }).then(resolve).catch(resolve);
        }, delay);
      })
    );
  }
  if (e.data.type === 'TIMER_CANCEL') {
    timerToken++;
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) if ('focus' in c) return c.focus();
      return clients.openWindow('./');
    })
  );
});

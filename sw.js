// ForgeLog Service Worker — background timer notifications
let timerToken = 0;

self.addEventListener('message', e => {
  if (!e.data) return;
  if (e.data.type === 'TIMER_SCHEDULE') {
    const token = ++timerToken;
    const delay = Math.max(0, e.data.endTime - Date.now());
    setTimeout(() => {
      if (token !== timerToken) return; // was cancelled or restarted
      self.registration.showNotification('Rest Over', {
        body: 'Time to hit your next set.',
        tag: 'rest-timer',
        renotify: true,
        vibrate: [200, 100, 200],
        silent: false
      });
    }, delay);
  }
  if (e.data.type === 'TIMER_CANCEL') {
    timerToken++; // invalidates any pending setTimeout
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

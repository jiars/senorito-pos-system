import { useSyncExternalStore } from "react";

// Read the browser's current connection signal.
function readBrowserConnection() {
  return navigator.onLine;
}

// Notify React when that signal changes.
function subscribeToBrowserConnection(onChange) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);

  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

export function useBrowserOnline() {
  return useSyncExternalStore(
    subscribeToBrowserConnection,
    readBrowserConnection,
  );
}

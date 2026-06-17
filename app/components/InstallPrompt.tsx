"use client";

import { useEffect, useState } from "react";

// Listens for the browser's install event and shows a small "Install app" pill.
// Self-hides when the app isn't installable (or is already installed), so it's
// non-intrusive. No effect on iOS Safari (which uses manual "Add to Home Screen").
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!deferred || dismissed) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => null);
    setDeferred(null);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-green-200 bg-white px-3 py-2 shadow-lg">
      <button onClick={install} className="rounded-full bg-green-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-800">
        📲 Install AcreHub
      </button>
      <button onClick={() => setDismissed(true)} aria-label="Dismiss" className="px-1 text-gray-400 hover:text-gray-600">✕</button>
    </div>
  );
}

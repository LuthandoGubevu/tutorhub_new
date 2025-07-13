// src/components/pwa/InstallPWA.tsx
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPWA = () => {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!prompt) {
      return;
    }
    prompt.prompt();
    prompt.userChoice.then(({ outcome }) => {
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setPrompt(null); // The prompt can only be used once
    });
  };

  if (!prompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={handleInstallClick}
        className="bg-brand-purple-blue hover:bg-brand-purple-blue/90 text-white shadow-lg animate-bounce"
        size="lg"
      >
        <Download className="mr-2 h-5 w-5" />
        Install App
      </Button>
    </div>
  );
};

export default InstallPWA;

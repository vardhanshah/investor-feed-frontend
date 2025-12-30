import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdUnitProps {
  adClient: string;
  adSlot: string;
  adFormat: string;
  adLayoutKey: string;
}

export function AdUnit({ adClient, adSlot, adFormat, adLayoutKey }: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    // Only load ad once
    if (isAdLoaded.current) return;
    isAdLoaded.current = true;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <Card className="bg-card border-border overflow-hidden my-4">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-format={adFormat}
        data-ad-layout-key={adLayoutKey}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
      />
    </Card>
  );
}

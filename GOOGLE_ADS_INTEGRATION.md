# Google AdSense In-Feed Ads Integration

This document describes how to integrate Google AdSense in-feed ads into the feed.

## Backend API

### Endpoint: `GET /api/ads/config`

**No authentication required**

Returns Google AdSense configuration for the frontend.

### Response Schema

```typescript
interface AdsConfigResponse {
  enabled: boolean;           // Whether ads should be displayed
  frequency: number;          // Number of posts between ads (e.g., 2 = ad after every 2 posts)
  ad_client: string | null;   // Google AdSense publisher ID (data-ad-client)
  ad_slot: string | null;     // Ad slot ID (data-ad-slot)
  ad_format: string;          // Ad format (data-ad-format), default: "fluid"
  ad_layout_key: string | null; // Layout key for in-feed ads (data-ad-layout-key)
}
```

### Example Response

```json
{
  "enabled": true,
  "frequency": 2,
  "ad_client": "ca-pub-9314644920823526",
  "ad_slot": "3164767034",
  "ad_format": "fluid",
  "ad_layout_key": "-6t+ed+2i-1n-4w"
}
```

## Frontend Implementation

### 1. Add API Client Function

In `client/src/lib/api.ts`:

```typescript
export interface AdsConfig {
  enabled: boolean;
  frequency: number;
  ad_client: string | null;
  ad_slot: string | null;
  ad_format: string;
  ad_layout_key: string | null;
}

export const adsApi = {
  getConfig: async (): Promise<AdsConfig> => {
    const response = await fetch(`${API_BASE_URL}/ads/config`);
    if (!response.ok) {
      throw new Error('Failed to fetch ads config');
    }
    return response.json();
  }
};
```

### 2. Create Ad Component

Create `client/src/components/AdUnit.tsx`:

```tsx
import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface AdUnitProps {
  adClient: string;
  adSlot: string;
  adFormat: string;
  adLayoutKey: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
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
    <Card className="bg-card border-border overflow-hidden">
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
```

### 3. Add AdSense Script to index.html

In `client/index.html`, add before `</head>`:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9314644920823526"
     crossorigin="anonymous"></script>
```

### 4. Update Feed Component

In `client/src/pages/feed.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { adsApi, AdsConfig } from '@/lib/api';
import { AdUnit } from '@/components/AdUnit';

// In Feed component:
const [adsConfig, setAdsConfig] = useState<AdsConfig | null>(null);

// Fetch ads config on mount
useEffect(() => {
  adsApi.getConfig()
    .then(setAdsConfig)
    .catch(err => console.error('Failed to load ads config:', err));
}, []);

// In the render section, interleave ads with posts:
{posts.map((post, index) => (
  <Fragment key={post.id}>
    <PostCard post={post} ... />

    {/* Show ad after every N posts */}
    {adsConfig?.enabled &&
     adsConfig.ad_client &&
     adsConfig.ad_slot &&
     adsConfig.ad_layout_key &&
     (index + 1) % adsConfig.frequency === 0 && (
      <AdUnit
        key={`ad-${index}`}
        adClient={adsConfig.ad_client}
        adSlot={adsConfig.ad_slot}
        adFormat={adsConfig.ad_format}
        adLayoutKey={adsConfig.ad_layout_key}
      />
    )}
  </Fragment>
))}
```

## Ad Placement Logic

Given `frequency = 2`:

```
[Post 1]
[Post 2]
[Ad]      <- after every 2 posts
[Post 3]
[Post 4]
[Ad]      <- after every 2 posts
[Post 5]
...
```

## Environment Variables (Backend)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `ADS_ENABLED` | boolean | false | Enable/disable ads globally |
| `ADS_FREQUENCY` | integer | 2 | Number of posts between ads |
| `ADS_CLIENT_ID` | string | - | Google AdSense publisher ID (ca-pub-xxx) |
| `ADS_SLOT_ID` | string | - | Ad slot ID from AdSense |
| `ADS_FORMAT` | string | fluid | Ad format type |
| `ADS_LAYOUT_KEY` | string | - | Layout key for in-feed ads |

## Testing

```bash
# Get ads config from backend
curl http://localhost:8000/api/ads/config
```

Expected response:
```json
{
  "enabled": true,
  "frequency": 2,
  "ad_client": "ca-pub-9314644920823526",
  "ad_slot": "3164767034",
  "ad_format": "fluid",
  "ad_layout_key": "-6t+ed+2i-1n-4w"
}
```

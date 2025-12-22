# Google Ads Integration Specification

This document describes how to integrate Google Ads into the feed. The backend provides configuration, and the frontend handles ad rendering.

## Backend API

### Endpoint: `GET /api/ads/config`

**No authentication required**

Returns ads configuration for the frontend.

### Response Schema

```typescript
interface AdsConfigResponse {
  enabled: boolean;       // Whether ads should be displayed
  frequency: number;      // Number of posts between ads (e.g., 2 = ad after every 2 posts)
  ad_unit_id: string | null;  // Google Ads unit ID (null when disabled)
  ad_format: "in-feed" | "banner" | "native";  // Ad format type
}
```

### Example Response

```json
{
  "enabled": true,
  "frequency": 2,
  "ad_unit_id": "ca-pub-1234567890123456",
  "ad_format": "in-feed"
}
```

## Frontend Implementation

### 1. Add API Client Function

In `client/src/lib/api.ts`:

```typescript
export interface AdsConfig {
  enabled: boolean;
  frequency: number;
  ad_unit_id: string | null;
  ad_format: 'in-feed' | 'banner' | 'native';
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

interface AdUnitProps {
  adUnitId: string;
  adFormat: 'in-feed' | 'banner' | 'native';
}

export function AdUnit({ adUnitId, adFormat }: AdUnitProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Google AdSense script if not already loaded
    if (!window.adsbygoogle) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // Push ad once script is loaded
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className="ad-container my-4">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adUnitId}
        data-ad-format={adFormat === 'in-feed' ? 'fluid' : 'auto'}
        data-full-width-responsive="true"
      />
    </div>
  );
}
```

### 3. Update Feed Component

In `client/src/pages/feed.tsx`, modify the posts rendering:

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
  <>
    <PostCard key={post.id} post={post} ... />

    {/* Show ad after every N posts */}
    {adsConfig?.enabled &&
     adsConfig.ad_unit_id &&
     (index + 1) % adsConfig.frequency === 0 && (
      <AdUnit
        key={`ad-${index}`}
        adUnitId={adsConfig.ad_unit_id}
        adFormat={adsConfig.ad_format}
      />
    )}
  </>
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
| `ADS_UNIT_ID` | string | - | Google AdSense/AdMob unit ID |
| `ADS_FORMAT` | string | in-feed | Ad format: in-feed, banner, native |

## Testing

### Backend
```bash
# Get ads config
curl http://localhost:8000/api/ads/config
```

### Frontend
1. Set up a test Google AdSense account
2. Add test ad unit ID to backend environment
3. Verify ads appear in feed at correct intervals

## Notes

- Ads are disabled by default until `ADS_ENABLED=true` is set
- When ads are disabled, `ad_unit_id` will be `null`
- The frontend should gracefully handle when ads are disabled
- Consider adding a loading skeleton for ads to prevent layout shifts

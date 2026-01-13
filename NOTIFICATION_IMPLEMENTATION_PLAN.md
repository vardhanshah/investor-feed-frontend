# Notification System Implementation Plan

## Overview
Implement a complete notification system with feed subscriptions, real-time SSE updates, and a notification bell in the header.

## Architecture

### 1. Feed Subscription System
**Location:** Feed tabs (feed.tsx)
- Bell icon on each feed tab (next to edit/delete buttons)
- Click to subscribe/unsubscribe
- Visual indicator showing subscription status

### 2. Notification Bell (Header)
**Location:** Header navigation
- Bell icon with unread count badge
- Click to open notifications dropdown
- Real-time updates via SSE

### 3. Notifications Panel
**Location:** Dropdown from bell icon
- List of recent notifications
- Mark as read functionality
- "Mark all as read" button
- Link to notification detail

### 4. Real-time Updates (SSE)
**Location:** Global context/hook
- EventSource connection to `/notifications/stream`
- Auto-reconnect on disconnect
- Update notification count in real-time

## API Endpoints Available

```
GET  /notifications              - Get user notifications
GET  /notifications/count        - Get unread count
POST /notifications/{id}/mark-read  - Mark single as read
POST /notifications/mark-all-read   - Mark all as read
GET  /notifications/stream       - SSE stream

GET  /subscriptions              - Get user subscriptions
POST /subscriptions/feeds/{id}   - Subscribe to feed
DELETE /subscriptions/feeds/{id} - Unsubscribe from feed
```

## Implementation Steps

### Step 1: Feed Subscription UI ✅
**File:** `client/src/pages/feed.tsx`

1. Add state for subscribed feeds
2. Load user subscriptions on mount
3. Add bell icon to feed tabs
4. Implement subscribe/unsubscribe handlers
5. Show different icon for subscribed/unsubscribed

```tsx
{/* Bell icon - only for non-default feeds */}
{!feed.is_default && (
  <button
    onClick={(e) => handleSubscribeToggle(feed, e)}
    className="..."
  >
    {subscribedFeeds.has(feed.id) ? (
      <Bell className="h-3 w-3 fill-current" />
    ) : (
      <BellOff className="h-3 w-3" />
    )}
  </button>
)}
```

### Step 2: Notification Context
**File:** `client/src/contexts/NotificationContext.tsx` (NEW)

Create a context to manage notifications globally:

```tsx
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  // Initialize SSE connection
  useEffect(() => {
    if (!isAuthenticated) return;

    const es = notificationsApi.createSSEConnection();

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === 'notification') {
        // Add new notification
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(prev => prev + 1);
        // Show toast notification
      }
    };

    setEventSource(es);

    return () => es.close();
  }, [isAuthenticated]);

  // Load initial notifications
  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, []);

  return (
    <NotificationContext.Provider value={...}>
      {children}
    </NotificationContext.Provider>
  );
}
```

### Step 3: Notification Bell Component
**File:** `client/src/components/NotificationBell.tsx` (NEW)

Create notification bell with dropdown:

```tsx
export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No notifications
            </p>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={markAsRead}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### Step 4: Add Bell to Header
**File:** `client/src/pages/feed.tsx` (Header section)

Add notification bell before settings:

```tsx
<div className="flex items-center space-x-2">
  <NotificationBell />  {/* NEW */}
  <Button variant="ghost" size="icon" onClick={toggleTheme}>
    {/* theme toggle */}
  </Button>
  {/* ... settings, logout */}
</div>
```

### Step 5: Notification Item Component
**File:** `client/src/components/NotificationItem.tsx` (NEW)

```tsx
export function NotificationItem({ notification, onMarkRead }) {
  return (
    <div
      className={`p-3 rounded-md cursor-pointer transition-colors ${
        notification.read
          ? 'bg-background'
          : 'bg-muted/50 hover:bg-muted'
      }`}
      onClick={() => !notification.read && onMarkRead(notification.id)}
    >
      <p className="text-sm">{notification.message}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {formatDistanceToNow(new Date(notification.created_at), {
          addSuffix: true,
        })}
      </p>
    </div>
  );
}
```

## UI/UX Flow

### Feed Subscription Flow
```
1. User sees feed tab: [Tech Feed] [Edit] [Delete] [Bell]
2. User clicks bell icon
3. API call: POST /subscriptions/feeds/123
4. Bell changes to filled: [Tech Feed] [Edit] [Delete] [Bell-Filled]
5. Toast: "Subscribed to Tech Feed notifications"
```

### Notification Flow
```
1. New post matches subscribed feed
2. Backend creates notification in DB
3. Backend pushes via SSE to user
4. Frontend receives SSE event
5. Notification added to list
6. Bell badge updates: [Bell(1)]
7. Toast shown: "New post in Tech Feed"
```

### Viewing Notifications
```
1. User clicks bell icon in header
2. Dropdown opens with notification list
3. Unread notifications highlighted
4. User clicks notification
5. Mark as read automatically
6. Badge count decreases
```

## Visual Design

### Feed Tab with Bell
```
┌───────────────────────────────────────┐
│ [Tech Feed]  [Edit] [Delete] [🔔]    │  ← Subscribed
│ [Growth Feed] [Edit] [Delete] [🔕]   │  ← Not subscribed
└───────────────────────────────────────┘
```

### Notification Bell in Header
```
┌──────────────────────────────────────┐
│  Market Pulse    [🔔(3)]  [⚙️]  [↪️] │
│                    ↑                  │
│                  Badge                │
└──────────────────────────────────────┘
```

### Notification Dropdown
```
┌────────────────────────────────────────┐
│ Notifications      [Mark all read]     │
├────────────────────────────────────────┤
│ ● Reliance • ₹15Cr posted about Rev   │  Unread
│   2 minutes ago                        │
├────────────────────────────────────────┤
│   TCS • ₹20Cr posted about Growth     │  Read
│   1 hour ago                           │
├────────────────────────────────────────┤
│   Infosys posted about Expansion      │  Read
│   3 hours ago                          │
└────────────────────────────────────────┘
```

## Benefits

1. **Real-time** - SSE pushes notifications instantly
2. **Selective** - Users only get notified about subscribed feeds
3. **Non-intrusive** - Badge shows count, dropdown shows details
4. **Persistent** - Notifications stored in DB
5. **Offline Support** - Backend tracks delivered/undelivered

## Testing Plan

1. Subscribe to a feed
2. Verify bell icon changes
3. Create a post matching feed criteria
4. Verify notification appears in real-time
5. Click notification
6. Verify marked as read
7. Verify badge count decreases
8. Test "Mark all as read"
9. Close/reopen page, verify notifications persist

## Next Steps

1. ✅ Add notification API functions
2. ⏳ Complete feed subscription UI
3. ⏳ Create NotificationContext
4. ⏳ Create NotificationBell component
5. ⏳ Add bell to header
6. ⏳ Test SSE connection
7. ⏳ Test full notification flow

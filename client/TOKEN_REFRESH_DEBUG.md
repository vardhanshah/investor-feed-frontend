# Token Refresh Debugging Guide

## Current Status

The user is getting logged out when the access token expires, even though:
- ✅ Backend is setting `refresh_token` cookie correctly (`secure=false`, `httpOnly=true`, `samesite=lax`)
- ✅ Frontend has correct token refresh logic with automatic retry on 401
- ✅ All token refresh tests are passing (57/57 tests pass)

## The Issue

**Path restriction on refresh_token cookie:** According to `openapi.yaml:170`, the cookie is set with `Path=/user/token`, which is **intentional and correct** for security. The browser will only send this cookie to the `/user/token` endpoint.

**However**, when the access token expires and a 401 occurs, the token refresh might be failing due to one of these reasons:

### Possible Root Causes

1. **Domain Mismatch**
   - Frontend runs on `localhost:5173`
   - Backend runs on `0.0.0.0:8000`
   - Browser might not send cookie from `localhost` to `0.0.0.0`
   - **Solution**: Both should use `localhost` (check backend configuration)

2. **CORS Configuration**
   - Backend might not be configured to accept cookies from frontend origin
   - Need to verify backend has `credentials: 'include'` support
   - **Solution**: Backend needs `Access-Control-Allow-Credentials: true` and correct `Access-Control-Allow-Origin`

3. **Refresh Token Expired**
   - According to spec, refresh token should last ~100 years
   - But if backend is setting a different max-age, it might expire sooner
   - **Solution**: Check backend logs to verify cookie max-age

4. **Session Expired in Redis**
   - Backend stores sessions in Redis with 30-day inactive timeout
   - If session expires, refresh will fail even with valid refresh token
   - **Solution**: Check Redis session TTL configuration

## How to Debug

### Step 1: Check Browser DevTools During Token Refresh

When you get a 401 error and token refresh happens:

1. Open **Network** tab in DevTools
2. Look for the `POST /user/token` request
3. Check **Request Headers** section
4. Verify the `Cookie` header includes `refresh_token=...`

**Expected:**
```
Cookie: refresh_token=<token_value>
```

**If missing:** This confirms the cookie isn't being sent, likely due to domain mismatch or CORS issue.

### Step 2: Check Console Logs

The frontend now logs detailed error messages. Look for:

```
[Token Refresh] Failed: {detail: "..."}
[Token Refresh] Possible causes:
  1. Refresh token cookie not being sent (check Domain/CORS)
  2. Refresh token expired
  3. Session expired in Redis
  4. Backend not configured to accept cookies from frontend origin
```

### Step 3: Verify Backend Configuration

Check backend CORS settings:

```python
# Backend should have:
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # ← Must match frontend URL
    allow_credentials=True,                    # ← Essential for cookies
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Step 4: Check Cookie Domain

In **Application > Cookies** tab in DevTools:

- **Domain** should be `localhost` (not `0.0.0.0`)
- **Path** should be `/user/token` (correct)
- **Secure** should be unchecked for local HTTP development (correct)
- **HttpOnly** should be checked (correct)
- **SameSite** should be `Lax` (correct)

If **Domain** shows `0.0.0.0`, this is the issue!

**Solution:**
1. Backend should listen on `localhost:8000` not `0.0.0.0:8000`
2. Frontend should call `http://localhost:8000` not `http://0.0.0.0:8000`
3. Update `.env` file:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

### Step 5: Test Token Refresh Manually

Using `curl` or Postman:

```bash
# 1. Login first (copy the refresh_token from Set-Cookie header)
curl -X POST http://localhost:8000/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"yourpassword"}' \
  -c cookies.txt  # Save cookies

# 2. Test token refresh
curl -X POST http://localhost:8000/user/token \
  -b cookies.txt  # Send cookies
```

**Expected response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user_id": 123,
  "email": "test@example.com"
}
```

**If error:**
```json
{
  "detail": "Refresh token missing"  ← Cookie not sent
  // OR
  "detail": "Invalid or expired refresh token"  ← Token/session expired
}
```

## Recommended Fix

Based on the typical cause, here's what to check:

### 1. Update Frontend API Base URL

```typescript
// src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
// ↑ Should be localhost, not 0.0.0.0
```

### 2. Update `.env` File

```bash
# .env
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Restart Frontend

```bash
npm run dev
```

### 4. Clear Browser Cookies

Before testing again:
1. Open DevTools → Application → Cookies
2. Delete all cookies for `0.0.0.0:8000`
3. Login again
4. Verify new cookie shows Domain = `localhost`

## Test the Fix

1. Login to the application
2. Wait 7+ hours (access token expiry: 6 hours)
   - **OR** manually delete `authToken` from localStorage to force a 401
3. Make any authenticated API call (e.g., visit a post detail page)
4. Check console logs - should see:
   ```
   [Fetch] Got 401 for: /user/me - attempting token refresh
   [Token Refresh] Starting token refresh...
   [Token Refresh] Response status: 200
   [Token Refresh] Success! Got new access token
   [Fetch] Token refreshed, retrying request to: /user/me
   ```
5. Verify you're **NOT** logged out

## If Still Having Issues

Add this temporary debug code to check if cookie is being sent:

```typescript
// Add to refreshAccessToken() in src/lib/api.ts
console.log('[Token Refresh] All cookies:', document.cookie);
console.log('[Token Refresh] Note: httpOnly cookies are NOT visible here (expected)');
```

Since `refresh_token` is httpOnly, it won't appear in `document.cookie`, but this confirms the frontend can't access it (which is correct and secure).

The only way to verify the cookie is being sent is through the **Network tab** in DevTools.

## Summary

The most likely issue is **domain mismatch** between frontend (`localhost:5173`) and backend (`0.0.0.0:8000`). Browsers don't send cookies from `localhost` to `0.0.0.0`.

**Quick fix:** Update `VITE_API_BASE_URL` to use `localhost:8000` instead of `0.0.0.0:8000`.

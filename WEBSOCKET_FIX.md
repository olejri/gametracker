# WebSocket Connection Fix

## Issue Description

The WebSocket connection was being established immediately when the application loaded, causing unnecessary connections and connect/disconnect loops even when the turn-based timer was not being used.

## Root Cause

1. **Auto-connection on app load**: The `SocketContext` was initializing the Socket.io connection in a `useEffect` that ran on mount, causing it to connect regardless of whether the timer feature was needed.

2. **No conditional connection logic**: There was no mechanism to conditionally connect based on whether the timer was enabled for a specific game session.

3. **Always enabled**: The WebSocket connection was active for all users viewing any page, not just those actively using the timer feature.

## Solution

### Changes to `src/context/SocketContext.tsx`

**Before**: Socket auto-connected on component mount
```typescript
useEffect(() => {
  const socketInstance = io({
    path: '/socket.io',
    transports: ['websocket', 'polling'],
  });
  // ... event handlers
  setSocket(socketInstance);
  // Auto-connected immediately
}, []);
```

**After**: Socket created with manual connection control
```typescript
const connect = useCallback(() => {
  if (socket?.connected) return; // Already connected
  
  const socketInstance = io({
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    autoConnect: false, // Don't auto-connect
  });
  // ... event handlers
  setSocket(socketInstance);
  socketInstance.connect(); // Manual connection
}, [socket]);

const disconnect = useCallback(() => {
  if (socket?.connected) {
    socket.disconnect();
  }
}, [socket]);
```

### Changes to `src/lib/hooks/useTurnTimer.ts`

**Added**: Connection lifecycle tied to timer enabled state
```typescript
// Connect to socket only when timer is enabled
useEffect(() => {
  if (enabled) {
    console.log('Timer enabled, connecting to socket...');
    connect();
  } else {
    console.log('Timer disabled, disconnecting from socket...');
    disconnect();
  }
}, [enabled, connect, disconnect]);
```

## How It Works Now

### Connection Flow

1. **App loads** → No WebSocket connection (no overhead)
2. **User views game session** → Still no connection (tRPC handles data sync)
3. **User clicks "Enable Timer"** → Socket connects for the first time
4. **Timer initialized** → Socket joins session room, listens for events
5. **User disables timer** → Socket disconnects, cleans up listeners
6. **User leaves page** → Socket disconnects and removes all listeners

### Benefits

✅ **No unnecessary connections**: Socket only connects when actually needed  
✅ **Resource efficient**: Saves bandwidth and server resources  
✅ **No connect/disconnect loops**: Clean connection lifecycle  
✅ **Independent data sync**: Normal tRPC operations unaffected  
✅ **Debug-friendly**: Added console logs for connection lifecycle  

## Testing

To verify the fix works correctly:

1. **Open browser console** and navigate to a game session page
2. **Before enabling timer**: Should see no WebSocket connection logs
3. **Click "Enable Timer"**: Should see "Timer enabled, connecting to socket..." and "Socket connected: [id]"
4. **Initialize timer**: Should see "Joining session room: [sessionId]"
5. **Disable timer**: Should see "Timer disabled, disconnecting from socket..." and "Socket disconnected"
6. **Re-enable timer**: Should see reconnection logs

## Compatibility

- ✅ **Existing functionality preserved**: Normal game session data sync via tRPC continues to work
- ✅ **No breaking changes**: UI and user experience remain the same
- ✅ **Backwards compatible**: Sessions without timer enabled are unaffected

## Related Files

- `src/context/SocketContext.tsx` - WebSocket connection context
- `src/lib/hooks/useTurnTimer.ts` - Timer hook with connection logic
- `src/components/TurnTimer.tsx` - Timer UI component (unchanged)

## Commit

This fix was implemented in commit `3894bd8`.

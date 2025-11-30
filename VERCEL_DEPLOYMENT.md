# Vercel Deployment & WebSocket Limitations

## ⚠️ Important: Vercel Serverless Limitations

You're correct - **Vercel's serverless functions do NOT support the custom server approach with persistent WebSocket connections** that this implementation uses.

### Why WebSockets Don't Work on Vercel Serverless

1. **Serverless Functions are Stateless**: Each function invocation is isolated and terminates after the response
2. **No Persistent Connections**: WebSocket requires a long-lived connection, which serverless functions cannot maintain
3. **Custom Server Not Supported**: Vercel doesn't support the custom `server.js` approach in serverless mode

### Current Implementation Status

The current turn-based timer implementation uses:
- Custom Next.js server (`server.js`)
- Socket.io for persistent WebSocket connections
- In-memory session state

**This architecture WILL NOT work on Vercel's standard serverless deployment.**

## Solutions for Vercel Deployment

You have several options:

### Option 1: Use Alternative Hosting (Recommended)

Deploy to a platform that supports persistent connections:

✅ **Recommended Platforms:**
- **Railway** - Free tier, supports custom servers, easy deployment
- **Render** - Free tier, excellent for Node.js apps with WebSockets
- **Fly.io** - Global deployment, supports WebSockets
- **DigitalOcean App Platform** - Simple deployment with WebSocket support
- **AWS EC2/ECS** - Full control, scalable
- **Heroku** - Easy deployment (configure sticky sessions)

**Example: Deploy to Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and initialize
railway login
railway init

# Deploy
railway up
```

### Option 2: Hybrid Deployment (Vercel + External WebSocket Server)

Keep your Next.js app on Vercel but host the WebSocket server separately:

**Architecture:**
```
[Vercel] → Next.js App (UI, tRPC API)
    ↓
[Railway/Render] → WebSocket Server (Socket.io only)
```

**Steps:**
1. Deploy Next.js app to Vercel (remove custom server)
2. Deploy standalone WebSocket server to Railway/Render
3. Update Socket.io client to connect to external WebSocket server

**Pros:**
- Keep Vercel for Next.js benefits (CDN, edge functions, etc.)
- WebSocket server on platform that supports it

**Cons:**
- More complex setup
- Two deployments to manage
- Potential CORS configuration needed

### Option 3: Disable Timer Feature on Vercel

If you want to stay on Vercel only and don't need the real-time timer:

1. Keep the app on Vercel without custom server
2. The timer feature simply won't be available
3. All other features (game tracking, tRPC APIs) work normally

**This is viable if:**
- Real-time timer is not a critical feature
- You prefer Vercel's other benefits
- Users can track turns manually

### Option 4: Use Vercel's Edge Functions with Alternative Real-Time Solution

Replace Socket.io with a Vercel-compatible solution:

**Alternatives:**
- **Pusher** - Hosted WebSocket service, free tier available
- **Ably** - Real-time messaging platform
- **Supabase Realtime** - PostgreSQL-based real-time updates
- **PartyKit** - Edge-based real-time platform designed for Vercel

**Example with Pusher:**
```typescript
// Replace Socket.io with Pusher
import Pusher from 'pusher-js';

const pusher = new Pusher('YOUR_KEY', {
  cluster: 'YOUR_CLUSTER'
});

const channel = pusher.subscribe('game-session-' + sessionId);
channel.bind('turn-changed', (data) => {
  // Handle turn change
});
```

**Pros:**
- Works on Vercel serverless
- Managed service (no server maintenance)
- Global CDN for low latency

**Cons:**
- External dependency
- May have costs at scale
- Requires code refactoring

## Recommended Path Forward

Based on your Vercel deployment concern, I recommend:

### Short-term: Deploy to Railway (5 minutes setup)

1. **Keep current code as-is**
2. **Deploy to Railway instead of Vercel:**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Deploy
   railway login
   railway init
   railway up
   ```
3. **Add environment variables in Railway dashboard**
4. **WebSocket will work immediately**

### Long-term: Hybrid Approach

1. **Main app on Vercel** (for Next.js benefits)
2. **WebSocket server on Railway** (for real-time features)
3. **Modify client to connect to Railway WebSocket URL:**
   ```typescript
   // In SocketContext.tsx
   const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3000';
   const socketInstance = io(socketUrl, {
     path: '/socket.io',
     transports: ['websocket', 'polling'],
     autoConnect: false,
   });
   ```
4. **Add to `.env`:**
   ```
   NEXT_PUBLIC_WEBSOCKET_URL=https://your-app.railway.app
   ```

## Migration Steps

### If Moving from Vercel to Railway

1. **Prepare Repository:**
   - Ensure `server.js` is in root
   - Verify `package.json` scripts are correct
   - Add Railway-specific config (optional)

2. **Deploy to Railway:**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Configure Environment Variables:**
   - Add all env vars from Vercel to Railway
   - Update any URLs if needed

4. **Test WebSocket Connection:**
   - Navigate to game session
   - Enable timer
   - Check browser console for connection logs

### If Keeping Vercel (Disable WebSocket Feature)

1. **Revert to Standard Next.js:**
   ```bash
   # Revert package.json scripts
   "dev": "next dev",
   "start": "next start"
   ```

2. **Remove WebSocket Components:**
   - Keep UI components (they'll just show disabled state)
   - Timer initialization will fail gracefully
   - Rest of app works normally

3. **Update Documentation:**
   - Note that timer feature requires non-serverless deployment

## Summary

**Your concern is valid** - WebSocket with custom server doesn't work on Vercel serverless.

**Best Solutions:**
1. ✅ **Deploy to Railway/Render** - Easiest, works immediately
2. ✅ **Hybrid: Vercel + Railway** - Best of both platforms
3. ⚠️ **Use hosted service (Pusher/Ably)** - Requires refactoring
4. ⚠️ **Disable timer on Vercel** - If feature not critical

**My Recommendation:** Deploy to Railway. It's free, takes 5 minutes, and your current code will work without any changes.

## Need Help?

If you choose Railway/Render deployment and need help:
1. I can provide Railway-specific configuration
2. I can help with hybrid Vercel + Railway setup
3. I can refactor to use Pusher/Ably if preferred

Let me know which path you'd like to take!

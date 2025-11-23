# WebSocket Setup Guide

## Overview

This application uses a custom Next.js server with Socket.io for real-time features like the turn-based timer system. This guide explains how to run and deploy the application with WebSocket support.

## Development Setup

### Prerequisites

- Node.js 20.x or higher (22.x recommended)
- npm or yarn package manager
- Database connection (MySQL for production, SQLite for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/olejri/gametracker.git
   cd gametracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Add required environment variables:
   ```env
   DATABASE_URL="your_database_url"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_key"
   CLERK_SECRET_KEY="your_clerk_secret"
   # ... other required variables
   ```

4. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

5. **Run database migrations** (if needed)
   ```bash
   npx prisma migrate dev
   ```

### Running the Development Server

The application now uses a custom server that integrates Socket.io with Next.js.

**Start the development server:**
```bash
npm run dev
```

This starts:
- Next.js application on `http://localhost:3000`
- Socket.io WebSocket server on the same port
- Hot module reloading for development

**What changed from standard Next.js:**
- Uses custom `server.js` instead of default Next.js dev server
- WebSocket connections handled by Socket.io
- All existing Next.js features work normally

## Production Deployment

### Building for Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

### Important Production Considerations

#### Port Configuration

The server listens on port specified by `PORT` environment variable (default: 3000):

```bash
PORT=8080 npm start
```

#### Environment Variables

Ensure these are set in production:
- `NODE_ENV=production`
- `DATABASE_URL` - Production database connection
- `CLERK_SECRET_KEY` - Clerk authentication secret
- All other required environment variables from `.env.example`

#### WebSocket Support

**Requirements:**
- Production server must support WebSocket connections
- Load balancers need sticky sessions or Socket.io's Redis adapter
- CORS configured appropriately if using custom domain

**Hosting platforms:**

✅ **Works out-of-the-box:**
- Vercel (with custom server route)
- Railway
- Render
- Fly.io
- DigitalOcean App Platform
- AWS EC2 / Elastic Beanstalk

⚠️ **Requires configuration:**
- Heroku (needs sticky sessions)
- AWS Lambda (needs API Gateway WebSocket support)
- Cloudflare Workers (limited WebSocket support)

### Vercel Deployment

For Vercel, you need to configure the custom server:

1. **Update `vercel.json`** (create if it doesn't exist):
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/socket.io/(.*)",
         "dest": "server.js"
       },
       {
         "src": "/(.*)",
         "dest": "server.js"
       }
     ]
   }
   ```

2. **Deploy:**
   ```bash
   vercel deploy
   ```

### Docker Deployment

**Dockerfile example:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Build and run:**
```bash
docker build -t gametracker .
docker run -p 3000:3000 -e DATABASE_URL="..." gametracker
```

### Scaling Considerations

#### Multiple Server Instances

If running multiple instances (for load balancing), you need to configure Socket.io to use a shared state:

**Install Redis adapter:**
```bash
npm install @socket.io/redis-adapter redis
```

**Update `server.js`:**
```javascript
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
});
```

**Environment variable:**
```env
REDIS_URL="redis://localhost:6379"
```

#### Load Balancer Configuration

**Nginx example with sticky sessions:**
```nginx
upstream gametracker {
    ip_hash;  # Enables sticky sessions
    server server1:3000;
    server server2:3000;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://gametracker;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## Troubleshooting

### WebSocket Connection Issues

**Problem**: "WebSocket connection failed" in browser console

**Solutions:**
1. Check if server is running: `curl http://localhost:3000/socket.io/`
2. Verify CORS settings in `server.js`
3. Check firewall rules allow WebSocket connections
4. Ensure load balancer supports WebSocket upgrades

### Development Server Not Starting

**Problem**: Server fails to start with port error

**Solutions:**
1. Check if port 3000 is already in use: `lsof -i :3000`
2. Kill existing process or use different port: `PORT=3001 npm run dev`
3. Check for syntax errors in `server.js`

### Hot Reload Not Working

**Problem**: Changes not reflected after saving files

**Solutions:**
1. This is expected behavior with custom server
2. Restart dev server to see changes to `server.js`
3. Next.js pages/components still hot-reload normally

### Production Build Errors

**Problem**: Build succeeds but server crashes on start

**Solutions:**
1. Ensure all dependencies are in `dependencies` (not `devDependencies`)
2. Check `NODE_ENV=production` is set
3. Verify Prisma client is generated: `npx prisma generate`
4. Check environment variables are all set

## Monitoring

### WebSocket Connection Status

**Client-side (browser console):**
```javascript
// Check connection status
console.log('Socket connected:', socket.connected);

// Listen for connection events
socket.on('connect', () => console.log('Connected!'));
socket.on('disconnect', () => console.log('Disconnected!'));
```

**Server-side:**
```javascript
// Add to server.js
io.on('connection', (socket) => {
  console.log(`Client ${socket.id} connected`);
  console.log(`Total clients: ${io.engine.clientsCount}`);
});
```

### Performance Metrics

Monitor these metrics in production:
- **Active WebSocket connections**: `io.engine.clientsCount`
- **Active game session rooms**: Track rooms with active timers
- **Message throughput**: Events per second
- **Memory usage**: Watch for memory leaks with long-running timers

## Security

### CORS Configuration

In production, restrict CORS to your domain:

```javascript
// server.js
const io = new Server(httpServer, {
  cors: {
    origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});
```

### Authentication

WebSocket connections inherit authentication from HTTP session:
- Uses Clerk authentication from Next.js
- Socket connections are tied to authenticated users
- Authorization checked before timer operations

### Rate Limiting

Consider adding rate limiting for timer operations:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 10 // max 10 requests per second
});
```

## Testing

### Testing WebSocket Locally

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Open multiple browser windows** to same game session

3. **Test real-time sync:**
   - Enable timer in one window
   - Pass turn in one window
   - Verify both windows update simultaneously

### Testing Production Deployment

Before deploying to production:

1. Test with production build locally:
   ```bash
   npm run build
   NODE_ENV=production npm start
   ```

2. Test WebSocket connection from external tool:
   ```bash
   npm install -g wscat
   wscat -c ws://localhost:3000/socket.io/?EIO=4&transport=websocket
   ```

## Additional Resources

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Next.js Custom Server](https://nextjs.org/docs/advanced-features/custom-server)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Turn Timer Architecture](./TURN_TIMER_ARCHITECTURE.md)
- [Turn Timer Usage Guide](./TURN_TIMER_USAGE.md)

## Summary

The custom server setup enables real-time features while maintaining all Next.js benefits:
- ✅ Hot module reloading in development
- ✅ Automatic code splitting
- ✅ API routes and tRPC
- ✅ Server-side rendering
- ✅ Static generation
- ✅ Real-time WebSocket communication

The setup is production-ready and scalable with proper configuration.

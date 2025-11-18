# Matchmaking Server

WebSocket-based matchmaking server for Web Games Collection.

## Features

- Real-time matchmaking and lobby system
- Support for multiple game types
- Automatic player matching (quick match)
- Custom lobby creation
- Game state synchronization
- Reconnection handling
- Player disconnection detection

## Setup

### Install Dependencies

```bash
cd server
npm install
```

### Run Server

```bash
# Production
npm start

# Development (with auto-restart)
npm run dev
```

The server will start on port 8080 by default. You can change this with the `PORT` environment variable:

```bash
PORT=3000 npm start
```

## Architecture

### Player Flow

1. **Connect** → Player connects to WebSocket server
2. **Register** → Player registers with a name
3. **Join Lobby** → Player either creates or joins a lobby
4. **Wait** → Players wait in lobby until full
5. **Game Start** → Game automatically starts when lobby is full
6. **Play** → Players exchange game actions via server
7. **End** → Game ends, players can join new lobbies

### Message Types

#### Client → Server

- `register` - Register player with name
- `create_lobby` - Create new lobby
- `join_lobby` - Join matchmaking queue
- `leave_lobby` - Leave current lobby
- `game_action` - Send game action to other players
- `ping` - Heartbeat

#### Server → Client

- `registered` - Registration confirmation
- `lobby_created` - Lobby creation confirmation
- `lobby_joined` - Successfully joined lobby
- `player_joined` - Another player joined your lobby
- `player_left` - Player left lobby
- `game_started` - Game is starting
- `game_action` - Game action from another player
- `player_disconnected` - Player disconnected from game
- `game_ended` - Game has ended
- `error` - Error message

## Usage Example

```javascript
// Client-side usage with matchmaking-client.js
const client = new MatchmakingClient('ws://localhost:8080');

await client.connect('Player1');

// Join quick match
client.joinMatchmaking('word-chain', 2);

// Or create custom lobby
client.createLobby('word-chain', 4);
```

## Deployment

### Local Development

```bash
npm start
```

### Production (with PM2)

```bash
npm install -g pm2
pm2 start server.js --name matchmaking-server
pm2 save
pm2 startup
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]
```

```bash
docker build -t matchmaking-server .
docker run -p 8080:8080 matchmaking-server
```

## Configuration

Environment variables:

- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment (development/production)

## Monitoring

The server logs all connections, lobby creations, game starts, and errors to console:

- 📱 New connection
- ✅ Player registered
- 🎯 Lobby created
- 👥 Player joined lobby
- 🎮 Game started
- 👋 Player disconnected
- ❌ Errors

## Security Notes

For production deployment:

1. Add authentication/authorization
2. Implement rate limiting
3. Add input validation
4. Enable CORS with whitelist
5. Use WSS (secure WebSocket)
6. Add logging and monitoring
7. Implement game state validation

## License

MIT

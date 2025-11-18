# Online Multiplayer System

The Web Games Collection now supports online multiplayer matchmaking! Play with other people in real-time across the internet.

## Quick Start

### 1. Start the Matchmaking Server

```bash
cd server
npm install
npm start
```

The server will run on `ws://localhost:8080`

### 2. Play Online

1. Open a game (e.g., Word Chain)
2. Select "Online Multiplayer" mode
3. Choose either:
   - **Quick Match** - Automatically match with other players
   - **Create Lobby** - Create a private lobby and share the code
4. Wait for other players to join
5. Game starts automatically when lobby is full!

## Supported Games

Currently, the following games support online multiplayer:

- **Word Chain** ✅ (2-4 players)

More games coming soon!

## How It Works

### Architecture

```
Player Browser 1 ←→ WebSocket Server ←→ Player Browser 2
     (Client)      (Matchmaking Server)      (Client)
```

### Components

1. **Matchmaking Server** (`server/server.js`)
   - Node.js WebSocket server
   - Handles player connections
   - Manages lobbies and matchmaking
   - Synchronizes game state

2. **Matchmaking Client** (`js/matchmaking-client.js`)
   - JavaScript library
   - Connects to server
   - Handles lobby/game events
   - Sends/receives game actions

3. **Game Integration**
   - Games include online/offline mode toggle
   - Online mode uses matchmaking client
   - Game actions sync via server
   - Offline mode works as before

## Features

### Matchmaking

- **Quick Match** - Automatically pairs you with available players
- **Custom Lobbies** - Create private games with friends
- **Player Counts** - Each game can specify min/max players
- **Auto-start** - Games start when lobby is full

### Connection Management

- **Auto-reconnect** - Attempts to reconnect if connection drops
- **Heartbeat** - Detects disconnected players
- **Graceful handling** - Games handle player disconnections

### Real-time Sync

- **Game actions** - All moves sync in real-time
- **Player updates** - See when players join/leave
- **State sync** - Game state stays consistent

## For Developers

### Adding Multiplayer to a Game

1. Include the matchmaking client:

```html
<script src="js/matchmaking-client.js"></script>
```

2. Add online/offline mode UI:

```html
<div class="mode-selection">
    <button onclick="selectMode('offline')">Offline</button>
    <button onclick="selectMode('online')">Online Multiplayer</button>
</div>
```

3. Initialize matchmaking client:

```javascript
let gameMode = 'offline';
let matchmaking = null;

function selectMode(mode) {
    gameMode = mode;
    if (mode === 'online') {
        matchmaking = new MatchmakingClient('ws://localhost:8080');
        setupMatchmakingCallbacks();
    }
}
```

4. Setup callbacks:

```javascript
function setupMatchmakingCallbacks() {
    matchmaking.onGameStarted = (game) => {
        // Initialize game with online players
        startOnlineGame(game.players);
    };

    matchmaking.onGameAction = (action) => {
        // Handle opponent's move
        processOpponentMove(action);
    };

    matchmaking.onPlayerDisconnected = (player) => {
        // Handle player leaving
        showMessage(`${player.playerName} disconnected`);
    };
}
```

5. Send game actions:

```javascript
function makeMove(move) {
    if (gameMode === 'online') {
        // Send to other players
        matchmaking.sendGameAction('move', move);
    }
    // Apply move locally
    applyMove(move);
}
```

### Example: Word Chain Integration

See `word-chain.html` for a complete example of integrating the matchmaking system.

Key integration points:
- Mode selection UI
- Matchmaking client initialization
- Lobby management
- Game action synchronization
- Player tracking

## Server Deployment

### Development

```bash
cd server
npm install
npm start
```

### Production

#### Option 1: PM2 (Recommended)

```bash
npm install -g pm2
cd server
pm2 start server.js --name matchmaking
pm2 save
pm2 startup
```

#### Option 2: systemd

Create `/etc/systemd/system/matchmaking.service`:

```ini
[Unit]
Description=Game Matchmaking Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/Web-Game/server
ExecStart=/usr/bin/node server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable matchmaking
sudo systemctl start matchmaking
```

#### Option 3: Docker

```bash
cd server
docker build -t game-matchmaking .
docker run -d -p 8080:8080 --name matchmaking game-matchmaking
```

### Cloud Deployment

#### Heroku

```bash
# In server directory
heroku create your-game-server
git push heroku main
```

#### Railway/Render

1. Connect GitHub repository
2. Set root directory to `/server`
3. Deploy automatically

#### AWS/GCP/Azure

Deploy using container services (ECS, Cloud Run, Container Instances)

## Configuration

### Server URL

Update the matchmaking client URL in your game:

```javascript
// Development
const matchmaking = new MatchmakingClient('ws://localhost:8080');

// Production
const matchmaking = new MatchmakingClient('wss://your-server.com');
```

### Environment Variables

- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment mode

## Security

For production deployment:

1. **Use WSS** - Secure WebSocket (wss://)
2. **Add authentication** - Player verification
3. **Rate limiting** - Prevent spam/abuse
4. **Input validation** - Validate all game actions
5. **CORS** - Configure allowed origins
6. **Monitoring** - Add error tracking

## Troubleshooting

### Can't connect to server

- Check server is running: `npm start`
- Verify port is correct
- Check firewall settings
- Ensure WebSocket is not blocked

### Players not matching

- Check game type matches exactly
- Verify player count settings
- Check server logs for errors

### Game desync

- Ensure all players on same game version
- Check network latency
- Verify game action handling

### Disconnections

- Check network stability
- Verify heartbeat is working
- Review reconnection logic

## Roadmap

- [ ] Game invites/friend system
- [ ] Chat system
- [ ] Player profiles & stats
- [ ] Tournaments & rankings
- [ ] Spectator mode
- [ ] More games with multiplayer

## Contributing

To add multiplayer support to a game:

1. Fork the repository
2. Add matchmaking integration
3. Test with local server
4. Submit pull request

## License

MIT

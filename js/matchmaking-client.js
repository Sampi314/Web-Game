/**
 * Matchmaking Client Library
 * Handles connection to matchmaking server and lobby management
 */

class MatchmakingClient {
    constructor(serverUrl = 'ws://localhost:8080') {
        this.serverUrl = serverUrl;
        this.ws = null;
        this.playerId = null;
        this.playerName = null;
        this.currentLobby = null;
        this.currentGame = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;

        // Event callbacks
        this.onConnected = null;
        this.onDisconnected = null;
        this.onLobbyCreated = null;
        this.onLobbyJoined = null;
        this.onLobbyLeft = null;
        this.onPlayerJoined = null;
        this.onPlayerLeft = null;
        this.onGameStarted = null;
        this.onGameAction = null;
        this.onPlayerDisconnected = null;
        this.onGameEnded = null;
        this.onError = null;
    }

    /**
     * Connect to matchmaking server
     */
    connect(playerName = null) {
        return new Promise((resolve, reject) => {
            this.playerName = playerName || `Player${Math.floor(Math.random() * 1000)}`;

            try {
                this.ws = new WebSocket(this.serverUrl);

                this.ws.onopen = () => {
                    console.log('🌐 Connected to matchmaking server');
                    this.connected = true;
                    this.reconnectAttempts = 0;

                    // Register player
                    this.send({
                        type: 'register',
                        playerName: this.playerName
                    });
                };

                this.ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        this.handleMessage(message);

                        // Resolve on successful registration
                        if (message.type === 'registered') {
                            this.playerId = message.playerId;
                            this.playerName = message.playerName;
                            if (this.onConnected) this.onConnected({ playerId: this.playerId, playerName: this.playerName });
                            resolve({ playerId: this.playerId, playerName: this.playerName });
                        }
                    } catch (error) {
                        console.error('❌ Error parsing message:', error);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('❌ WebSocket error:', error);
                    if (this.onError) this.onError(error);
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log('📴 Disconnected from matchmaking server');
                    this.connected = false;
                    if (this.onDisconnected) this.onDisconnected();

                    // Attempt reconnection
                    if (this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.reconnectAttempts++;
                        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
                        console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                        setTimeout(() => this.connect(this.playerName), delay);
                    }
                };

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Disconnect from server
     */
    disconnect() {
        if (this.ws) {
            this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
            this.ws.close();
            this.ws = null;
            this.connected = false;
            this.playerId = null;
            this.currentLobby = null;
            this.currentGame = null;
        }
    }

    /**
     * Send message to server
     */
    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('⚠️ Cannot send message: not connected');
        }
    }

    /**
     * Handle incoming messages
     */
    handleMessage(message) {
        switch (message.type) {
            case 'registered':
                // Handled in onmessage
                break;

            case 'lobby_created':
                this.currentLobby = message.lobby;
                if (this.onLobbyCreated) this.onLobbyCreated(message.lobby);
                break;

            case 'lobby_joined':
                this.currentLobby = message.lobby;
                if (this.onLobbyJoined) this.onLobbyJoined(message.lobby);
                break;

            case 'lobby_left':
                this.currentLobby = null;
                if (this.onLobbyLeft) this.onLobbyLeft();
                break;

            case 'player_joined':
                this.currentLobby = message.lobby;
                if (this.onPlayerJoined) this.onPlayerJoined({
                    playerId: message.playerId,
                    playerName: message.playerName,
                    lobby: message.lobby
                });
                break;

            case 'player_left':
                this.currentLobby = message.lobby;
                if (this.onPlayerLeft) this.onPlayerLeft({
                    playerId: message.playerId,
                    playerName: message.playerName,
                    lobby: message.lobby
                });
                break;

            case 'game_started':
                this.currentGame = message.game;
                this.currentLobby = null;
                if (this.onGameStarted) this.onGameStarted(message.game);
                break;

            case 'game_action':
                if (this.onGameAction) {
                    this.onGameAction({
                        playerId: message.playerId,
                        action: message.action,
                        data: message.data
                    });
                }
                break;

            case 'player_disconnected':
                if (this.onPlayerDisconnected) {
                    this.onPlayerDisconnected({
                        playerId: message.playerId,
                        playerName: message.playerName
                    });
                }
                break;

            case 'game_ended':
                this.currentGame = null;
                if (this.onGameEnded) this.onGameEnded({ reason: message.reason });
                break;

            case 'error':
                console.error('❌ Server error:', message.message);
                if (this.onError) this.onError(new Error(message.message));
                break;

            case 'pong':
                // Heartbeat response
                break;

            default:
                console.warn('⚠️ Unknown message type:', message.type);
        }
    }

    /**
     * Create a new lobby
     */
    createLobby(gameType, maxPlayers = 2) {
        if (!this.connected) {
            console.warn('⚠️ Not connected to server');
            return;
        }

        this.send({
            type: 'create_lobby',
            gameType,
            maxPlayers
        });
    }

    /**
     * Join matchmaking queue (quick match)
     */
    joinMatchmaking(gameType, maxPlayers = 2) {
        if (!this.connected) {
            console.warn('⚠️ Not connected to server');
            return;
        }

        this.send({
            type: 'join_lobby',
            gameType,
            maxPlayers
        });
    }

    /**
     * Leave current lobby
     */
    leaveLobby() {
        if (!this.connected || !this.currentLobby) {
            return;
        }

        this.send({
            type: 'leave_lobby'
        });
    }

    /**
     * Send game action to other players
     */
    sendGameAction(action, data) {
        if (!this.connected || !this.currentGame) {
            console.warn('⚠️ Not in a game');
            return;
        }

        this.send({
            type: 'game_action',
            action,
            data
        });
    }

    /**
     * Get current player info
     */
    getPlayerInfo() {
        return {
            playerId: this.playerId,
            playerName: this.playerName,
            connected: this.connected,
            inLobby: !!this.currentLobby,
            inGame: !!this.currentGame
        };
    }

    /**
     * Get current lobby info
     */
    getLobbyInfo() {
        return this.currentLobby;
    }

    /**
     * Get current game info
     */
    getGameInfo() {
        return this.currentGame;
    }

    /**
     * Check if this player is the host
     */
    isHost() {
        if (this.currentGame) {
            return this.currentGame.hostId === this.playerId;
        }
        if (this.currentLobby) {
            return this.currentLobby.isHost;
        }
        return false;
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.MatchmakingClient = MatchmakingClient;
}

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

// Store active connections, lobbies, and games
const players = new Map(); // playerId -> { ws, playerName, currentLobby, currentGame }
const lobbies = new Map(); // lobbyId -> { id, gameType, maxPlayers, players: [], status }
const activeGames = new Map(); // gameId -> { id, gameType, players: [], state, host }

console.log(`🎮 Matchmaking server started on port ${PORT}`);

// Broadcast to all players in a lobby
function broadcastToLobby(lobbyId, message, excludePlayerId = null) {
    const lobby = lobbies.get(lobbyId);
    if (!lobby) return;

    lobby.players.forEach(playerId => {
        if (playerId !== excludePlayerId) {
            const player = players.get(playerId);
            if (player && player.ws.readyState === WebSocket.OPEN) {
                player.ws.send(JSON.stringify(message));
            }
        }
    });
}

// Broadcast to all players in a game
function broadcastToGame(gameId, message, excludePlayerId = null) {
    const game = activeGames.get(gameId);
    if (!game) return;

    game.players.forEach(player => {
        if (player.id !== excludePlayerId) {
            const playerData = players.get(player.id);
            if (playerData && playerData.ws.readyState === WebSocket.OPEN) {
                playerData.ws.send(JSON.stringify(message));
            }
        }
    });
}

// Send message to specific player
function sendToPlayer(playerId, message) {
    const player = players.get(playerId);
    if (player && player.ws.readyState === WebSocket.OPEN) {
        player.ws.send(JSON.stringify(message));
    }
}

// Clean up player from all systems
function cleanupPlayer(playerId) {
    const player = players.get(playerId);
    if (!player) return;

    // Remove from lobby
    if (player.currentLobby) {
        const lobby = lobbies.get(player.currentLobby);
        if (lobby) {
            lobby.players = lobby.players.filter(id => id !== playerId);

            // Notify other players
            broadcastToLobby(player.currentLobby, {
                type: 'player_left',
                playerId,
                playerName: player.playerName,
                lobby: {
                    id: lobby.id,
                    players: lobby.players.map(id => ({
                        id,
                        name: players.get(id)?.playerName || 'Unknown'
                    })),
                    currentPlayers: lobby.players.length,
                    maxPlayers: lobby.maxPlayers
                }
            });

            // Delete empty lobby
            if (lobby.players.length === 0) {
                lobbies.delete(lobby.id);
            }
        }
    }

    // Remove from game
    if (player.currentGame) {
        const game = activeGames.get(player.currentGame);
        if (game) {
            broadcastToGame(player.currentGame, {
                type: 'player_disconnected',
                playerId,
                playerName: player.playerName
            });

            // Could implement game pause or end logic here
            // For now, just remove the game if host leaves
            if (game.host === playerId) {
                activeGames.delete(player.currentGame);
                broadcastToGame(player.currentGame, {
                    type: 'game_ended',
                    reason: 'host_disconnected'
                });
            }
        }
    }

    players.delete(playerId);
}

wss.on('connection', (ws) => {
    let playerId = null;

    console.log('📱 New connection');

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);

            switch (message.type) {
                case 'register':
                    // Register new player
                    playerId = uuidv4();
                    players.set(playerId, {
                        ws,
                        playerName: message.playerName || `Player${players.size + 1}`,
                        currentLobby: null,
                        currentGame: null
                    });

                    sendToPlayer(playerId, {
                        type: 'registered',
                        playerId,
                        playerName: players.get(playerId).playerName
                    });

                    console.log(`✅ Player registered: ${playerId} (${players.get(playerId).playerName})`);
                    break;

                case 'create_lobby':
                    // Create new lobby
                    if (!playerId) {
                        ws.send(JSON.stringify({ type: 'error', message: 'Not registered' }));
                        return;
                    }

                    const lobbyId = uuidv4();
                    const lobby = {
                        id: lobbyId,
                        gameType: message.gameType,
                        maxPlayers: message.maxPlayers || 2,
                        players: [playerId],
                        status: 'waiting',
                        createdAt: Date.now()
                    };

                    lobbies.set(lobbyId, lobby);
                    players.get(playerId).currentLobby = lobbyId;

                    sendToPlayer(playerId, {
                        type: 'lobby_created',
                        lobby: {
                            id: lobby.id,
                            gameType: lobby.gameType,
                            maxPlayers: lobby.maxPlayers,
                            players: [{
                                id: playerId,
                                name: players.get(playerId).playerName
                            }],
                            currentPlayers: 1,
                            isHost: true
                        }
                    });

                    console.log(`🎯 Lobby created: ${lobbyId} for ${message.gameType}`);
                    break;

                case 'join_lobby':
                    // Join existing lobby (quick match)
                    if (!playerId) {
                        ws.send(JSON.stringify({ type: 'error', message: 'Not registered' }));
                        return;
                    }

                    // Find available lobby for this game type
                    let availableLobby = null;
                    for (const [id, lobby] of lobbies.entries()) {
                        if (lobby.gameType === message.gameType &&
                            lobby.status === 'waiting' &&
                            lobby.players.length < lobby.maxPlayers) {
                            availableLobby = lobby;
                            break;
                        }
                    }

                    if (!availableLobby) {
                        // No lobby found, create one
                        const newLobbyId = uuidv4();
                        availableLobby = {
                            id: newLobbyId,
                            gameType: message.gameType,
                            maxPlayers: message.maxPlayers || 2,
                            players: [],
                            status: 'waiting',
                            createdAt: Date.now()
                        };
                        lobbies.set(newLobbyId, availableLobby);
                    }

                    // Add player to lobby
                    availableLobby.players.push(playerId);
                    players.get(playerId).currentLobby = availableLobby.id;

                    // Notify all players in lobby
                    const lobbyPlayers = availableLobby.players.map(id => ({
                        id,
                        name: players.get(id)?.playerName || 'Unknown'
                    }));

                    broadcastToLobby(availableLobby.id, {
                        type: 'player_joined',
                        playerId,
                        playerName: players.get(playerId).playerName,
                        lobby: {
                            id: availableLobby.id,
                            gameType: availableLobby.gameType,
                            maxPlayers: availableLobby.maxPlayers,
                            players: lobbyPlayers,
                            currentPlayers: availableLobby.players.length
                        }
                    }, playerId);

                    // Send confirmation to joining player
                    sendToPlayer(playerId, {
                        type: 'lobby_joined',
                        lobby: {
                            id: availableLobby.id,
                            gameType: availableLobby.gameType,
                            maxPlayers: availableLobby.maxPlayers,
                            players: lobbyPlayers,
                            currentPlayers: availableLobby.players.length,
                            isHost: availableLobby.players[0] === playerId
                        }
                    });

                    console.log(`👥 Player ${playerId} joined lobby ${availableLobby.id}`);

                    // Auto-start if lobby is full
                    if (availableLobby.players.length === availableLobby.maxPlayers) {
                        startGame(availableLobby.id);
                    }
                    break;

                case 'leave_lobby':
                    if (!playerId) return;

                    const player = players.get(playerId);
                    if (player && player.currentLobby) {
                        const currentLobby = lobbies.get(player.currentLobby);
                        if (currentLobby) {
                            currentLobby.players = currentLobby.players.filter(id => id !== playerId);

                            broadcastToLobby(player.currentLobby, {
                                type: 'player_left',
                                playerId,
                                playerName: player.playerName,
                                lobby: {
                                    id: currentLobby.id,
                                    players: currentLobby.players.map(id => ({
                                        id,
                                        name: players.get(id)?.playerName || 'Unknown'
                                    })),
                                    currentPlayers: currentLobby.players.length,
                                    maxPlayers: currentLobby.maxPlayers
                                }
                            });

                            if (currentLobby.players.length === 0) {
                                lobbies.delete(player.currentLobby);
                            }

                            player.currentLobby = null;

                            sendToPlayer(playerId, {
                                type: 'lobby_left'
                            });
                        }
                    }
                    break;

                case 'game_action':
                    // Forward game actions to other players
                    if (!playerId) return;

                    const currentPlayer = players.get(playerId);
                    if (currentPlayer && currentPlayer.currentGame) {
                        broadcastToGame(currentPlayer.currentGame, {
                            type: 'game_action',
                            playerId,
                            action: message.action,
                            data: message.data
                        }, playerId);
                    }
                    break;

                case 'ping':
                    sendToPlayer(playerId, { type: 'pong' });
                    break;
            }
        } catch (error) {
            console.error('❌ Error processing message:', error);
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
    });

    ws.on('close', () => {
        if (playerId) {
            console.log(`👋 Player disconnected: ${playerId}`);
            cleanupPlayer(playerId);
        }
    });

    ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
    });
});

function startGame(lobbyId) {
    const lobby = lobbies.get(lobbyId);
    if (!lobby) return;

    const gameId = uuidv4();
    const game = {
        id: gameId,
        gameType: lobby.gameType,
        players: lobby.players.map(id => ({
            id,
            name: players.get(id)?.playerName || 'Unknown'
        })),
        state: {},
        host: lobby.players[0],
        startedAt: Date.now()
    };

    activeGames.set(gameId, game);
    lobby.status = 'in_game';

    // Update player references
    lobby.players.forEach(playerId => {
        const player = players.get(playerId);
        if (player) {
            player.currentGame = gameId;
            player.currentLobby = null;
        }
    });

    // Notify all players
    broadcastToGame(gameId, {
        type: 'game_started',
        game: {
            id: gameId,
            gameType: game.gameType,
            players: game.players,
            hostId: game.host
        }
    });

    // Remove lobby
    lobbies.delete(lobbyId);

    console.log(`🎮 Game started: ${gameId} (${game.gameType})`);
}

// Heartbeat to detect disconnected clients
setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('error', (error) => {
    console.error('❌ Server error:', error);
});

process.on('SIGTERM', () => {
    console.log('📴 Shutting down server...');
    wss.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

                                    const BOARD_SIZE = 19;
                                    let board = [];
                                    let currentPlayer = 'black';
                                    let gameOver = false;
                                    let blockedRule = true; // true = blocked lines don't win, false = blocked lines can win
                                    let threatAlert = false; // true = show threat detection, false = hide threats
                                    let gameMode = 'pvp'; // 'pvp' = player vs player, 'pvb' = player vs bot
                                    let botThinking = false; // prevent multiple bot moves at once
                                    let botColor = null; // 'black' or 'white' - which color the bot plays
                                    let humanColor = null; // 'black' or 'white' - which color the human plays
                                    let firstBotGame = true; // true = first game in bot mode (randomize starter)
                                    let botStyle = null; // 'aggressive', 'defensive', 'balanced', 'tricky', 'patient'
                                    let botLevel = 'medium'; // 'easy', 'medium', 'hard', 'expert'
                                    let botStylePreference = 'random'; // User's style preference

                                    // Star points positions for 19x19 Go board
                                    const STAR_POINTS = [
                                    [3, 3], [3, 9], [3, 15],
                                    [9, 3], [9, 9], [9, 15],
                                    [15, 3], [15, 9], [15, 15]
                                    ];

                                    // Initialize the game
                                    function initGame() {
                                        board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
                                        gameOver = false;
                                        botThinking = false;

                                        // Determine starting player based on game mode
                                        if (gameMode === 'pvb') {
                                            // Assign bot playing style for this game
                                            if (botStylePreference === 'random') {
                                                const styles = ['aggressive', 'defensive', 'balanced', 'tricky', 'patient'];
                                                botStyle = styles[Math.floor(Math.random() * styles.length)];
                                            } else {
                                                botStyle = botStylePreference;
                                            }

                                            if (firstBotGame) {
                                                // First game in bot mode: randomize who starts
                                                const botStarts = Math.random() < 0.5;
                                                botColor = botStarts ? 'black' : 'white';
                                                humanColor = botStarts ? 'white' : 'black';
                                                currentPlayer = 'black'; // Black always starts first
                                                firstBotGame = false;
                                            }
                                            // For subsequent games, colors are already set (loser starts)
                                            currentPlayer = 'black'; // Black always starts first
                                        } else {
                                            // PvP mode: always start with black
                                            currentPlayer = 'black';
                                            botColor = null;
                                            humanColor = null;
                                            botStyle = null;
                                        }

                                        const boardElement = document.getElementById('board');
                                        boardElement.innerHTML = '';

                                        // Remove all old board style classes but keep the base 'board' class
                                        boardElement.className = 'board';

                                        for (let row = 0; row < BOARD_SIZE; row++) {
                                            for (let col = 0; col < BOARD_SIZE; col++) {
                                                const cell = document.createElement('div');
                                                cell.className = 'cell';
                                                cell.dataset.row = row;
                                                cell.dataset.col = col;

                                                // Add star point class for traditional Go board markers
                                                const isStarPoint = STAR_POINTS.some(([r, c]) => r === row && c === col);
                                                if (isStarPoint) {
                                                    cell.classList.add('star-point');
                                                    const starDot = document.createElement('div');
                                                    starDot.className = 'star-dot';
                                                    cell.appendChild(starDot);
                                                }

                                                // Add hover shadow element
                                                const hoverShadow = document.createElement('div');
                                                hoverShadow.className = `hover-shadow shadow-${currentBeadSet}`;
                                                cell.appendChild(hoverShadow);

                                                cell.onclick = () => makeMove(row, col);

                                                // Add touch support for mobile
                                                cell.ontouchend = (e) => {
                                                    e.preventDefault();
                                                    makeMove(row, col);
                                                };

                                                // Update hover shadow color based on current player
                                                cell.onmouseenter = () => {
                                                    if (!gameOver && board[row][col] === null) {
                                                        hoverShadow.className = `hover-shadow ${currentPlayer} shadow-${currentBeadSet}`;
                                                    }
                                                };

                                                // Touch start to show preview
                                                cell.ontouchstart = (e) => {
                                                    if (!gameOver && board[row][col] === null) {
                                                        hoverShadow.className = `hover-shadow ${currentPlayer} shadow-${currentBeadSet}`;
                                                        hoverShadow.style.display = 'block';
                                                    }
                                                };

                                                // Touch move to hide preview if moved away
                                                cell.ontouchmove = (e) => {
                                                    hoverShadow.style.display = 'none';
                                                };

                                                // Touch cancel to hide preview
                                                cell.ontouchcancel = (e) => {
                                                    hoverShadow.style.display = 'none';
                                                };

                                                boardElement.appendChild(cell);
                                            }
                                        }

                                        // Apply current board style
                                        boardElement.classList.add(`board-${currentBoardStyle}`);

                                        updateUI();

                                        // If bot mode and bot starts (black), make first move
                                        if (gameMode === 'pvb' && botColor === 'black') {
                                            botThinking = true;
                                            setTimeout(() => {
                                                makeBotMove();
                                                botThinking = false;
                                            }, 500);
                                        }
                                    }

                                    // Sound Effects
                                    let soundEnabled = true;
                                    let soundVolume = 0.5; // 0 to 1

                                    // Ultra-realistic material sounds with noise components
                                    function playPlaceSound() {
                                        if (!soundEnabled) return;

                                        try {
                                            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                                            const now = audioContext.currentTime;

                                            // Wood - deep thunk with initial impact noise
                                            if (currentBeadSet === 'wood') {
                                                // Impact noise burst
                                                const noise = audioContext.createBufferSource();
                                                const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.02, audioContext.sampleRate);
                                                const noiseData = noiseBuffer.getChannelData(0);
                                                for (let i = 0; i < noiseData.length; i++) {
                                                    noiseData[i] = (Math.random() * 2 - 1) * 0.3;
                                                }
                                                noise.buffer = noiseBuffer;

                                                const noiseGain = audioContext.createGain();
                                                const noiseFilter = audioContext.createBiquadFilter();
                                                noiseFilter.type = 'lowpass';
                                                noiseFilter.frequency.value = 800;

                                                noise.connect(noiseFilter);
                                                noiseFilter.connect(noiseGain);
                                                noiseGain.connect(audioContext.destination);

                                                noiseGain.gain.setValueAtTime(0.4 * soundVolume, now);
                                                noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
                                                noise.start(now);

                                                // Resonant body
                                                const osc = audioContext.createOscillator();
                                                const gain = audioContext.createGain();
                                                osc.connect(gain);
                                                gain.connect(audioContext.destination);

                                                osc.frequency.setValueAtTime(300, now);
                                                osc.frequency.exponentialRampToValueAtTime(180, now + 0.15);
                                                osc.type = 'triangle';

                                                gain.gain.setValueAtTime(0.35 * soundVolume, now);
                                                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

                                                osc.start(now);
                                                osc.stop(now + 0.15);
                                                return;
                                            }

                                            // Stone/Classic/Marble - authentic stone click with contact noise
                                            if (currentBeadSet === 'classic' || currentBeadSet === 'marble' || currentBeadSet === 'glossy') {
                                                // Sharp contact noise
                                                const noise = audioContext.createBufferSource();
                                                const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.015, audioContext.sampleRate);
                                                const noiseData = noiseBuffer.getChannelData(0);
                                                for (let i = 0; i < noiseData.length; i++) {
                                                    noiseData[i] = (Math.random() * 2 - 1) * 0.4;
                                                }
                                                noise.buffer = noiseBuffer;

                                                const noiseGain = audioContext.createGain();
                                                const noiseFilter = audioContext.createBiquadFilter();
                                                noiseFilter.type = 'highpass';
                                                noiseFilter.frequency.value = 2000;

                                                noise.connect(noiseFilter);
                                                noiseFilter.connect(noiseGain);
                                                noiseGain.connect(audioContext.destination);

                                                noiseGain.gain.setValueAtTime(0.5 * soundVolume, now);
                                                noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
                                                noise.start(now);

                                                // Stone resonance
                                                const freq = currentBeadSet === 'glossy' ? 900 : 750;
                                                const osc = audioContext.createOscillator();
                                                const gain = audioContext.createGain();
                                                osc.connect(gain);
                                                gain.connect(audioContext.destination);

                                                osc.frequency.setValueAtTime(freq, now);
                                                osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.1);
                                                osc.type = 'sine';

                                                gain.gain.setValueAtTime(0.25 * soundVolume, now);
                                                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

                                                osc.start(now);
                                                osc.stop(now + 0.1);
                                                return;
                                            }

                                            // Glass - realistic glass tap with attack transient
                                            if (currentBeadSet === 'glass') {
                                                // Sharp attack noise
                                                const noise = audioContext.createBufferSource();
                                                const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.005, audioContext.sampleRate);
                                                const noiseData = noiseBuffer.getChannelData(0);
                                                for (let i = 0; i < noiseData.length; i++) {
                                                    noiseData[i] = (Math.random() * 2 - 1) * 0.3;
                                                }
                                                noise.buffer = noiseBuffer;

                                                const noiseGain = audioContext.createGain();
                                                const noiseFilter = audioContext.createBiquadFilter();
                                                noiseFilter.type = 'highpass';
                                                noiseFilter.frequency.value = 4000;

                                                noise.connect(noiseFilter);
                                                noiseFilter.connect(noiseGain);
                                                noiseGain.connect(audioContext.destination);

                                                noiseGain.gain.setValueAtTime(0.6 * soundVolume, now);
                                                noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.005);
                                                noise.start(now);

                                                // Glass harmonics with slight frequency wobble
                                                const frequencies = [2200, 4400, 6600];
                                                const gains = [0.35, 0.18, 0.09];

                                                frequencies.forEach((freq, index) => {
                                                    const osc = audioContext.createOscillator();
                                                    const gain = audioContext.createGain();
                                                    osc.connect(gain);
                                                    gain.connect(audioContext.destination);

                                                    osc.frequency.setValueAtTime(freq, now);
                                                    osc.frequency.setValueAtTime(freq * 1.01, now + 0.01);
                                                    osc.frequency.setValueAtTime(freq, now + 0.02);
                                                    osc.type = 'sine';

                                                    const vol = gains[index] * soundVolume;
                                                    gain.gain.setValueAtTime(0, now);
                                                    gain.gain.linearRampToValueAtTime(vol, now + 0.005);
                                                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

                                                    osc.start(now);
                                                    osc.stop(now + 0.35);
                                                });
                                                return;
                                            }

                                            // Metal - metallic clang with noise
                                            if (currentBeadSet === 'metal') {
                                                // Metallic contact noise
                                                const noise = audioContext.createBufferSource();
                                                const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.01, audioContext.sampleRate);
                                                const noiseData = noiseBuffer.getChannelData(0);
                                                for (let i = 0; i < noiseData.length; i++) {
                                                    noiseData[i] = (Math.random() * 2 - 1) * 0.4;
                                                }
                                                noise.buffer = noiseBuffer;

                                                const noiseGain = audioContext.createGain();
                                                const noiseFilter = audioContext.createBiquadFilter();
                                                noiseFilter.type = 'bandpass';
                                                noiseFilter.frequency.value = 3000;
                                                noiseFilter.Q.value = 2;

                                                noise.connect(noiseFilter);
                                                noiseFilter.connect(noiseGain);
                                                noiseGain.connect(audioContext.destination);

                                                noiseGain.gain.setValueAtTime(0.5 * soundVolume, now);
                                                noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.01);
                                                noise.start(now);

                                                // Metal ring
                                                const frequencies = [1300, 2600, 3900, 5200];
                                                const gains = [0.3, 0.15, 0.08, 0.04];

                                                frequencies.forEach((freq, index) => {
                                                    const osc = audioContext.createOscillator();
                                                    const gain = audioContext.createGain();
                                                    osc.connect(gain);
                                                    gain.connect(audioContext.destination);

                                                    osc.frequency.value = freq;
                                                    osc.type = 'triangle';

                                                    const vol = gains[index] * soundVolume;
                                                    gain.gain.setValueAtTime(vol, now);
                                                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

                                                    osc.start(now);
                                                    osc.stop(now + 0.4);
                                                });
                                                return;
                                            }

                                            // Crystal - pure crystalline ring
                                            if (currentBeadSet === 'crystal') {
                                                // Tiny attack
                                                const noise = audioContext.createBufferSource();
                                                const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.003, audioContext.sampleRate);
                                                const noiseData = noiseBuffer.getChannelData(0);
                                                for (let i = 0; i < noiseData.length; i++) {
                                                    noiseData[i] = (Math.random() * 2 - 1) * 0.2;
                                                }
                                                noise.buffer = noiseBuffer;

                                                const noiseGain = audioContext.createGain();
                                                const noiseFilter = audioContext.createBiquadFilter();
                                                noiseFilter.type = 'highpass';
                                                noiseFilter.frequency.value = 5000;

                                                noise.connect(noiseFilter);
                                                noiseFilter.connect(noiseGain);
                                                noiseGain.connect(audioContext.destination);

                                                noiseGain.gain.setValueAtTime(0.4 * soundVolume, now);
                                                noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.003);
                                                noise.start(now);

                                                // Crystal harmonics
                                                const frequencies = [2600, 5200, 7800, 10400];
                                                const gains = [0.25, 0.12, 0.06, 0.03];

                                                frequencies.forEach((freq, index) => {
                                                    const osc = audioContext.createOscillator();
                                                    const gain = audioContext.createGain();
                                                    osc.connect(gain);
                                                    gain.connect(audioContext.destination);

                                                    osc.frequency.value = freq;
                                                    osc.type = 'sine';

                                                    const vol = gains[index] * soundVolume;
                                                    gain.gain.setValueAtTime(0, now);
                                                    gain.gain.linearRampToValueAtTime(vol, now + 0.003);
                                                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

                                                    osc.start(now);
                                                    osc.stop(now + 0.5);
                                                });
                                                return;
                                            }

                                            // Ceramic - clean tap
                                            if (currentBeadSet === 'ceramic') {
                                                const noise = audioContext.createBufferSource();
                                                const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.008, audioContext.sampleRate);
                                                const noiseData = noiseBuffer.getChannelData(0);
                                                for (let i = 0; i < noiseData.length; i++) {
                                                    noiseData[i] = (Math.random() * 2 - 1) * 0.3;
                                                }
                                                noise.buffer = noiseBuffer;

                                                const noiseGain = audioContext.createGain();
                                                const noiseFilter = audioContext.createBiquadFilter();
                                                noiseFilter.type = 'highpass';
                                                noiseFilter.frequency.value = 3000;

                                                noise.connect(noiseFilter);
                                                noiseFilter.connect(noiseGain);
                                                noiseGain.connect(audioContext.destination);

                                                noiseGain.gain.setValueAtTime(0.4 * soundVolume, now);
                                                noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.008);
                                                noise.start(now);

                                                const osc = audioContext.createOscillator();
                                                const gain = audioContext.createGain();
                                                osc.connect(gain);
                                                gain.connect(audioContext.destination);

                                                osc.frequency.setValueAtTime(1200, now);
                                                osc.frequency.exponentialRampToValueAtTime(650, now + 0.09);
                                                osc.type = 'sine';

                                                gain.gain.setValueAtTime(0.28 * soundVolume, now);
                                                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

                                                osc.start(now);
                                                osc.stop(now + 0.09);
                                                return;
                                            }

                                            // Gem - precious stone chime
                                            if (currentBeadSet === 'gem') {
                                                const frequencies = [1900, 3800, 5700];
                                                const gains = [0.3, 0.15, 0.08];

                                                frequencies.forEach((freq, index) => {
                                                    const osc = audioContext.createOscillator();
                                                    const gain = audioContext.createGain();
                                                    osc.connect(gain);
                                                    gain.connect(audioContext.destination);

                                                    osc.frequency.value = freq;
                                                    osc.type = 'sine';

                                                    const vol = gains[index] * soundVolume;
                                                    gain.gain.setValueAtTime(vol, now);
                                                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

                                                    osc.start(now);
                                                    osc.stop(now + 0.18);
                                                });
                                                return;
                                            }

                                            // Fallback for other styles
                                            const profiles = {
                                                flat: { freq: [600, 280], type: 'triangle', duration: 0.13 },
                                                neon: { freq: [1200, 900], type: 'square', duration: 0.07 },
                                                plasma: { freq: [1400, 1100], type: 'square', duration: 0.1 },
                                                space: { freq: [1100, 250], type: 'sawtooth', duration: 0.3 },
                                                paper: { freq: [400, 200], type: 'triangle', duration: 0.06 }
                                            };

                                            const profile = profiles[currentBeadSet];
                                            if (profile) {
                                                const osc = audioContext.createOscillator();
                                                const gain = audioContext.createGain();
                                                osc.connect(gain);
                                                gain.connect(audioContext.destination);

                                                osc.frequency.setValueAtTime(profile.freq[0], now);
                                                osc.frequency.exponentialRampToValueAtTime(profile.freq[1], now + profile.duration * 0.7);
                                                osc.type = profile.type;

                                                gain.gain.setValueAtTime(0.25 * soundVolume, now);
                                                gain.gain.exponentialRampToValueAtTime(0.01, now + profile.duration);

                                                osc.start(now);
                                                osc.stop(now + profile.duration);
                                            }

                                        } catch (e) {
                                            // Audio not supported - silent fail
                                        }
                                    }

                                    function playWinSound() {
                                        if (!soundEnabled) return;

                                        try {
                                            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                                            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

                                            notes.forEach((freq, index) => {
                                                const oscillator = audioContext.createOscillator();
                                                const gainNode = audioContext.createGain();

                                                oscillator.connect(gainNode);
                                                gainNode.connect(audioContext.destination);

                                                oscillator.frequency.value = freq;
                                                oscillator.type = 'sine';

                                                const startTime = audioContext.currentTime + index * 0.15;
                                                const volume = 0.2 * soundVolume;
                                                gainNode.gain.setValueAtTime(volume, startTime);
                                                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

                                                oscillator.start(startTime);
                                                oscillator.stop(startTime + 0.3);
                                            });
                                        } catch (e) {
                                            // Audio not supported - silent fail
                                        }
                                    }

                                    function toggleSound() {
                                        soundEnabled = !soundEnabled;
                                        const btn = document.getElementById('soundToggleBtn');
                                        const icon = btn.querySelector('.rule-icon');
                                        const text = btn.querySelector('.rule-text strong');

                                        icon.textContent = soundEnabled ? '🔊' : '🔇';
                                        text.textContent = soundEnabled ? 'ON' : 'OFF';
                                    }

                                    function updateVolume(value) {
                                        soundVolume = value / 100;
                                        document.getElementById('volumeValue').textContent = value;
                                    }

                                    // Make a move
                                    function makeMove(row, col, isBotMove = false) {
                                        if (gameOver || board[row][col] !== null) return;

                                        // In bot mode, prevent human from moving during bot's turn (but allow bot moves)
                                        if (!isBotMove && gameMode === 'pvb' && currentPlayer === botColor) return;

                                        // Prevent human moves while bot is thinking
                                        if (!isBotMove && botThinking) return;

                                        board[row][col] = currentPlayer;

                                        // Play placement sound
                                        playPlaceSound();

                                        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                                        cell.classList.add('has-stone');

                                        const stone = document.createElement('div');
                                        stone.className = `stone ${currentPlayer} stone-${currentBeadSet}`;

                                        // Generate random crystal shape if using crystal bead set
                                        if (currentBeadSet === 'crystal') {
                                            const randomShape = generateRandomCrystalShape();
                                            stone.style.clipPath = randomShape;
                                        }

                                        cell.appendChild(stone);

                                        if (checkWin(row, col)) {
                                            gameOver = true;
                                            const winner = currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1);

                                            // In bot mode, show correct win message and update colors for next game
                                            if (gameMode === 'pvb') {
                                                // Check who won BEFORE swapping colors
                                                const humanWon = currentPlayer === humanColor;

                                                // Now update colors so loser starts next game
                                                const loserColor = currentPlayer === 'black' ? 'white' : 'black';
                                                // Loser gets black (starts first) in next game
                                                if (loserColor === humanColor) {
                                                    botColor = 'white';
                                                    humanColor = 'black';
                                                } else {
                                                    botColor = 'black';
                                                    humanColor = 'white';
                                                }

                                                // Display win message based on who won
                                                if (humanWon) {
                                                    document.getElementById('message').innerHTML = `🎉 You (${winner}) Win!`;
                                                } else {
                                                    document.getElementById('message').innerHTML = `🎉 Bot (${winner}) Wins!`;
                                                }
                                            } else {
                                                document.getElementById('message').innerHTML = `🎉 ${winner} Wins!`;
                                            }

                                            // Play win sound
                                            playWinSound();

                                            document.getElementById('message').classList.add('win-message');
                                            updateThreats(); // Clear threats on game over
                                            return;
                                        }

                                        if (isBoardFull()) {
                                            gameOver = true;
                                            document.getElementById('message').innerHTML = `🤝 It's a Draw!`;
                                            updateThreats(); // Clear threats on game over
                                            return;
                                        }

                                        currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
                                        updateUI();
                                        updateThreats(); // Update threat detection after move

                                        // If bot mode and it's bot's turn, make bot move
                                        if (gameMode === 'pvb' && currentPlayer === botColor && !gameOver) {
                                            botThinking = true;
                                            setTimeout(() => {
                                                makeBotMove();
                                                botThinking = false;
                                            }, 500); // Small delay to make it feel more natural
                                        }
                                    }

                                    // Check if the current move wins the game
                                    function checkWin(row, col) {
                                        const directions = [
                                        [{r: 0, c: 1}, {r: 0, c: -1}],// Horizontal
                                        [{r: 1, c: 0}, {r: -1, c: 0}],// Vertical
                                        [{r: 1, c: 1}, {r: -1, c: -1}],// Diagonal \
                                        [{r: 1, c: -1}, {r: -1, c: 1}]// Diagonal /
                                        ];

                                        const player = board[row][col];

                                        for (let [dir1, dir2] of directions) {
                                            const count1 = countStones(row, col, dir1.r, dir1.c, player);
                                            const count2 = countStones(row, col, dir2.r, dir2.c, player);
                                            const total = count1 + count2 + 1; // +1 for the current stone

                                            // Check if line is blocked on both ends
                                            const blocked1 = isBlocked(row, col, dir1.r, dir1.c, count1, player);
                                            const blocked2 = isBlocked(row, col, dir2.r, dir2.c, count2, player);
                                            const bothEndsBlocked = blocked1 && blocked2;

                                            // Apply blocked rule only if it's enabled
                                            const isValidWin = blockedRule ? !bothEndsBlocked : true;

                                            // Win with 5 or more in a row
                                            if (total >= 5 && isValidWin) {
                                                return true;
                                            }
                                        }

                                        return false;
                                    }

                                    // Find all stones that are part of threats (would create a win if one more stone is added)
                                    function findThreats() {
                                        const threats = new Set();

                                        // Check every empty position
                                        for (let row = 0; row < BOARD_SIZE; row++) {
                                            for (let col = 0; col < BOARD_SIZE; col++) {
                                                if (board[row][col] === null) {
                                                    // Check if either player can win by placing here
                                                    for (const player of ['black', 'white']) {
                                                        // Temporarily place stone
                                                        board[row][col] = player;

                                                        if (checkWin(row, col)) {
                                                            // Find the 4 existing stones that would become a winning 5
                                                            const threatStones = findThreatStones(row, col, player);
                                                            threatStones.forEach(pos => threats.add(`${pos.row},${pos.col}`));
                                                        }

                                                        // Remove temporary stone
                                                        board[row][col] = null;
                                                    }
                                                }
                                            }
                                        }

                                        return threats;
                                    }

                                    // Find the existing stones that would be part of a winning line if a stone is placed at (row, col)
                                    function findThreatStones(row, col, player) {
                                        const directions = [
                                        [{r: 0, c: 1}, {r: 0, c: -1}],// Horizontal
                                        [{r: 1, c: 0}, {r: -1, c: 0}],// Vertical
                                        [{r: 1, c: 1}, {r: -1, c: -1}],// Diagonal \
                                        [{r: 1, c: -1}, {r: -1, c: 1}]// Diagonal /
                                        ];

                                        const threatStones = [];

                                        // Temporarily place the stone
                                        board[row][col] = player;

                                        for (let [dir1, dir2] of directions) {
                                            const stones1 = getStones(row, col, dir1.r, dir1.c, player);
                                            const stones2 = getStones(row, col, dir2.r, dir2.c, player);
                                            const allStones = [...stones1, ...stones2];
                                            const total = allStones.length + 1; // +1 for the placed stone

                                            // Check if this would be a winning line
                                            const count1 = stones1.length;
                                            const count2 = stones2.length;
                                            const blocked1 = isBlocked(row, col, dir1.r, dir1.c, count1, player);
                                            const blocked2 = isBlocked(row, col, dir2.r, dir2.c, count2, player);
                                            const bothEndsBlocked = blocked1 && blocked2;
                                            const isValidWin = blockedRule ? !bothEndsBlocked : true;

                                            if (total >= 5 && isValidWin) {
                                                // Add all stones except the one we're testing
                                                allStones.forEach(stone => {
                                                    if (stone.row !== row || stone.col !== col) {
                                                        threatStones.push(stone);
                                                    }
                                                });
                                            }
                                        }

                                        // Remove the temporary stone
                                        board[row][col] = null;

                                        return threatStones;
                                    }

                                    // Get all consecutive stones in one direction (returns array of positions)
                                    function getStones(row, col, dRow, dCol, player) {
                                        const stones = [];
                                        let r = row + dRow;
                                        let c = col + dCol;

                                        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
                                            stones.push({row: r, col: c});
                                            r += dRow;
                                            c += dCol;
                                        }

                                        return stones;
                                    }

                                    // Update threat highlights on the board
                                    function updateThreats() {
                                        // Remove all existing threat classes
                                        document.querySelectorAll('.stone').forEach(stone => {
                                            stone.classList.remove('threat');
                                        });

                                        if (!threatAlert || gameOver) return;

                                        // Find and highlight threats
                                        const threats = findThreats();
                                        threats.forEach(pos => {
                                            const [row, col] = pos.split(',').map(Number);
                                            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                                            const stone = cell?.querySelector('.stone');
                                            if (stone) {
                                                stone.classList.add('threat');
                                            }
                                        });
                                    }

                                    // Bot AI - Make a move for the bot
                                    function makeBotMove() {
                                        const move = findBestMove();
                                        if (move) {
                                            makeMove(move.row, move.col, true); // Pass true to indicate this is a bot move
                                        }
                                    }

                                    // Pattern scores for position evaluation (adjusted by difficulty)
                                    const PATTERNS = {
                                        FIVE: 100000,
                                        OPEN_FOUR: 50000,// Increased - this is almost a win
                                        FOUR: 8000,// Increased
                                        OPEN_THREE: 5000,// Increased - very dangerous
                                        THREE: 1000,// Increased
                                        OPEN_TWO: 200,// Increased
                                        TWO: 80,
                                        ONE: 15
                                    };

                                    // Get difficulty multipliers
                                    function getDifficultySettings() {
                                        switch(botLevel) {
                                            case 'easy':
                                            return {
                                                searchRadius: 1,
                                                candidateCount: 10,
                                                randomness: 0.4,
                                                mistakeChance: 0.3,
                                                checkMultiThreats: false,
                                                lookAhead: 0
                                            };
                                            case 'medium':
                                            return {
                                                searchRadius: 2,
                                                candidateCount: 15,
                                                randomness: 0.2,
                                                mistakeChance: 0.15,
                                                checkMultiThreats: false,
                                                lookAhead: 1
                                            };
                                            case 'hard':
                                            return {
                                                searchRadius: 2,
                                                candidateCount: 20,
                                                randomness: 0.1,
                                                mistakeChance: 0.05,
                                                checkMultiThreats: true,
                                                lookAhead: 2
                                            };
                                            case 'expert':
                                            return {
                                                searchRadius: 3,
                                                candidateCount: 30,
                                                randomness: 0,
                                                mistakeChance: 0,
                                                checkMultiThreats: true,
                                                lookAhead: 3
                                            };
                                            default:
                                            return {
                                                searchRadius: 2,
                                                candidateCount: 15,
                                                randomness: 0.2,
                                                mistakeChance: 0.15,
                                                checkMultiThreats: false,
                                                lookAhead: 1
                                            };
                                        }
                                    }

                                    // Find the best move for the bot using advanced strategy
                                    function findBestMove() {
                                        const botPlayer = botColor;
                                        const humanPlayer = humanColor;
                                        const settings = getDifficultySettings();

                                        // 1. ALWAYS win immediately if possible (never skip this)
                                        const winMove = findWinningMove(botPlayer);
                                        if (winMove) return winMove;

                                        // 2. ALWAYS block opponent's winning move (never skip this)
                                        const blockMove = findWinningMove(humanPlayer);
                                        if (blockMove) return blockMove;

                                        // 3. For Hard/Expert: Check for double threats (VCF - Victory by Continuous Force)
                                        if (settings.checkMultiThreats) {
                                            const doubleThreatMove = findDoubleThreatMove(botPlayer);
                                            if (doubleThreatMove) return doubleThreatMove;

                                            // Block opponent's double threat attempts
                                            const blockDoubleThreat = findDoubleThreatMove(humanPlayer);
                                            if (blockDoubleThreat) return blockDoubleThreat;
                                        }

                                        // 4. For lower difficulties, check for mistakes AFTER critical moves
                                        if (Math.random() < settings.mistakeChance) {
                                            const weakMove = findWeakerMove(botPlayer, humanPlayer);
                                            if (weakMove) return weakMove;
                                        }

                                        // 5. Use evaluation function to find best move
                                        return findBestMoveByEvaluation(botPlayer, humanPlayer);
                                    }

                                    // Find a move that creates multiple winning threats (fork/double attack)
                                    function findDoubleThreatMove(player) {
                                        const candidates = [];

                                        for (let row = 0; row < BOARD_SIZE; row++) {
                                            for (let col = 0; col < BOARD_SIZE; col++) {
                                                if (board[row][col] === null) {
                                                    // Skip positions too far from action
                                                    if (!isNearStones(row, col, 3)) continue;

                                                    // Temporarily place stone
                                                    board[row][col] = player;

                                                    // Count how many winning threats this creates
                                                    let threatCount = 0;
                                                    const winningPositions = [];

                                                    for (let r = 0; r < BOARD_SIZE; r++) {
                                                        for (let c = 0; c < BOARD_SIZE; c++) {
                                                            if (board[r][c] === null) {
                                                                board[r][c] = player;
                                                                if (checkWin(r, c)) {
                                                                    threatCount++;
                                                                    winningPositions.push({r, c});
                                                                }
                                                                board[r][c] = null;

                                                                // Early exit if we found 2+ threats
                                                                if (threatCount >= 2) {
                                                                    board[row][col] = null;
                                                                    return {row, col};
                                                                }
                                                            }
                                                        }
                                                    }

                                                    // Remove temporary stone
                                                    board[row][col] = null;

                                                    if (threatCount >= 2) {
                                                        candidates.push({row, col, threatCount});
                                                    }
                                                }
                                            }
                                        }

                                        // Return move that creates most threats
                                        if (candidates.length > 0) {
                                            candidates.sort((a, b) => b.threatCount - a.threatCount);
                                            return candidates[0];
                                        }
                                        return null;
                                    }

                                    // Check if a line would be blocked on both ends (important when blocked rule is ON)
                                    function wouldBeBlocked(row, col, dRow, dCol, player, count) {
                                        if (!blockedRule) return false; // If blocked rule is OFF, doesn't matter

                                        // Check both ends
                                        const end1Row = row + dRow * (count + 1);
                                        const end1Col = col + dCol * (count + 1);
                                        const end2Row = row - dRow * (count + 1);
                                        const end2Col = col - dCol * (count + 1);

                                        const opponent = player === 'black' ? 'white' : 'black';

                                        let blocked1 = false;
                                        let blocked2 = false;

                                        // Check end 1
                                        if (end1Row >= 0 && end1Row < BOARD_SIZE && end1Col >= 0 && end1Col < BOARD_SIZE) {
                                            blocked1 = board[end1Row][end1Col] === opponent;
                                        } else {
                                            blocked1 = true; // Edge counts as blocked
                                        }

                                        // Check end 2
                                        if (end2Row >= 0 && end2Row < BOARD_SIZE && end2Col >= 0 && end2Col < BOARD_SIZE) {
                                            blocked2 = board[end2Row][end2Col] === opponent;
                                        } else {
                                            blocked2 = true; // Edge counts as blocked
                                        }

                                        return blocked1 && blocked2;
                                    }

                                    // Check if position is near existing stones
                                    function isNearStones(row, col, radius) {
                                        for (let dr = -radius; dr <= radius; dr++) {
                                            for (let dc = -radius; dc <= radius; dc++) {
                                                const r = row + dr;
                                                const c = col + dc;
                                                if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE &&
                                                board[r][c] !== null) {
                                                    return true;
                                                }
                                            }
                                        }
                                        return false;
                                    }

                                    // Find a weaker move (for mistakes at lower difficulty)
                                    function findWeakerMove(botPlayer, humanPlayer) {
                                        const settings = getDifficultySettings();
                                        const candidates = [];

                                        // Just find moves near existing stones
                                        for (let row = 0; row < BOARD_SIZE; row++) {
                                            for (let col = 0; col < BOARD_SIZE; col++) {
                                                if (board[row][col] === null) {
                                                    let nearStone = false;
                                                    for (let dr = -2; dr <= 2; dr++) {
                                                        for (let dc = -2; dc <= 2; dc++) {
                                                            const r = row + dr;
                                                            const c = col + dc;
                                                            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE &&
                                                            board[r][c] !== null) {
                                                                nearStone = true;
                                                                break;
                                                            }
                                                        }
                                                        if (nearStone) break;
                                                    }
                                                    if (nearStone) {
                                                        candidates.push({row, col});
                                                    }
                                                }
                                            }
                                        }

                                        if (candidates.length > 0) {
                                            return candidates[Math.floor(Math.random() * candidates.length)];
                                        }
                                        return null;
                                    }

                                    // Find a move that would result in an immediate win
                                    function findWinningMove(player) {
                                        const winningMoves = [];

                                        // Check every empty position on the board
                                        for (let row = 0; row < BOARD_SIZE; row++) {
                                            for (let col = 0; col < BOARD_SIZE; col++) {
                                                if (board[row][col] === null) {
                                                    // Temporarily place stone
                                                    board[row][col] = player;

                                                    // Check if this creates a win
                                                    if (checkWin(row, col)) {
                                                        winningMoves.push({row, col});
                                                    }

                                                    // Remove temporary stone
                                                    board[row][col] = null;
                                                }
                                            }
                                        }

                                        // Return first winning move found (they're all equally good)
                                        return winningMoves.length > 0 ? winningMoves[0] : null;
                                    }

                                    // Find best move using position evaluation with playing style
                                    function findBestMoveByEvaluation(botPlayer, humanPlayer) {
                                        const candidates = [];
                                        const settings = getDifficultySettings();
                                        const searchRadius = settings.searchRadius;

                                        // Find all empty positions near existing stones
                                        const emptyNearStones = new Set();

                                        for (let row = 0; row < BOARD_SIZE; row++) {
                                            for (let col = 0; col < BOARD_SIZE; col++) {
                                                if (board[row][col] !== null) {
                                                    for (let dr = -searchRadius; dr <= searchRadius; dr++) {
                                                        for (let dc = -searchRadius; dc <= searchRadius; dc++) {
                                                            const r = row + dr;
                                                            const c = col + dc;
                                                            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE &&
                                                            board[r][c] === null) {
                                                                emptyNearStones.add(`${r},${c}`);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }

                                        // If no stones on board, play center
                                        if (emptyNearStones.size === 0) {
                                            const center = Math.floor(BOARD_SIZE / 2);
                                            return {row: center, col: center};
                                        }

                                        // Evaluate each candidate
                                        emptyNearStones.forEach(pos => {
                                            const [row, col] = pos.split(',').map(Number);
                                            const score = evaluateMove(row, col, botPlayer, humanPlayer);
                                            candidates.push({row, col, score});
                                        });

                                        // Sort by score
                                        candidates.sort((a, b) => b.score - a.score);

                                        // Limit candidates based on difficulty
                                        const topCandidates = candidates.slice(0, settings.candidateCount);

                                        // Playing style affects move selection
                                        let selectedIndex = 0;

                                        if (botLevel === 'expert') {
                                            // Expert always picks the absolute best move (no randomness)
                                            return topCandidates[0];
                                        }

                                        if (botStyle === 'aggressive') {
                                            // Pick best offensive move with slight randomness
                                            selectedIndex = Math.floor(Math.random() * Math.min(2, topCandidates.length));
                                        } else if (botStyle === 'defensive') {
                                            // Consider top moves, prefer ones with good defensive score
                                            selectedIndex = Math.floor(Math.random() * Math.min(3, topCandidates.length));
                                        } else if (botStyle === 'balanced') {
                                            // Add randomness based on difficulty
                                            const randomRange = Math.ceil(5 * settings.randomness);
                                            selectedIndex = Math.floor(Math.random() * Math.min(randomRange + 1, topCandidates.length));
                                        } else if (botStyle === 'tricky') {
                                            // Sometimes picks 2nd or 3rd best move to be unpredictable
                                            selectedIndex = Math.floor(Math.random() * Math.min(4, topCandidates.length));
                                        } else if (botStyle === 'patient') {
                                            // Prefers solid, safe moves
                                            selectedIndex = Math.floor(Math.random() * Math.min(2, topCandidates.length));
                                        }

                                        return topCandidates[selectedIndex];
                                    }

                                    // Evaluate a move position
                                    function evaluateMove(row, col, botPlayer, humanPlayer) {
                                        let score = 0;

                                        // Offensive score (bot's patterns)
                                        const offensiveScore = evaluatePlayerPatterns(row, col, botPlayer);

                                        // Defensive score (blocking human's patterns)
                                        const defensiveScore = evaluatePlayerPatterns(row, col, humanPlayer);

                                        // Critical defense - heavily prioritize blocking open fours and open threes
                                        let defensiveMultiplier = 1;
                                        if (defensiveScore >= PATTERNS.OPEN_FOUR) {
                                            defensiveMultiplier = 3; // Must block open four
                                        } else if (defensiveScore >= PATTERNS.OPEN_THREE) {
                                            defensiveMultiplier = 2.5; // Must block open three
                                        } else if (defensiveScore >= PATTERNS.FOUR) {
                                            defensiveMultiplier = 2; // Should block four
                                        }

                                        // Apply style multipliers
                                        if (botStyle === 'aggressive') {
                                            score = offensiveScore * 1.5 + defensiveScore * 1.2 * defensiveMultiplier;
                                        } else if (botStyle === 'defensive') {
                                            score = offensiveScore * 0.8 + defensiveScore * 1.8 * defensiveMultiplier;
                                        } else if (botStyle === 'balanced') {
                                            score = offensiveScore + defensiveScore * defensiveMultiplier;
                                        } else if (botStyle === 'tricky') {
                                            // Values creating complex positions
                                            score = offensiveScore * 1.2 + defensiveScore * 1.1 * defensiveMultiplier;
                                            // Bonus for creating multiple threats
                                            if (offensiveScore > PATTERNS.OPEN_THREE) {
                                                score *= 1.3;
                                            }
                                        } else if (botStyle === 'patient') {
                                            // Values solid defensive moves with moderate offense
                                            score = offensiveScore * 0.9 + defensiveScore * 1.5 * defensiveMultiplier;
                                        }

                                        // Add center bias (less important than patterns)
                                        const center = Math.floor(BOARD_SIZE / 2);
                                        const distFromCenter = Math.abs(row - center) + Math.abs(col - center);
                                        score -= distFromCenter;

                                        return score;
                                    }

                                    // Evaluate patterns for a player at position
                                    function evaluatePlayerPatterns(row, col, player) {
                                        let score = 0;
                                        const directions = [
                                        [0, 1], [1, 0], [1, 1], [1, -1]
                                        ];

                                        for (const [dRow, dCol] of directions) {
                                            const pattern = analyzeDirection(row, col, dRow, dCol, player);
                                            score += getPatternScore(pattern);
                                        }

                                        return score;
                                    }

                                    // Analyze a direction and return pattern info
                                    function analyzeDirection(row, col, dRow, dCol, player) {
                                        let consecutive = 0;
                                        let openEnds = 0;
                                        let gaps = 0;

                                        // Check positive direction
                                        let r = row + dRow;
                                        let c = col + dCol;
                                        let spaces = 0;
                                        let endReached = false;

                                        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && spaces < 5) {
                                            if (board[r][c] === player) {
                                                consecutive++;
                                            } else if (board[r][c] === null) {
                                                if (consecutive > 0 && gaps === 0) {
                                                    gaps++;
                                                    spaces++;
                                                } else {
                                                    endReached = true;
                                                    break;
                                                }
                                            } else {
                                                endReached = true;
                                                break;
                                            }
                                            r += dRow;
                                            c += dCol;
                                            spaces++;
                                        }

                                        if (!endReached && r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === null) {
                                            openEnds++;
                                        }

                                        const opponent = player === 'black' ? 'white' : 'black';
                                        let blocked1 = (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE ||
                                        (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === opponent));

                                        // Check negative direction
                                        r = row - dRow;
                                        c = col - dCol;
                                        spaces = 0;
                                        endReached = false;

                                        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && spaces < 5) {
                                            if (board[r][c] === player) {
                                                consecutive++;
                                            } else if (board[r][c] === null) {
                                                if (consecutive > 0 && gaps === 0) {
                                                    gaps++;
                                                    spaces++;
                                                } else {
                                                    endReached = true;
                                                    break;
                                                }
                                            } else {
                                                endReached = true;
                                                break;
                                            }
                                            r -= dRow;
                                            c -= dCol;
                                            spaces++;
                                        }

                                        if (!endReached && r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === null) {
                                            openEnds++;
                                        }

                                        let blocked2 = (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE ||
                                        (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === opponent));

                                        // If blocked rule is ON and both ends are blocked, this pattern is worthless
                                        const bothEndsBlocked = blocked1 && blocked2;
                                        if (blockedRule && bothEndsBlocked) {
                                            openEnds = 0; // Force pattern to be worthless
                                        }

                                        return {consecutive, openEnds, gaps, bothEndsBlocked};
                                    }

                                    // Get score for a pattern
                                    function getPatternScore(pattern) {
                                        const {consecutive, openEnds, gaps, bothEndsBlocked} = pattern;
                                        const total = consecutive + 1; // +1 for the move we're evaluating

                                        // If blocked rule is ON and both ends are blocked, pattern is worthless
                                        if (blockedRule && bothEndsBlocked && total < 5) {
                                            return 0; // Can't win with this pattern
                                        }

                                        if (total >= 5) {
                                            // Even if blocked, 5+ wins (unless blocked rule prevents it)
                                            if (blockedRule && bothEndsBlocked) {
                                                return 0; // Doesn't count as win
                                            }
                                            return PATTERNS.FIVE;
                                        }

                                        if (total === 4) {
                                            if (openEnds === 2) return PATTERNS.OPEN_FOUR;
                                            if (openEnds === 1) return PATTERNS.FOUR;
                                            if (openEnds === 0) return 0; // Blocked on both ends
                                        }
                                        if (total === 3) {
                                            if (openEnds === 2) return PATTERNS.OPEN_THREE;
                                            if (openEnds === 1) return PATTERNS.THREE;
                                            if (openEnds === 0) return 0; // Blocked on both ends
                                        }
                                        if (total === 2) {
                                            if (openEnds === 2) return PATTERNS.OPEN_TWO;
                                            if (openEnds === 1) return PATTERNS.TWO;
                                            if (openEnds === 0) return 0; // Blocked on both ends
                                        }
                                        if (total === 1 && openEnds > 0) return PATTERNS.ONE;

                                        return 0;
                                    }

                                    // Count consecutive stones in one direction
                                    function countStones(row, col, dRow, dCol, player) {
                                        let count = 0;
                                        let r = row + dRow;
                                        let c = col + dCol;

                                        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
                                            count++;
                                            r += dRow;
                                            c += dCol;
                                        }

                                        return count;
                                    }

                                    // Check if the line is blocked at this end
                                    function isBlocked(row, col, dRow, dCol, count, player) {
                                        const r = row + dRow * (count + 1);
                                        const c = col + dCol * (count + 1);

                                        // If out of bounds, consider it not blocked (open end)
                                        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
                                            return false;
                                        }

                                        // If the next cell has opponent's stone, it's blocked
                                        const opponent = player === 'black' ? 'white' : 'black';
                                        return board[r][c] === opponent;
                                    }

                                    // Check if board is full
                                    function isBoardFull() {
                                        for (let row = 0; row < BOARD_SIZE; row++) {
                                            for (let col = 0; col < BOARD_SIZE; col++) {
                                                if (board[row][col] === null) return false;
                                            }
                                        }
                                        return true;
                                    }

                                    // Update UI elements
                                    function updateUI() {
                                        const indicator = document.getElementById('playerIndicator');
                                        const text = document.getElementById('playerText');

                                        indicator.className = `player-indicator ${currentPlayer}`;

                                        if (gameMode === 'pvb') {
                                            if (currentPlayer === botColor) {
                                                text.textContent = `Bot's Turn (${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)})`;
                                            } else {
                                                text.textContent = `Your Turn (${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)})`;
                                            }
                                        } else {
                                            text.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`;
                                        }

                                        if (!gameOver) {
                                            document.getElementById('message').textContent = '';
                                            document.getElementById('message').classList.remove('win-message');
                                        }
                                    }

                                    // Toggle blocked rule
                                    function toggleBlockedRule() {
                                        blockedRule = !blockedRule;
                                        const btn = document.getElementById('blockedRuleBtn');
                                        const info = document.getElementById('variantInfo');

                                        btn.innerHTML = blockedRule
                                        ? '<span class="rule-icon">🚫</span><span class="rule-text">Blocked Rule: <strong>ON</strong></span>'
                                        : '<span class="rule-icon">✅</span><span class="rule-text">Blocked Rule: <strong>OFF</strong></span>';

                                        info.textContent = blockedRule ? 'Blocked lines don\'t count as wins' : 'Blocked lines can win';

                                        // Update threats when blocked rule changes
                                        updateThreats();

                                        // If it's bot's turn and game is in progress, bot should reconsider
                                        if (gameMode === 'pvb' && currentPlayer === botColor && !gameOver && !botThinking) {
                                            // Bot reconsidering due to rule change
                                        }
                                    }

                                    // Toggle threat alert
                                    function toggleThreatAlert() {
                                        threatAlert = !threatAlert;
                                        const btn = document.getElementById('threatAlertBtn');

                                        btn.innerHTML = threatAlert
                                        ? '<span class="rule-icon">⚠️</span><span class="rule-text">Threat Alert: <strong>ON</strong></span>'
                                        : '<span class="rule-icon">🔕</span><span class="rule-text">Threat Alert: <strong>OFF</strong></span>';

                                        // Update threat display
                                        updateThreats();
                                    }

                                    // Bead customization
                                    let currentBeadSet = 'classic';
                                    // Board customization
                                    let currentBoardStyle = 'classic';

                                    // Theme presets
                                    // Set bead set programmatically (without event)
                                    function setBeadSetProgrammatic(setName) {
                                        currentBeadSet = setName;

                                        // Update active button
                                        document.querySelectorAll('.bead-set-btn').forEach(btn => {
                                            btn.classList.remove('active');
                                            if (btn.getAttribute('data-set') === setName) {
                                                btn.classList.add('active');
                                            }
                                        });

                                        // Apply bead set to all existing stones
                                        applyBeadSet();

                                        // Update all hover shadows
                                        updateAllHoverShadows();
                                    }

                                    // Set board style programmatically (without event)
                                    function setBoardStyleProgrammatic(style) {
                                        currentBoardStyle = style;
                                        const board = document.querySelector('.board');

                                        // Remove all board style classes (but keep the base 'board' class)
                                        const boardStyleClasses = ['classic', 'dark', 'bamboo', 'marble', 'stone', 'neon', 'glass', 'metal', 'space', 'paper', 'cherry', 'crystal'];
                                        boardStyleClasses.forEach(styleClass => {
                                            board.classList.remove(`board-${styleClass}`);
                                        });

                                        // Add new board style class
                                        board.classList.add(`board-${style}`);

                                        // Update active button
                                        document.querySelectorAll('.board-style-btn').forEach(btn => {
                                            btn.classList.remove('active');
                                            if (btn.getAttribute('data-style') === style) {
                                                btn.classList.add('active');
                                            }
                                        });
                                    }

                                    // Set board style
                                    function setBoardStyle(style, btnElement) {
                                        currentBoardStyle = style;
                                        const board = document.querySelector('.board');

                                        // Remove all board style classes (but keep the base 'board' class)
                                        const boardStyleClasses = ['classic', 'dark', 'bamboo', 'marble', 'stone', 'neon', 'glass', 'metal', 'space', 'paper', 'cherry', 'crystal'];
                                        boardStyleClasses.forEach(styleClass => {
                                            board.classList.remove(`board-${styleClass}`);
                                        });

                                        // Add new board style class
                                        board.classList.add(`board-${style}`);

                                        // Update active button
                                        document.querySelectorAll('.board-style-btn').forEach(btn => {
                                            btn.classList.remove('active');
                                        });
                                        if (btnElement) {
                                            btnElement.classList.add('active');
                                        }

                                        // Reapply bead set to maintain crystal shapes if using crystal stones
                                        if (currentBeadSet === 'crystal') {
                                            applyBeadSet();
                                        }
                                    }

                                    // Set bead set
                                    function setBeadSet(setName, btnElement) {
                                        currentBeadSet = setName;

                                        // Update active button
                                        document.querySelectorAll('.bead-set-btn').forEach(btn => {
                                            btn.classList.remove('active');
                                        });
                                        if (btnElement) {
                                            btnElement.classList.add('active');
                                        }

                                        // Apply bead set to all existing stones
                                        applyBeadSet();

                                        // Update all hover shadows
                                        updateAllHoverShadows();
                                    }

                                    function applyBeadSet() {
                                        document.querySelectorAll('.stone').forEach(stone => {
                                            // Remove all bead set classes
                                            stone.className = stone.className.replace(/stone-(classic|flat|neon|marble|glossy|glass|crystal|metal|gem|plasma|space|paper|wood|ceramic)/g, '');

                                            // Add new bead set class
                                            stone.classList.add(`stone-${currentBeadSet}`);

                                            // Apply random crystal shape if switching to crystal
                                            if (currentBeadSet === 'crystal') {
                                                const randomShape = generateRandomCrystalShape();
                                                stone.style.clipPath = randomShape;
                                            } else {
                                                // Clear clip-path for non-crystal styles
                                                stone.style.clipPath = '';
                                            }
                                        });
                                    }

                                    // Update all hover shadows to match current bead set
                                    function updateAllHoverShadows() {
                                        document.querySelectorAll('.hover-shadow').forEach(shadow => {
                                            // Remove all shadow style classes
                                            shadow.className = shadow.className.replace(/shadow-(classic|flat|neon|marble|glossy|glass|crystal|metal|gem|plasma|space|paper|wood|ceramic)/g, '');

                                            // Preserve black/white class and add new shadow style
                                            const colorClass = shadow.classList.contains('black') ? 'black' : (shadow.classList.contains('white') ? 'white' : '');
                                            shadow.className = `hover-shadow ${colorClass} shadow-${currentBeadSet}`.trim();
                                        });
                                    }

                                    // Generate random crystal shape with irregular facets
                                    function generateRandomCrystalShape() {
                                        const numPoints = 12; // 12-point polygon for crystal
                                        const points = [];

                                        // Generate random points around a circle with variation
                                        for (let i = 0; i < numPoints; i++) {
                                            const angle = (i / numPoints) * 2 * Math.PI; // Full circle in radians
                                            const radiusVariation = 35 + Math.random() * 30; // Random radius between 35-65%
                                            const angleVariation = angle + (Math.random() - 0.5) * 0.3; // Small angle variation in radians

                                            // Convert to percentage coordinates
                                            const x = 50 + radiusVariation * Math.cos(angleVariation);
                                            const y = 50 + radiusVariation * Math.sin(angleVariation);

                                            points.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
                                        }

                                        return `polygon(${points.join(', ')})`;
                                    }

                                    // Update custom colors
                                    // Toggle settings panel
                                    function toggleSettings() {
                                        const panel = document.getElementById('settingsPanel');
                                        if (panel.style.display === 'none') {
                                            panel.style.display = 'block';
                                        } else {
                                            panel.style.display = 'none';
                                        }
                                    }

                                    // Set theme
                                    let currentTheme = 'midnight';

                                    // Toggle game mode
                                    function toggleGameMode() {
                                        gameMode = gameMode === 'pvp' ? 'pvb' : 'pvp';
                                        const btn = document.getElementById('gameModeBtn');
                                        const botSettingsSection = document.getElementById('botSettingsSection');

                                        if (gameMode === 'pvb') {
                                            btn.innerHTML = '<span class="mode-icon">🤖</span><span class="mode-text">Player vs Bot</span>';
                                            botSettingsSection.style.display = 'block';
                                            firstBotGame = true;
                                        } else {
                                            btn.innerHTML = '<span class="mode-icon">👥</span><span class="mode-text">Player vs Player</span>';
                                            botSettingsSection.style.display = 'none';
                                        }

                                        // Reset game when toggling game mode
                                        resetGame();
                                    }

                                    // Update bot settings from UI
                                    function updateBotSettings() {
                                        botLevel = document.getElementById('botLevel').value;
                                        botStylePreference = document.getElementById('botStyleSelect').value;
                                    }
                                }

                                // Reset the game
                                function resetGame() {
                                    initGame();
                                }

                                // Start the game
                                initGame();
                            </script>

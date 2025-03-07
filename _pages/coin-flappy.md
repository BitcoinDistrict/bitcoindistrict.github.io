---
title: Crypto Flappy Game
layout: single
permalink: /flappy/
body_class: coin-flappy-page 
description: "Name your coin and press space bar to avoid hitting the walls."
---

<style>
    .coin-flappy-page body {
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background: #1a1a1a;
        font-family: Arial, sans-serif;
    }
    .coin-flappy-page #startScreen, #gameOverScreen {
        text-align: center;
        color: #fff;
        background: rgba(0, 0, 0, 0.8);
        padding: 20px;
        border-radius: 10px;
    }
    .coin-flappy-page #gameCanvas {
        display: none;
        background: #111;
        border: 2px solid #333;
    }
    .coin-flappy-page input, button {
        margin: 10px;
        padding: 8px 15px;
        font-size: 16px;
        background: #333;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
    .coin-flappy-page input {
        background: #222;
        border: 1px solid #444;
        padding: 8px;
    }
    .coin-flappy-page button:hover {
        background: #555;
    }
    .coin-flappy-page #pumpButton {
        position: fixed;
        right: 20px;
        bottom: 20px;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: #4caf50;
        border: none;
        color: white;
        font-size: 16px;
        display: none;
        z-index: 100;
    }
    .coin-flappy-page #pumpButton:active {
        background: #388e3c;
    }
</style>

<body>
    <div id="startScreen">
        <h3>Name Your Token</h3>
        <input type="text" id="tokenName" placeholder="e.g. MoonCoin">
        <button id="startButton">Start Trading</button>
    </div>
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <button id="pumpButton">PUMP</button>
    <div id="gameOverScreen" style="display:none;">
        <h3>Market Crash!</h3>
        <p id="gameOverMessage"></p>
        <button id="restartButton">Try Again</button>
    </div>
    <script>
        // DOM Elements
        const startScreen = document.getElementById('startScreen');
        const tokenNameInput = document.getElementById('tokenName');
        const startButton = document.getElementById('startButton');
        const gameCanvas = document.getElementById('gameCanvas');
        const gameOverScreen = document.getElementById('gameOverScreen');
        const gameOverMessage = document.getElementById('gameOverMessage');
        const restartButton = document.getElementById('restartButton');
        const ctx = gameCanvas.getContext('2d');
        const pumpButton = document.getElementById('pumpButton');

        // Game Constants
        const GRAVITY = 0.6;
        const JUMP_STRENGTH = 12;
        const SCROLL_SPEED = 2.5;
        const CANDLE_WIDTH = 8; // Width of candles - reduced for denser display
        const CANDLE_SPACING = 0; // No space between candles
        const PRICE_X = 200; // Fixed canvas x-position for current price
        const OBSTACLE_SPACING = 300;
        const GAP_HEIGHT = 200;
        const OBSTACLE_WIDTH = 50;

        // Game State
        let tokenName = '';
        let gameState = 'start';
        let scrollPosition = 0;
        let priceY = 300; // Starting in middle of canvas
        let velocity = 0;
        let obstacles = [];
        let score = 0;
        let priceHistory = [];
        let candles = [];
        let lastCandleX = 0;
        let currentCandleData = {
            open: 300,
            high: 300,
            low: 300,
            close: 300,
            x: 0
        };
        let timeInCurrentCandle = 0;
        let candleTimeFrame = 8; // Frames per candle - significantly reduced for much denser chart

        // Market Events
        const marketEvents = [
            'Perps liquidated', 'Elon tweet', 'CEX listing', 'DeFi hack',
            'Regulatory crackdown', 'Whale dumping', 'Flash crash', 'Meme coin pump',
            'Celebrity endorsement', 'Major exchange hack', 'Protocol upgrade',
            'Rug pull', 'FOMO buying', 'ETF approval', 'Liquidity crisis'
        ];

        // Start or Restart Game
        function startGame() {
            tokenName = tokenNameInput.value.trim() || 'UnnamedToken';
            startScreen.style.display = 'none';
            gameCanvas.style.display = 'block';
            gameOverScreen.style.display = 'none';
            pumpButton.style.display = 'block';

            // Reset variables
            scrollPosition = 0;
            priceY = gameCanvas.height / 2;
            velocity = 0;
            obstacles = [];
            score = 0;
            priceHistory = [];
            candles = [];
            lastCandleX = 0;
            currentCandleData = {
                open: priceY,
                high: priceY,
                low: priceY,
                close: priceY,
                x: PRICE_X
            };
            timeInCurrentCandle = 0;
            gameState = 'playing';

            // Initial obstacle
            generateObstacle(scrollPosition + 500);
            requestAnimationFrame(gameLoop);
        }

        // Main Game Loop
        function gameLoop() {
            if (gameState === 'playing') {
                update();
                draw();
                requestAnimationFrame(gameLoop);
            }
        }

        // Update Game State
        function update() {
            scrollPosition += SCROLL_SPEED;
            velocity += GRAVITY;
            priceY += velocity;

            // Record price history
            priceHistory.push({ x: scrollPosition + PRICE_X, y: priceY });
            while (priceHistory.length > 0 && priceHistory[0].x < scrollPosition - gameCanvas.width) {
                priceHistory.shift();
            }

            // Update current candle
            currentCandleData.high = Math.min(currentCandleData.high, priceY);
            currentCandleData.low = Math.max(currentCandleData.low, priceY);
            currentCandleData.close = priceY;
            timeInCurrentCandle++;

            // Generate new candle when time frame is reached
            if (timeInCurrentCandle >= candleTimeFrame) {
                // Save current candle
                candles.push({...currentCandleData});

                // Start new candle
                const newX = scrollPosition + PRICE_X;
                currentCandleData = {
                    open: priceY,
                    high: priceY,
                    low: priceY,
                    close: priceY,
                    x: newX
                };
                timeInCurrentCandle = 0;

                // Ensure old candles are moved so they appear right next to each other
                if (candles.length > 1) {
                    const lastTwoCandles = candles.slice(-2);
                    // Set position of previous candle to be exactly CANDLE_WIDTH away from current
                    lastTwoCandles[0].x = lastTwoCandles[1].x - CANDLE_WIDTH;
                }
            }

            // Keep more candles on screen for a denser chart
            candles = candles.filter(c => c.x > scrollPosition - gameCanvas.width * 1.5);

            // Generate obstacles
            if (!obstacles.length || obstacles[obstacles.length - 1].x < scrollPosition + gameCanvas.width - 100) {
                generateObstacle(obstacles[obstacles.length - 1]?.x + OBSTACLE_SPACING || scrollPosition + 500);
            }

            // Clean up off-screen obstacles
            obstacles = obstacles.filter(ob => ob.x > scrollPosition - OBSTACLE_WIDTH);

            // Collision and scoring
            obstacles.forEach(ob => {
                const obCanvasX = ob.x - scrollPosition;
                if (obCanvasX - OBSTACLE_WIDTH / 2 < PRICE_X && obCanvasX + OBSTACLE_WIDTH / 2 > PRICE_X) {
                    if (priceY < ob.gapTop || priceY > ob.gapBottom) {
                        gameOver();
                    }
                }
                if (obCanvasX + OBSTACLE_WIDTH / 2 < PRICE_X && !ob.passed) {
                    ob.passed = true;
                    score++;
                }
            });

            // Boundary check
            if (priceY < 0 || priceY > gameCanvas.height) {
                gameOver();
            }
        }

        // Generate Obstacle
        function generateObstacle(x) {
            const gapCenter = GAP_HEIGHT / 2 + Math.random() * (gameCanvas.height - GAP_HEIGHT);
            const event = marketEvents[Math.floor(Math.random() * marketEvents.length)];
            obstacles.push({
                x: x,
                gapTop: gapCenter - GAP_HEIGHT / 2,
                gapBottom: gapCenter + GAP_HEIGHT / 2,
                event: event,
                passed: false
            });
        }

        // Draw Everything
        function draw() {
            ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

            // Draw dark background
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

            // Grid lines
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 1;
            for (let y = 0; y < gameCanvas.height; y += 50) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(gameCanvas.width, y);
                ctx.stroke();
            }
            for (let x = Math.floor(scrollPosition / 100) * 100; x < scrollPosition + gameCanvas.width; x += 100) {
                const canvasX = x - scrollPosition;
                ctx.beginPath();
                ctx.moveTo(canvasX, 0);
                ctx.lineTo(canvasX, gameCanvas.height);
                ctx.stroke();
            }

            // Draw candles
            candles.forEach(candle => {
                const canvasX = candle.x - scrollPosition;
                if (canvasX > -CANDLE_WIDTH && canvasX < gameCanvas.width) {
                    const isGreen = candle.close < candle.open;
                    const color = isGreen ? '#4caf50' : '#f44336';

                    // Draw wick (high to low)
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 1; // Thinner wicks for cleaner appearance
                    ctx.beginPath();
                    ctx.moveTo(canvasX, candle.high);
                    ctx.lineTo(canvasX, candle.low);
                    ctx.stroke();

                    // Draw body (open to close)
                    ctx.fillStyle = color;
                    const top = Math.min(candle.open, candle.close);
                    const bottom = Math.max(candle.open, candle.close);
                    const height = Math.max(bottom - top, 1); // Ensure minimum height
                    ctx.fillRect(canvasX - CANDLE_WIDTH/2, top, CANDLE_WIDTH, height);
                }
            });

            // Draw current forming candle
            const isCurrentGreen = currentCandleData.close < currentCandleData.open;
            const currentColor = isCurrentGreen ? '#4caf50' : '#f44336';

            // Draw wick for current candle
            ctx.strokeStyle = currentColor;
            ctx.lineWidth = 1; // Thinner wick for current candle to match others
            ctx.beginPath();
            ctx.moveTo(PRICE_X, currentCandleData.high);
            ctx.lineTo(PRICE_X, currentCandleData.low);
            ctx.stroke();

            // Draw body for current candle
            ctx.fillStyle = currentColor;
            const currentTop = Math.min(currentCandleData.open, currentCandleData.close);
            const currentBottom = Math.max(currentCandleData.open, currentCandleData.close);
            const currentHeight = Math.max(currentBottom - currentTop, 1);
            ctx.fillRect(PRICE_X - CANDLE_WIDTH/2, currentTop, CANDLE_WIDTH, currentHeight);

            // Draw price indicator
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(PRICE_X, priceY, 3, 0, 2 * Math.PI);
            ctx.fill();

            // Draw horizontal price line (current price line)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.setLineDash([5, 3]);
            ctx.beginPath();
            ctx.moveTo(0, priceY);
            ctx.lineTo(gameCanvas.width, priceY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Obstacles
            ctx.fillStyle = 'rgba(85, 85, 85, 0.7)';
            obstacles.forEach(ob => {
                const x = ob.x - scrollPosition;

                // Draw top obstacle
                ctx.fillRect(x - OBSTACLE_WIDTH / 2, 0, OBSTACLE_WIDTH, ob.gapTop);

                // Draw bottom obstacle
                ctx.fillRect(x - OBSTACLE_WIDTH / 2, ob.gapBottom, OBSTACLE_WIDTH, gameCanvas.height - ob.gapBottom);

                // Draw event text
                ctx.fillStyle = '#fff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(ob.event, x, ob.gapTop - 10);

                // Reset fill style for next obstacles
                ctx.fillStyle = 'rgba(85, 85, 85, 0.7)';
            });

            // Score and token info
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'left';
            ctx.font = 'bold 20px Arial';
            ctx.fillText(`${tokenName}: $${(100 + score * 10).toFixed(2)}`, 10, 30);

            // Instructions
            ctx.font = '14px Arial';
            ctx.fillText('Press SPACE to pump', 10, gameCanvas.height - 20);

            // Candle timeframe indicator
            ctx.textAlign = 'right';
            ctx.fillText(`1m`, gameCanvas.width - 10, gameCanvas.height - 20);
        }

        // Game Over
        function gameOver() {
            gameState = 'gameover';
            gameCanvas.style.display = 'none';
            pumpButton.style.display = 'none';
            gameOverScreen.style.display = 'block';
            const finalPrice = 100 + score * 10; // Match the in-game calculation
            gameOverMessage.textContent = `Your token ${tokenName} has crashed to zero! Final Price: $${finalPrice.toFixed(2)}`;
        }

        // Event Listeners
        startButton.addEventListener('click', startGame);
        restartButton.addEventListener('click', startGame);
        
        // Fix the pump button functionality - add both touch and click handlers
        pumpButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (gameState === 'playing') {
                velocity = -JUMP_STRENGTH;
            }
        });
        
        // Add regular click event for desktop users
        pumpButton.addEventListener('click', (e) => {
            if (gameState === 'playing') {
                velocity = -JUMP_STRENGTH;
            }
        });
        
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && gameState === 'playing') {
                e.preventDefault();
                velocity = -JUMP_STRENGTH;
            } else if (e.code === 'Space' && gameState === 'start') {
                e.preventDefault();
                startGame();
            } else if (e.code === 'Space' && gameState === 'gameover') {
                e.preventDefault();
                startGame();
            }
        });
    </script>
</body>

[There is no second best...](/coin-selector)
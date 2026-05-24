/* ==========================================================================
   Super Owen - Core Game Engine & Physics Coordinator
   ========================================================================== */

const Game = {
    canvas: null,
    ctx: null,
    
    // Core game state variables
    gameState: 'menu', // menu, character_select, playing, paused, gameover, victory
    selectedHero: 'driver', // cowboy, astronaut, driver
    score: 0,
    coins: 0,
    levelIndex: 1,
    isCustomLevel: false,
    
    // Level layout grids
    levelGrid: [],
    levelWidth: 0,
    levelHeight: 0,
    cellSize: 32,
    scrollX: 0,
    scrollY: 0,
    
    // Player object physics
    player: {
        x: 100,
        y: 100,
        vx: 0,
        vy: 0,
        w: 24,
        h: 24,
        isGrounded: false,
        facingRight: true,
        isInvincible: false,
        invincibilityTimer: 0,
        powerState: 'normal', // normal, super
        walkFrame: 0,
        isPipeTransition: false,
        pipeTransitionTimer: 0
    },

    // Game objects arrays
    enemies: [],
    bullets: [],
    particles: [],
    blocks: {}, // Dynamic block states (e.g. hit question blocks, broken bricks)
    cannons: [],
    powerups: [],
    spears: [],
    boss: null,
    warpCooldown: 0,
    
    // Keyboard inputs state
    keys: {},
    prevKeys: {},

    
    // Pre-coded campaign level layouts (Sketched in strings matching your reference images!)
    // Legend:
    // . = Empty space
    // S = Solid ground
    // ? = Coin question block
    // K = Power-up Key question block
    // B = Breakable Brick block
    // R = Red Cross Girder platform
    // P = Golden Pyramid block
    // T = Pipe Top (2x1 grid top)
    // t = Pipe Body (vertical shaft)
    // C = Coin
    // L = Boiling Lava (orange hazard)
    // W = Poison Acid (purple hazard)
    // X = Spike Trap
    // O = Spinning Saw Blade
    // M = Walking Green Bomb Enemy
    // p = Pipe Chomper / Piranha Plant
    // c = Bullet Bill Cannon
    // g = Escape Goal Boat
    // E = Crown Spear Boss
    // 1 = Spawn player
    // 2/3 = Warp Pipe A pair (connects!)
    // 4/5 = Warp Pipe B pair (connects!)
    campaignLevels: {
        1: [
            "................................................................................................................................................................",
            "................................................................................................................................................................",
            "................................................................................................................................................................",
            "................................................................................................................................................................",
            "................................................................................................................................................................",
            "................................................................................................................................................................",
            "......................................................................................................................................................................",
            "................................................................................................................................................................",
            "................................................................................................................................................................",
            "....C...C....C............................C.C.C..........................................C...C...C................C.C.C.........................................",
            ".....C.C..C.C..............................C.C............................................C.C.C.C..................C.C................................................",
            "......C....C.................?B?............C..............................................C...C....................C...............T.................................",
            "....1....M.........S.SKS.............M......T........S.S.S....M.........M..........M.......................M.....................SSSt............M...........g........",
            "...................SSSSS.F........M.........t........SSSSF....t.................F................................................SSSt..........................SSSSSSS",
            "SSSSSSSSSSSSSSSSSSSSSSSSSSSLLSSSSSSSSSSSSSSStSSSSSSSSSSSSSSSSStSSSSSSSSSSSSSSSSSSSSLLSSSSSSSSSSSSSSSSSSSSSSSSSSLLSSSSSSSSSSSSStSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS"
        ],
        2: [
            "................................................................................................................................................................",
            "................................................................................................................................................................",
            "................................................................................................................................................................",
            ".......................................O...............................O..........................................................................................",
            "......................................SSS.............................SSS.........................................................................................",
            ".......BKB..........................................c.......................................c........................O............................................",
            "......C...C.......c................................SSS.....................................SSS......................SSS...........................................",
            "......C...C......SSS...............?B?............................................................................................................................",
            "................................................C.C...........C...C...................................................C.C.........................................",
            ".........................?B?....................C.C............C.C....................?B?.............................C.C.........................................",
            "...............X................................................C........................................?B?......................................................",
            "............S.S.S...................5....................T.......................M...............T...................................T............................",
            "....1.......S.S.S...............4...S........O...........t........S...........X............O.....t.........M..........C.C.C.C........t.........M.........g........",
            "....S..WW...SSSSS...WW...M......WW..S.......SSS...WW.....t...WW...S....WW...S.S.S...WW....FSS....t...WW...............C.C.C.C........t..................SSS.......",
            "SSSSSSWWWWSSSSSSSSSWWWWSSSSSSSSTTWWWSWWWWSSSSSSSSWWWWSSSStWWWWWWWWSWWWWWWWWSSSSSSSSTTWWWWWWWWWWWStWWWWWWWWWWSSSSSSSSSSSSSSSSSSSSSSSSStSSSSSSSSSSSSSSSSSSSSSSSSSSSS"
        ],
        3: [
            "................................................................................................................................................................",
            "................................................................................................................................................................",
            "................................................................................................................................................................",
            "..................................................C.C........................C...C..............................................................................",
            ".................................................C...C........................C.C...............................................................................",
            "........BKB.....................................C.....C........................C................................................................................",
            ".......C...C....................................................................................................................................................",
            ".......C...C.................P.............E.............P......................................................................................................",
            "............................PPP.........................PPP.....................................................................................................",
            "....................T......PPPPP.......................PPPPP....................................................................................................",
            "....1...............t.....PPPPPPP.....................PPPPPPP..............C...C................................................................................",
            "....S.......M.......t....PPPPPPPPP...................PPPPPPPPP............C.....C........................g......................................................",
            "....S..LL..SSS..LL..t...PPPPPPPPPPP.................PPPPPPPPPPP..........C.......C......................SSS.....................................................",
            "SSSSSSSLLSSSSSSSLLLLtSSPPPPPPPPPPPPPSSSSSSSSSSSSSSSPPPPPPPPPPPPPSSSSSSSSSLLLLLLLLLSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS",
            "SSSSSSSLLSSSSSSSLLLLtSSPPPPPPPPPPPPPSSSSSSSSSSSSSSSPPPPPPPPPPPPPSSSSSSSSSLLLLLLLLLSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS"
        ]
    },

    /**
     * Bootstraps the application, binds DOM elements, and loads the landing screen.
     */
    init() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.bindEvents();
        
        // Draw cute floating Owen on the main menu
        const menuCanvas = document.getElementById('menu-char-canvas');
        if (menuCanvas) {
            const mCtx = menuCanvas.getContext('2d');
            let frame = 0;
            setInterval(() => {
                mCtx.clearRect(0, 0, 120, 120);
                drawOwen(mCtx, 40, 40, 40, 40, true, frame++, true);
            }, 60);
        }
        
        // Character selector canvas preview drawers
        this.drawSelectorPreviews();
    },

    /**
     * Draws small idle characters on the selection cards.
     */
    drawSelectorPreviews() {
        const cowboyCanvas = document.getElementById('char-cowboy-canvas');
        const astronautCanvas = document.getElementById('char-astronaut-canvas');
        const driverCanvas = document.getElementById('char-driver-canvas');
        const princessCanvas = document.getElementById('char-princess-canvas');
        const ninjaCanvas = document.getElementById('char-ninja-canvas');
        const foxCanvas = document.getElementById('char-fox-canvas');
        const gorillaCanvas = document.getElementById('char-gorilla-canvas');
        
        if (cowboyCanvas && astronautCanvas && driverCanvas) {
            const cCtx = cowboyCanvas.getContext('2d');
            const aCtx = astronautCanvas.getContext('2d');
            const dCtx = driverCanvas.getContext('2d');
            const pCtx = princessCanvas ? princessCanvas.getContext('2d') : null;
            const nCtx = ninjaCanvas ? ninjaCanvas.getContext('2d') : null;
            const fCtx = foxCanvas ? foxCanvas.getContext('2d') : null;
            const gCtx = gorillaCanvas ? gorillaCanvas.getContext('2d') : null;
            
            let frame = 0;
            setInterval(() => {
                cCtx.clearRect(0, 0, 140, 140);
                aCtx.clearRect(0, 0, 140, 140);
                dCtx.clearRect(0, 0, 140, 140);
                if (pCtx) pCtx.clearRect(0, 0, 140, 140);
                if (nCtx) nCtx.clearRect(0, 0, 140, 140);
                if (fCtx) fCtx.clearRect(0, 0, 140, 140);
                if (gCtx) gCtx.clearRect(0, 0, 140, 140);
                
                drawCowboy(cCtx, 40, 40, 60, 60, false, 0, true);
                drawAstronaut(aCtx, 40, 40, 60, 60, false, 0, true);
                drawDriver(dCtx, 40, 40, 60, 60, false, 0, true);
                if (pCtx) drawPrincess(pCtx, 40, 40, 60, 60, false, 0, true);
                if (nCtx) drawNinja(nCtx, 40, 40, 60, 60, false, 0, true);
                if (fCtx) drawFox(fCtx, 40, 40, 60, 60, false, 0, true);
                if (gCtx) drawGorilla(gCtx, 40, 40, 60, 60, false, 0, true);
            }, 100);
        }
    },

    /**
     * Sets up UI button clicks and key binders.
     */
    bindEvents() {
        // Keyboard inputs
        window.addEventListener('keydown', e => {
            this.keys[e.key] = true;
            this.keys[e.code] = true;
            
            // Fast pause triggers
            if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
                if (this.gameState === 'playing') this.pauseGame();
                else if (this.gameState === 'paused') this.resumeGame();
            }
        });
        window.addEventListener('keyup', e => {
            this.keys[e.key] = false;
            this.keys[e.code] = false;
        });

        // Navigation actions
        document.getElementById('btn-campaign').addEventListener('click', () => {
            this.showScreen('level-select-screen');
        });
        document.getElementById('btn-level-editor').addEventListener('click', () => {
            this.showScreen('level-editor-screen');
            LevelEditor.init();
        });
        document.getElementById('btn-select-character').addEventListener('click', () => {
            this.showScreen('character-select-screen');
        });
        document.getElementById('btn-how-to-play').addEventListener('click', () => {
            this.showScreen('how-to-play-screen');
        });

        // Go Back buttons
        document.querySelectorAll('.btn-back').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showScreen(btn.getAttribute('data-target'));
            });
        });

        // Character confirmation
        const cards = document.querySelectorAll('.char-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                cards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.selectedHero = card.getAttribute('data-character');
            });
        });

        document.getElementById('btn-confirm-character').addEventListener('click', () => {
            this.showScreen('main-menu-screen');
        });

        // Start Level button actions
        document.querySelectorAll('.level-card').forEach(card => {
            card.querySelector('.btn-start-level').addEventListener('click', e => {
                e.stopPropagation();
                const lvl = parseInt(card.getAttribute('data-level'));
                this.startCampaignLevel(lvl);
            });
        });

        // Audio controls
        const muteBtns = [document.getElementById('btn-toggle-global-sound'), document.getElementById('btn-game-sound')];
        const musicBtns = [document.getElementById('btn-toggle-global-music'), document.getElementById('btn-game-music')];

        muteBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const isMuted = AudioEngine.toggleSound();
                muteBtns.forEach(b => b.innerHTML = isMuted ? '<i class="fa-solid fa-volume-mute"></i>' : '<i class="fa-solid fa-volume-up"></i>');
                AudioEngine.playSFX('coin');
            });
        });

        musicBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const isMuted = AudioEngine.toggleMusic();
                musicBtns.forEach(b => b.innerHTML = isMuted ? '<i class="fa-solid fa-music-slash"></i>' : '<i class="fa-solid fa-music"></i>');
                if (isMuted) AudioEngine.stopMusic();
                else AudioEngine.startMusic();
            });
        });

        // Game Over & Pause Overlays binders
        document.getElementById('btn-game-pause').addEventListener('click', () => this.pauseGame());
        document.getElementById('btn-resume-game').addEventListener('click', () => this.resumeGame());
        document.getElementById('btn-restart-level').addEventListener('click', () => this.restartCurrentLevel());
        document.getElementById('btn-pause-exit').addEventListener('click', () => this.exitToMenu());
        document.getElementById('btn-retry-level').addEventListener('click', () => this.restartCurrentLevel());
        document.getElementById('btn-gameover-exit').addEventListener('click', () => this.exitToMenu());
        document.getElementById('btn-next-level').addEventListener('click', () => this.startNextLevel());
        document.getElementById('btn-victory-exit').addEventListener('click', () => this.exitToMenu());
        document.getElementById('btn-game-exit').addEventListener('click', () => this.exitToMenu());

        // Level Editor testing hooks
        document.getElementById('btn-editor-play').addEventListener('click', () => {
            const levelData = LevelEditor.exportLevelData();
            if (levelData) {
                localStorage.setItem('super_owen_custom_level', levelData);
                this.startCustomLevel(levelData);
            }
        });
        document.getElementById('btn-editor-save').addEventListener('click', () => {
            const data = LevelEditor.exportLevelData();
            localStorage.setItem('super_owen_custom_level', data);
            document.getElementById('dialog-title').innerText = "Level Saved";
            document.getElementById('dialog-prompt').innerText = "Copy this code to share with friends:";
            document.getElementById('dialog-textarea').value = data;
            document.getElementById('dialog-textarea').style.display = "block";
            document.getElementById('dialog-import-container').style.display = "none";
            document.getElementById('btn-dialog-copy').style.display = "inline-flex";
            document.getElementById('btn-dialog-confirm').style.display = "none";
            document.getElementById('editor-dialog').style.display = "flex";
        });
        document.getElementById('btn-editor-load').addEventListener('click', () => {
            document.getElementById('dialog-title').innerText = "Import Level";
            document.getElementById('dialog-prompt').innerText = "Paste your custom level code below:";
            document.getElementById('dialog-textarea').style.display = "none";
            document.getElementById('dialog-import-container').style.display = "block";
            document.getElementById('btn-dialog-copy').style.display = "none";
            document.getElementById('btn-dialog-confirm').style.display = "inline-flex";
            document.getElementById('editor-dialog').style.display = "flex";
        });
        document.getElementById('btn-editor-clear').addEventListener('click', () => {
            if (confirm("Are you sure you want to wipe the level canvas?")) {
                LevelEditor.resetGrid();
            }
        });
        document.getElementById('btn-editor-exit').addEventListener('click', () => {
            this.showScreen('main-menu-screen');
        });

        // Modals listeners
        document.getElementById('btn-dialog-close').addEventListener('click', () => {
            document.getElementById('editor-dialog').style.display = "none";
        });
        document.getElementById('btn-dialog-copy').addEventListener('click', () => {
            const txt = document.getElementById('dialog-textarea');
            txt.select();
            document.execCommand('copy');
            alert("Code copied to clipboard!");
        });
        document.getElementById('btn-dialog-confirm').addEventListener('click', () => {
            const code = document.getElementById('dialog-import-textarea').value;
            if (code) {
                LevelEditor.importLevelData(code);
                document.getElementById('editor-dialog').style.display = "none";
            }
        });

        // Responsive virtual D-pad clicks (bind touch to key inputs)
        const touchMappings = [
            { id: 'vbtn-left', key: 'ArrowLeft' },
            { id: 'vbtn-right', key: 'ArrowRight' },
            { id: 'vbtn-up', key: 'ArrowUp' },
            { id: 'vbtn-down', key: 'ArrowDown' },
            { id: 'vbtn-jump', key: ' ' }
        ];
        
        touchMappings.forEach(mapping => {
            const btn = document.getElementById(mapping.id);
            if (btn) {
                btn.addEventListener('touchstart', e => {
                    e.preventDefault();
                    this.keys[mapping.key] = true;
                });
                btn.addEventListener('touchend', e => {
                    e.preventDefault();
                    this.keys[mapping.key] = false;
                });
                btn.addEventListener('mousedown', e => {
                    this.keys[mapping.key] = true;
                });
                btn.addEventListener('mouseup', e => {
                    this.keys[mapping.key] = false;
                });
            }
        });
    },

    /**
     * Navigation helper showing specific UI screens.
     */
    showScreen(id) {
        document.querySelectorAll('.menu-screen').forEach(scr => {
            scr.classList.remove('active');
        });
        document.getElementById(id).classList.add('active');
        
        if (id === 'main-menu-screen') {
            AudioEngine.stopMusic();
            this.gameState = 'menu';
        }
    },

    /* ==========================================================================
       LEVEL LOADERS
       ========================================================================== */

    /**
     * Launches a campaign level.
     */
    startCampaignLevel(lvl) {
        this.levelIndex = lvl;
        this.isCustomLevel = false;
        this.coins = 0;
        this.score = 0;
        this.timeLeft = 150 * 60; // 150 seconds
        
        const lines = this.campaignLevels[lvl];
        this.loadLevelGrid(lines);
        
        this.showScreen('game-screen');
        this.startGameLoop();
        
        document.getElementById('hud-level-val').innerText = `${lvl}-1`;
    },

    /**
     * Launches the level built inside the Level Editor.
     */
    startCustomLevel(dataString) {
        this.isCustomLevel = true;
        this.coins = 0;
        this.score = 0;
        this.timeLeft = 150 * 60; // 150 seconds
        
        const lines = dataString.split('\n');
        this.loadLevelGrid(lines);
        
        this.showScreen('game-screen');
        this.startGameLoop();
        
        document.getElementById('hud-level-val').innerText = `CUSTOM`;
    },

    /**
     * Parses level grid string lines and constructs entity classes.
     */
    loadLevelGrid(lines) {
        this.levelGrid = [];
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.cannons = [];
        this.powerups = [];
        this.spears = [];
        this.spawners = [];
        this.blocks = {};
        this.boss = null;
        
        this.levelHeight = lines.length;
        this.levelWidth = lines[0].length;
        const size = this.cellSize;
        
        // Setup grids
        for (let r = 0; r < this.levelHeight; r++) {
            this.levelGrid[r] = [];
            const chars = lines[r].split('');
            for (let c = 0; c < this.levelWidth; c++) {
                const char = chars[c] || '.';
                
                // Initialize default physics structures
                if (char === '1') {
                    // Player spawn position
                    this.player.x = c * this.cellSize;
                    this.player.y = r * this.cellSize;
                    this.levelGrid[r][c] = '.';
                } else if (char === 'M') {
                    // Patrolling walking bomb
                    this.enemies.push({
                        type: 'bomb',
                        x: c * size,
                        y: r * size,
                        vx: -1.0,
                        vy: 0,
                        w: size,
                        h: size,
                        walkFrame: 0,
                        facingRight: false,
                        isSquashed: false
                    });
                } else if (char === 'F') {
                    // Fireball spawner block
                    this.spawners = this.spawners || [];
                    this.spawners.push({ col: c, row: r, timer: Math.random() * 60, type: 'fireball' });
                } else if (char === 'p') {
                    // Snapping chomper piranha plant
                    this.enemies.push({
                        cx: c * this.cellSize + 16,
                        cy: r * this.cellSize + 16,
                        baseY: r * this.cellSize + 16,
                        w: 30,
                        h: 40,
                        type: 'piranha',
                        openRatio: 0.5,
                        animTimer: 0,
                        retracted: true
                    });
                    this.levelGrid[r][c] = '.';
                } else if (char === 'c') {
                    // Bullet cannon
                    this.cannons.push({
                        x: c * this.cellSize,
                        y: r * this.cellSize,
                        cooldown: 120
                    });
                    this.levelGrid[r][c] = 'c'; // Cannon is static block solid
                } else if (char === 'E') {
                    // Peanut Spear Boss!
                    this.boss = {
                        x: c * this.cellSize,
                        y: r * this.cellSize - 12,
                        vx: -1.2,
                        vy: 0,
                        w: 36,
                        h: 44,
                        hp: 3,
                        facingRight: false,
                        animTimer: 0,
                        spearCooldown: 90,
                        hitInvincible: 0,
                        isDead: false
                    };
                    this.levelGrid[r][c] = '.';
                } else {
                    this.levelGrid[r][c] = char;
                }
            }
        }

        // Apply selected hero state properties
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.isGrounded = false;
        this.player.isInvincible = false;
        this.player.isPipeTransition = false;
        this.player.powerState = 'normal';
        this.player.eagleTimer = 0;
        this.player.h = 24;
        this.player.w = 24;
        
        this.scrollX = 0;
        this.scrollY = 0;
        
        // Hide overlay screens
        document.getElementById('pause-overlay').style.display = 'none';
        document.getElementById('gameover-overlay').style.display = 'none';
        document.getElementById('victory-overlay').style.display = 'none';
        
        this.gameState = 'playing';
        AudioEngine.startMusic();
    },

    /**
     * Resets coordinates to play again.
     */
    restartCurrentLevel() {
        AudioEngine.playSFX('coin');
        if (this.isCustomLevel) {
            const data = localStorage.getItem('super_owen_custom_level');
            this.startCustomLevel(data);
        } else {
            this.startCampaignLevel(this.levelIndex);
        }
    },

    /* ==========================================================================
       GAME ENGINE CORE LOOPS
       ========================================================================== */

    /**
     * Initiates requestAnimationFrame ticking.
     */
    startGameLoop() {
        const loop = () => {
            if (this.gameState === 'playing') {
                this.update();
                this.draw();
                requestAnimationFrame(loop);
            }
        };
        requestAnimationFrame(loop);
    },

    pauseGame() {
        this.gameState = 'paused';
        document.getElementById('pause-overlay').style.display = 'flex';
        AudioEngine.stopMusic();
    },

    resumeGame() {
        this.gameState = 'playing';
        document.getElementById('pause-overlay').style.display = 'none';
        AudioEngine.startMusic();
        this.startGameLoop();
    },

    exitToMenu() {
        this.showScreen('main-menu-screen');
    },

    startNextLevel() {
        if (this.levelIndex < 3) {
            this.startCampaignLevel(this.levelIndex + 1);
        } else {
            this.exitToMenu();
        }
    },

    /* ==========================================================================
       PHYSICS COLLISION DETECTIONS
       ========================================================================== */

    /**
     * Main ticking calculation method.
     */
    update() {
        // Handle Level Timer countdown
        if (this.timeLeft > 0 && !this.player.isDead) {
            this.timeLeft--;
            if (this.timeLeft <= 0) {
                // Time up! Player dies instantly
                this.playerHurt();
                this.timeLeft = 150 * 60; // Reset for next try
            }
        }

        // 1. Invincibility flicker timer
        if (this.player.isInvincible) {
            this.player.invincibilityTimer--;
            if (this.player.invincibilityTimer <= 0) {
                this.player.isInvincible = false;
            }
        }
        
        // Eagle flight logic
        if (this.player.powerState === 'eagle') {
            this.player.eagleTimer--;
            document.getElementById('hud-eagle-container').style.display = 'flex';
            document.getElementById('hud-eagle-val').innerText = (this.player.eagleTimer / 60).toFixed(1);
            if (this.player.eagleTimer <= 0) {
                this.player.powerState = 'normal';
                this.player.h = 24;
                document.getElementById('hud-eagle-container').style.display = 'none';
            }
        } else {
            document.getElementById('hud-eagle-container').style.display = 'none';
        }
        
        // Warp pipe cool down timers
        if (this.warpCooldown > 0) this.warpCooldown--;

        // 2. Warp Pipe teleport transition animation!
        if (this.player.isPipeTransition) {
            this.player.pipeTransitionTimer--;
            this.player.vy = 0.5; // slow slide downwards
            this.player.vx = 0;
            if (this.player.pipeTransitionTimer <= 0) {
                this.player.isPipeTransition = false;
                this.player.vy = 0;
            }
            this.updateCamera();
            this.updateParticles();
            return; // stop standard movements
        }

        // 3. Horizontal keys inputs
        const acc = 0.35;
        const drag = 0.85;
        const maxVx = 3.6;
        
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            this.player.vx -= acc;
            this.player.facingRight = false;
            this.player.walkFrame++;
        } else if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            this.player.vx += acc;
            this.player.facingRight = true;
            this.player.walkFrame++;
        } else {
            this.player.vx *= drag; // slide friction deceleration
        }
        
        // Cap horizontal speed
        this.player.vx = Math.max(-maxVx, Math.min(this.player.vx, maxVx));
        
        if (this.player.powerState === 'eagle') {
            // Eagle Flight (no gravity)
            if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
                this.player.vy -= acc;
            } else if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
                this.player.vy += acc;
            } else {
                this.player.vy *= drag;
            }
            this.player.vy = Math.max(-maxVx, Math.min(this.player.vy, maxVx));
        } else {
            // Apply Gravity
            this.player.vy += 0.45; // gravity pull
        }
        
        // 4. Jump trigger
        const jumpPressed = (this.keys[' '] || this.keys['ArrowUp'] || this.keys['w'] || this.keys['W'] || this.keys['KeyZ']);
        const jumpPrev = (this.prevKeys[' '] || this.prevKeys['ArrowUp'] || this.prevKeys['w'] || this.prevKeys['W'] || this.prevKeys['KeyZ']);
        const jumpJustPressed = jumpPressed && !jumpPrev;

        if (jumpJustPressed && this.player.powerState !== 'eagle') {
            if (this.player.isGrounded) {
                this.player.vy = -9.6; // jump impulse
                this.player.isGrounded = false;
                this.player.doubleJumped = false;
                AudioEngine.playSFX('jump');
            } else if (!this.player.doubleJumped) {
                this.player.vy = -8.5; // second jump impulse
                this.player.doubleJumped = true;
                AudioEngine.playSFX('jump');
                this.spawnBurstParticles(this.player.x + this.player.w/2, this.player.y + this.player.h, '#fff', 8);
            }
        }
        
        if (this.player.isGrounded) {
            this.player.doubleJumped = false;
        }

        // 5. Connect/Warp Pipe trigger! Stand on warp and press DOWN
        if ((this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) && this.player.isGrounded && this.warpCooldown === 0) {
            const footCol = Math.floor((this.player.x + this.player.w / 2) / this.cellSize);
            const footRow = Math.floor((this.player.y + this.player.h + 2) / this.cellSize);
            
            if (footRow < this.levelHeight && footCol < this.levelWidth) {
                const blockUnder = this.levelGrid[footRow][footCol];
                // Warp Entrance A (2) connects to Warp Exit A (3)
                if (blockUnder === '2') {
                    this.triggerWarpTeleport('3');
                } else if (blockUnder === '4') {
                    this.triggerWarpTeleport('5');
                }
            }
        }

        // 6. Update positions and run tile collisions (separate X & Y for solid resolution)
        this.player.x += this.player.vx;
        this.resolveSolidCollisions('x');
        
        this.player.y += this.player.vy;
        this.player.isGrounded = false;
        this.resolveSolidCollisions('y');
        
        // 7. Limit game boundaries
        if (this.player.x < 0) this.player.x = 0;
        
        // Fell into bottom screen pit
        if (this.player.y > this.levelHeight * this.cellSize) {
            this.playerDie();
        }

        // 8. Update entities (enemies, cannon bullet bill spawners, particles)
        this.updateSpawners();
        this.updateEnemies();
        this.updateBullets();
        this.updatePowerups();
        this.updateSpears();
        this.updateCannons();
        this.updateParticles();
        this.updateCamera();
        
        // Check dynamic collectibles (coins, key)
        this.checkTriggerCollisions();
        
        // Update HUD display
        document.getElementById('hud-coins-val').innerText = String(this.coins).padStart(2, '0');
        document.getElementById('hud-score-val').innerText = String(this.score).padStart(5, '0');
        document.getElementById('hud-time-val').innerText = String(Math.ceil(this.timeLeft / 60)).padStart(3, '0');
        
        this.prevKeys = { ...this.keys };
    },


    /**
     * Implements Connected Warp Pipe teleportation transition!
     */
    triggerWarpTeleport(targetChar) {
        // Find the matching coordinates of the target Warp Pipe Exit block!
        for (let r = 0; r < this.levelHeight; r++) {
            for (let c = 0; c < this.levelWidth; c++) {
                if (this.levelGrid[r][c] === targetChar) {
                    this.player.isPipeTransition = true;
                    this.player.pipeTransitionTimer = 40; // 40 frame transition duration
                    
                    // Spawn pipe bubble warp particles
                    this.spawnBurstParticles(this.player.x + 12, this.player.y + 12, '#a5d6a7', 15);
                    
                    // Warp player coordinates to target exit tube top!
                    this.player.x = c * this.cellSize + (this.cellSize - this.player.w) / 2;
                    this.player.y = (r - 1) * this.cellSize;
                    this.player.vx = 0;
                    this.player.vy = 0;
                    
                    this.warpCooldown = 60; // 1 second cooldown
                    AudioEngine.playSFX('powerup');
                    return;
                }
            }
        }
    },

    /**
     * Resolves Axis-Aligned Bounding Box (AABB) collisions with map blocks.
     */
    resolveSolidCollisions(axis) {
        const p = this.player;
        const size = this.cellSize;
        
        const startC = Math.floor(p.x / size);
        const endC = Math.ceil((p.x + p.w) / size);
        const startR = Math.floor(p.y / size);
        const endR = Math.ceil((p.y + p.h) / size);
        
        for (let r = startR; r < endR; r++) {
            for (let c = startC; c < endC; c++) {
                if (r < 0 || r >= this.levelHeight || c < 0 || c >= this.levelWidth) continue;
                
                const char = this.levelGrid[r][c];
                
                // Solid list
                if (char === 'S' || char === 'B' || char === '?' || char === 'K' || char === 'R' || char === 'P' || char === 't' || char === 'T' || char === 'c' || char === '2' || char === '3' || char === '4' || char === '5') {
                    
                    // Simple overlapping bounds check
                    const bx = c * size;
                    const by = r * size;
                    
                    if (p.x < bx + size && p.x + p.w > bx && p.y < by + size && p.y + p.h > by) {
                        if (axis === 'x') {
                            if (p.vx > 0) p.x = bx - p.w; // Hit right wall
                            if (p.vx < 0) p.x = bx + size; // Hit left wall
                            p.vx = 0;
                        } else {
                            if (p.vy > 0) {
                                // Landed on ground block
                                p.y = by - p.h;
                                p.vy = 0;
                                p.isGrounded = true;
                            } else if (p.vy < 0) {
                                // Hit ceiling block from below!
                                p.y = by + size;
                                p.vy = 0;
                                this.hitBlockFromUnder(r, c, char);
                            }
                        }
                    }
                }
            }
        }
    },

    /**
     * Triggers active interactions when player smashes blocks from below.
     */
    hitBlockFromUnder(r, c, char) {
        // Question Mark `?` coin block pop out!
        if (char === '?') {
            this.levelGrid[r][c] = 'S'; // Convert to hit solid brick
            this.coins++;
            this.score += 100;
            AudioEngine.playSFX('coin');
            
            // Spawn popping coin particles that fly up and fall down!
            this.particles.push({
                x: c * this.cellSize + 16,
                y: r * this.cellSize - 12,
                vx: 0,
                vy: -5.0,
                w: 12,
                h: 12,
                color: '#ffd700',
                type: 'coin_spark',
                life: 30
            });
            this.spawnBurstParticles(c * this.cellSize + 16, r * this.cellSize, '#ffd700', 8);
        }
        // Question Mark `K` containing Golden Winding Key power-up!
        else if (char === 'K') {
            this.levelGrid[r][c] = 'S';
            AudioEngine.playSFX('powerup');
            
            // Spawn a sliding Key power-up entity on top of the block!
            this.powerups.push({
                x: c * this.cellSize + 4,
                y: (r - 1) * this.cellSize,
                vx: 1.0,
                vy: 0,
                w: 24,
                h: 24,
                isGrounded: false
            });
        }
        // Breakable normal brick blocks
        else if (char === 'B') {
            if (this.player.powerState === 'super') {
                // Super Owen shatters the brick!
                this.levelGrid[r][c] = '.';
                AudioEngine.playSFX('stomp');
                this.spawnBurstParticles(c * this.cellSize + 16, r * this.cellSize + 16, '#8d6e63', 12);
                this.score += 50;
            } else {
                // Small Owen just bumps it
                AudioEngine.playSFX('hit');
            }
        }
    },

    /**
     * Checks passive collectible item collisions (floating coins, escape ships, water).
     */
    checkTriggerCollisions() {
        const p = this.player;
        const size = this.cellSize;
        
        const startC = Math.floor(p.x / size);
        const endC = Math.ceil((p.x + p.w) / size);
        const startR = Math.floor(p.y / size);
        const endR = Math.ceil((p.y + p.h) / size);
        
        for (let r = startR; r < endR; r++) {
            for (let c = startC; c < endC; c++) {
                if (r < 0 || r >= this.levelHeight || c < 0 || c >= this.levelWidth) continue;
                
                const char = this.levelGrid[r][c];
                
                // 1. Collectible coins
                if (char === 'C') {
                    this.levelGrid[r][c] = '.';
                    this.coins++;
                    this.score += 100;
                    AudioEngine.playSFX('coin');
                    this.spawnBurstParticles(c * size + 16, r * size + 16, '#ffd700', 5);
                }
                // 2. Hot Lava (orange) or Toxic Water (purple)
                else if (char === 'L' || char === 'W') {
                    const bx = c * size;
                    const by = r * size;
                    if (p.x < bx + size && p.x + p.w > bx && p.y + p.h > by + 8) {
                        this.playerDie();
                    }
                }
                // 3. Spikes platform
                else if (char === 'X') {
                    const bx = c * size;
                    const by = r * size;
                    if (p.x < bx + size && p.x + p.w > bx && p.y + p.h > by + 4) {
                        this.playerHurt();
                    }
                }
                // 4. Circular Saw blade
                else if (char === 'O') {
                    const bx = c * size;
                    const by = r * size;
                    // Saw circle check
                    const dx = (p.x + p.w/2) - (bx + size/2);
                    const dy = (p.y + p.h/2) - (by + size/2);
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < 20) {
                        this.playerHurt();
                    }
                }
                // 5. Goal Ship - level victory escape!
                else if (char === 'g') {
                    this.levelVictory();
                }
            }
        }
    },

    /* ==========================================================================
       NPC ENTITIES UPDATES
       ========================================================================== */

    /**
     * Updates walking bombs and snapping piranhas.
     */
    updateEnemies() {
        const size = this.cellSize;
        
        this.enemies.forEach((enemy, idx) => {
            if (enemy.isSquashed) return;
            
            // 1. Snapping Chomper plant logic
            if (enemy.type === 'piranha') {
                enemy.animTimer++;
                
                // Measure player distance
                const dx = Math.abs(enemy.cx - (this.player.x + this.player.w/2));
                
                // Rise and descend logic
                if (dx > 70) { // Only emerge if player is not standing right next to pipe!
                    enemy.cy = enemy.baseY - 14 + Math.sin(enemy.animTimer * 0.05) * 16;
                } else {
                    enemy.cy = enemy.baseY + 20; // hide retracted in pipe
                }
                
                // Touch damage check
                const p = this.player;
                const ex = enemy.cx - enemy.w/2;
                const ey = enemy.cy - enemy.h/2;
                if (p.x < ex + enemy.w && p.x + p.w > ex && p.y < ey + enemy.h && p.y + p.h > ey) {
                    this.playerHurt();
                }
                return;
            }
            
            // 2. Standard Walking green/red bomb
            enemy.vy += 0.4; // normal gravity
            enemy.x += enemy.vx;
            
            // Simple X-wall collision check
            const ec = Math.floor((enemy.x + (enemy.vx > 0 ? enemy.w : 0)) / size);
            const er = Math.floor((enemy.y + enemy.h/2) / size);
            if (ec >= 0 && ec < this.levelWidth && er >= 0 && er < this.levelHeight) {
                const nextB = this.levelGrid[er][ec];
                if (nextB === 'S' || nextB === 'T' || nextB === 't' || nextB === 'c') {
                    enemy.vx = -enemy.vx; // bounce patrol walk direction
                    enemy.facingRight = !enemy.facingRight;
                }
            }
            
            // Apply Y-movement gravity check
            enemy.y += enemy.vy;
            const erFoot = Math.floor((enemy.y + enemy.h) / size);
            const ecFoot = Math.floor((enemy.x + enemy.w/2) / size);
            if (erFoot < this.levelHeight && ecFoot < this.levelWidth) {
                if (this.levelGrid[erFoot][ecFoot] === 'S') {
                    enemy.y = erFoot * size - enemy.h;
                    enemy.vy = 0;
                }
            }
            
            enemy.walkFrame++;
            
            // Check stomp vs damage collision with player!
            const p = this.player;
            if (p.x < enemy.x + enemy.w && p.x + p.w > enemy.x && p.y < enemy.y + enemy.h && p.y + p.h > enemy.y) {
                // Hitting from above = STOMP!
                if (p.vy > 0 && p.y + p.h - p.vy <= enemy.y + 6) {
                    enemy.isSquashed = true;
                    p.vy = -6.0; // bounce player
                    this.score += 200;
                    AudioEngine.playSFX('stomp');
                    this.spawnBurstParticles(enemy.x + 13, enemy.y + 13, '#4caf50', 10);
                    
                    // Delete enemy after squash frame
                    setTimeout(() => {
                        this.enemies = this.enemies.filter(e => e !== enemy);
                    }, 100);
                } else {
                    // Hurting player
                    this.playerHurt();
                }
            }
        });
    },

    /**
     * Bullet launchers (cannons) shoot Bullet Bills.
     */
    updateCannons() {
        this.cannons.forEach(cannon => {
            cannon.cooldown--;
            if (cannon.cooldown <= 0) {
                cannon.cooldown = 150 + Math.random() * 120; // 3-4s random delay
                
                // Shoot only if player is relatively near but not too close
                const dx = Math.abs((cannon.x + 16) - (this.player.x + 12));
                if (dx > 40 && dx < 480) {
                    const facing = (this.player.x < cannon.x); // shoot towards player
                    this.bullets.push({
                        x: cannon.x + (facing ? -24 : 32),
                        y: cannon.y,
                        vx: facing ? -2.2 : 2.2,
                        w: 24,
                        h: 18,
                        facingRight: !facing
                    });
                    AudioEngine.playSFX('hit');
                }
            }
        });
    },

    /**
     * Updates flying bullet torpedoes.
     */
    updateBullets() {
        this.bullets.forEach((bullet, idx) => {
            bullet.x += bullet.vx;
            
            // Check stomp vs damage
            const p = this.player;
            if (p.x < bullet.x + bullet.w && p.x + p.w > bullet.x && p.y < bullet.y + bullet.h && p.y + p.h > bullet.y) {
                if (p.vy > 0 && p.y + p.h - p.vy <= bullet.y + 6) {
                    // Stomp bullet!
                    p.vy = -5.5;
                    this.score += 150;
                    AudioEngine.playSFX('stomp');
                    this.spawnBurstParticles(bullet.x + 12, bullet.y + 9, '#424242', 8);
                    this.bullets.splice(idx, 1);
                } else {
                    this.playerHurt();
                }
            }
            
            // Delete bullets out of screen bounds
            if (bullet.x < this.scrollX - 100 || bullet.x > this.scrollX + 900) {
                this.bullets.splice(idx, 1);
            }
        });
    },

    /**
     * Key power-up movement.
     */
    updatePowerups() {
        const size = this.cellSize;
        
        this.powerups.forEach((key, idx) => {
            key.vy += 0.35; // gravity
            key.x += key.vx;
            
            // Bounce on walls
            const col = Math.floor((key.x + (key.vx > 0 ? key.w : 0)) / size);
            const row = Math.floor((key.y + key.h/2) / size);
            if (col >= 0 && col < this.levelWidth && row >= 0 && row < this.levelHeight) {
                const b = this.levelGrid[row][col];
                if (b === 'S' || b === 'T' || b === 't') {
                    key.vx = -key.vx;
                }
            }
            
            key.y += key.vy;
            const footR = Math.floor((key.y + key.h) / size);
            const footC = Math.floor((key.x + key.w/2) / size);
            if (footR < this.levelHeight && footC < this.levelWidth) {
                if (this.levelGrid[footR][footC] === 'S') {
                    key.y = footR * size - key.h;
                    key.vy = 0;
                }
            }
            
            // Eat powerup key!
            const p = this.player;
            if (p.x < key.x + key.w && p.x + p.w > key.x && p.y < key.y + key.h && p.y + p.h > key.y) {
                this.powerups.splice(idx, 1);
                this.score += 500;
                
                // Transform to Eagle!
                if (p.powerState !== 'eagle') {
                    p.powerState = 'eagle';
                    p.eagleTimer = 600; // 10 seconds (60 fps)
                    p.y -= 10; // push up so it doesn't clip floor
                    p.h = 32; // grow slightly
                    AudioEngine.playSFX('powerup');
                    this.spawnBurstParticles(p.x + 12, p.y + 16, '#fbc02d', 25);
                } else {
                    // Refill timer
                    p.eagleTimer = 600;
                    AudioEngine.playSFX('coin');
                }
            }
        });
    },

    /**
     * Peanut Crown Spear Boss behaviors (movement, health hits, throwing spears).
     */
    updateSpears() {
        this.spears.forEach((spear, idx) => {
            spear.x += spear.vx;
            
            // Spear hit player check
            const p = this.player;
            if (p.x < spear.x + spear.w && p.x + p.w > spear.x && p.y < spear.y + spear.h && p.y + p.h > spear.y) {
                this.playerHurt();
                this.spears.splice(idx, 1);
            }
            
            // Out of bounds
            if (spear.x < this.scrollX - 50 || spear.x > this.scrollX + 900) {
                this.spears.splice(idx, 1);
            }
        });
    },

    updateEnemiesSpearBoss() {
        if (!this.boss || this.boss.isDead) return;
        
        const b = this.boss;
        b.animTimer++;
        
        if (b.hitInvincible > 0) b.hitInvincible--;
        
        b.vy += 0.4;
        b.x += b.vx;
        
        // Bounce on borders or edges
        const size = this.cellSize;
        const col = Math.floor((b.x + (b.vx > 0 ? b.w : 0)) / size);
        const row = Math.floor((b.y + b.h/2) / size);
        if (col >= 0 && col < this.levelWidth && row >= 0 && row < this.levelHeight) {
            const block = this.levelGrid[row][col];
            if (block === 'S' || block === 'T' || block === 't') {
                b.vx = -b.vx;
                b.facingRight = !b.facingRight;
            }
        }
        
        b.y += b.vy;
        const erF = Math.floor((b.y + b.h) / size);
        const ecF = Math.floor((b.x + b.w/2) / size);
        if (erF < this.levelHeight && ecF < this.levelWidth) {
            if (this.levelGrid[erF][ecF] === 'S') {
                b.y = erF * size - b.h;
                b.vy = 0;
            }
        }
        
        // Boss throws spears!
        b.spearCooldown--;
        if (b.spearCooldown <= 0) {
            b.spearCooldown = 120 + Math.random() * 100;
            const throwDir = (this.player.x < b.x) ? -1 : 1;
            b.facingRight = (throwDir > 0);
            
            this.spears.push({
                x: b.x + (throwDir > 0 ? b.w : -20),
                y: b.y + 12,
                vx: throwDir * 3.5,
                w: 20,
                h: 8
            });
            AudioEngine.playSFX('hit');
        }
        
        // Boss stomp check!
        const p = this.player;
        if (p.x < b.x + b.w && p.x + p.w > b.x && p.y < b.y + b.h && p.y + p.h > b.y) {
            // Jump on boss head!
            if (p.vy > 0 && p.y + p.h - p.vy <= b.y + 10 && b.hitInvincible === 0) {
                b.hp--;
                p.vy = -7.0; // bounce player high!
                b.hitInvincible = 50; // temporary immunity
                AudioEngine.playSFX('boss_hit');
                this.spawnBurstParticles(b.x + 18, b.y + 18, '#ff3d00', 25);
                
                if (b.hp <= 0) {
                    b.isDead = true;
                    this.score += 2000;
                    AudioEngine.playSFX('victory');
                    
                    // Reveal a path: change boss block area to walkable space, spawn goal ship block!
                    this.spawnBurstParticles(b.x + 18, b.y + 18, '#ffd700', 40);
                    // Automatically place Goal Ship in Level 3 exit on Boss death!
                    const targetC = Math.min(this.levelWidth - 6, Math.floor(b.x / size) + 4);
                    this.levelGrid[11][targetC] = 'g';
                }
            } else if (b.hitInvincible === 0) {
                this.playerHurt();
            }
        }
    },

    updateEnemies() {
        // Run standard enemies
        this.updateEnemiesStandard();
        
        // Run boss if present
        this.updateEnemiesSpearBoss();
    },

    updateSpawners() {
        if (!this.spawners) return;
        this.spawners.forEach(sp => {
            sp.timer--;
            if (sp.timer <= 0) {
                sp.timer = 150 + Math.random() * 100;
                // Only spawn if near camera
                const spX = sp.col * this.cellSize;
                if (spX > this.cameraX - 400 && spX < this.cameraX + 800) {
                    this.enemies.push({
                        type: 'fireball',
                        x: spX,
                        y: sp.row * this.cellSize,
                        vx: -3.5, // rolling left
                        vy: 0,
                        w: 24,
                        h: 24,
                        isSquashed: false,
                        walkFrame: 0
                    });
                }
            }
        });
    },


    updateEnemiesStandard() {
        const size = this.cellSize;
        
        this.enemies.forEach((enemy, idx) => {
            if (enemy.isSquashed) return;
            
            if (enemy.type === 'piranha') {
                enemy.animTimer++;
                const dx = Math.abs(enemy.cx - (this.player.x + this.player.w/2));
                
                if (dx > 70) {
                    enemy.cy = enemy.baseY - 14 + Math.sin(enemy.animTimer * 0.04) * 18;
                } else {
                    enemy.cy = enemy.baseY + 24;
                }
                
                const p = this.player;
                const ex = enemy.cx - enemy.w/2;
                const ey = enemy.cy - enemy.h/2;
                if (p.x < ex + enemy.w && p.x + p.w > ex && p.y < ey + enemy.h && p.y + p.h > ey) {
                    this.playerHurt();
                }
                return;
            }
            
            enemy.vy += 0.45;
            enemy.x += enemy.vx;
            
            const ec = Math.floor((enemy.x + (enemy.vx > 0 ? enemy.w : 0)) / size);
            const er = Math.floor((enemy.y + enemy.h/2) / size);
            if (ec >= 0 && ec < this.levelWidth && er >= 0 && er < this.levelHeight) {
                const nextB = this.levelGrid[er][ec];
                if (nextB === 'S' || nextB === 'T' || nextB === 't' || nextB === 'c' || nextB === 'B' || nextB === '?') {
                    enemy.vx = -enemy.vx;
                    enemy.facingRight = !enemy.facingRight;
                }
            }
            
            enemy.y += enemy.vy;
            const erFoot = Math.floor((enemy.y + enemy.h) / size);
            const ecFoot = Math.floor((enemy.x + enemy.w/2) / size);
            if (erFoot < this.levelHeight && ecFoot >= 0 && ecFoot < this.levelWidth) {
                const block = this.levelGrid[erFoot][ecFoot];
                if (block === 'S' || block === 'B' || block === '?' || block === 'T' || block === 't' || block === 'c') {
                    enemy.y = erFoot * size - enemy.h;
                    if (enemy.type === 'fireball') {
                        enemy.vy = -6.5; // bounce up
                    } else {
                        enemy.vy = 0;
                    }
                }
            }
            
            enemy.walkFrame++;
            
            const p = this.player;
            if (p.x < enemy.x + enemy.w && p.x + p.w > enemy.x && p.y < enemy.y + enemy.h && p.y + p.h > enemy.y) {
                if (p.vy > 0 && p.y + p.h - p.vy <= enemy.y + 8) {
                    enemy.isSquashed = true;
                    p.vy = -6.5;
                    this.score += 200;
                    AudioEngine.playSFX('stomp');
                    this.spawnBurstParticles(enemy.x + 13, enemy.y + 13, '#4caf50', 10);
                    setTimeout(() => {
                        this.enemies = this.enemies.filter(e => e !== enemy);
                    }, 100);
                } else {
                    this.playerHurt();
                }
            }
        });
    },

    /**
     * Spark shards particles.
     */
    updateParticles() {
        this.particles.forEach((part, idx) => {
            part.x += part.vx;
            part.y += part.vy;
            part.vy += 0.2; // light gravity falling
            part.life--;
            if (part.life <= 0) {
                this.particles.splice(idx, 1);
            }
        });
    },

    spawnBurstParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.0 + Math.random() * 3.5;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.5,
                w: 3 + Math.random() * 4,
                h: 3 + Math.random() * 4,
                color: color,
                type: 'shard',
                life: 20 + Math.random() * 15
            });
        }
    },

    /**
     * Camera locks to player x-coordinate.
     */
    updateCamera() {
        const targetX = this.player.x - this.canvas.width / 2 + this.player.w / 2;
        const maxScrollX = this.levelWidth * this.cellSize - this.canvas.width;
        this.scrollX = Math.max(0, Math.min(targetX, maxScrollX));
    },

    /* ==========================================================================
       HERO HEALTH / DAMAGE STATE HANDLERS
       ========================================================================== */

    /**
     * Hurting player: shrinks Super Owen, kills normal Owen.
     */
    playerHurt() {
        if (this.player.isInvincible || this.gameState !== 'playing') return;
        
        if (this.player.powerState === 'eagle') {
            // Shrink back to base character
            this.player.powerState = 'normal';
            this.player.eagleTimer = 0;
            this.player.h = 24; // shrink boundary height
            this.player.isInvincible = true;
            this.player.invincibilityTimer = 80; // 1.3 seconds immunity
            
            AudioEngine.playSFX('hurt');
            this.spawnBurstParticles(this.player.x + 12, this.player.y + 12, '#ff3d00', 15);
        } else {
            // Dead small Owen
            this.playerDie();
        }
    },

    /**
     * Instantly kills the hero.
     */
    playerDie() {
        this.gameState = 'gameover';
        AudioEngine.stopMusic();
        AudioEngine.playSFX('hurt');
        
        // Spawn massive splash explosion shards!
        this.spawnBurstParticles(this.player.x + 12, this.player.y + 12, '#00b4ff', 35);
        
        document.getElementById('gameover-overlay').style.display = 'flex';
    },

    /**
     * Triggers victory.
     */
    levelVictory() {
        this.gameState = 'victory';
        AudioEngine.stopMusic();
        AudioEngine.playSFX('victory');
        
        // Add time to score (10 points per remaining second)
        const timeBonus = Math.max(0, Math.ceil(this.timeLeft / 60)) * 10;
        this.score += timeBonus;
        
        document.getElementById('victory-coins').innerText = this.coins;
        document.getElementById('victory-score').innerText = this.score;
        document.getElementById('victory-overlay').style.display = 'flex';
        
        // Save high scores in localStorage
        const high = localStorage.getItem('super_owen_highscore') || 0;
        if (this.score > high) {
            localStorage.setItem('super_owen_highscore', this.score);
        }
    },

    /* ==========================================================================
       RENDERING GRAPHICS ENGINE
       ========================================================================== */

    /**
     * Central drawing director.
     */
    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const size = this.cellSize;
        
        // Clear canvas
        ctx.fillStyle = '#05060a'; // Dark retro night sky
        ctx.fillRect(0, 0, w, h);
        
        ctx.save();
        ctx.translate(-this.scrollX, 0); // pan camera
        
        // 1. Draw environmental sketched background clouds
        const startC = Math.floor(this.scrollX / size);
        const endC = Math.min(this.levelWidth, startC + Math.ceil(w / size) + 2);
        
        for (let c = startC; c < endC; c += 12) {
            drawCanvasCloud(ctx, c * size + 40, 60, 0.65);
            drawCanvasCloud(ctx, c * size + 220, 110, 0.4);
        }
        
        // 2. Draw static level elements
        for (let r = 0; r < this.levelHeight; r++) {
            for (let c = startC; c < endC; c++) {
                const char = this.levelGrid[r][c];
                const tx = c * size;
                const ty = r * size;
                
                if (char === 'S') drawSolidBlock(ctx, tx, ty, size, size);
                else if (char === 'B') drawBrickBlock(ctx, tx, ty, size, size);
                else if (char === '?') drawQuestionBlock(ctx, tx, ty, size, size, false);
                else if (char === 'K') drawQuestionBlock(ctx, tx, ty, size, size, false);
                else if (char === 'R') drawRedCrossHatchPlatform(ctx, tx, ty, size, size);
                else if (char === 'P') drawGoldenPyramidBlock(ctx, tx, ty, size, size);
                else if (char === 'T') drawPipeTop(ctx, tx, ty, size, size);
                else if (char === 't') drawPipeBody(ctx, tx, ty, size, size);
                else if (char === 'C') drawCoin(ctx, tx + size/2, ty + size/2, 8, Date.now() / 100);
                
                // Connecting Warp Pipes entrance numbers
                else if (char === '2') { drawPipeTop(ctx, tx, ty, size, size); ctx.fillStyle='#fff'; ctx.fillText('A↓', tx+8, ty+20); }
                else if (char === '3') { drawPipeTop(ctx, tx, ty, size, size); ctx.fillStyle='#fff'; ctx.fillText('A↑', tx+8, ty+20); }
                else if (char === '4') { drawPipeTop(ctx, tx, ty, size, size); ctx.fillStyle='#fff'; ctx.fillText('B↓', tx+8, ty+20); }
                else if (char === '5') { drawPipeTop(ctx, tx, ty, size, size); ctx.fillStyle='#fff'; ctx.fillText('B↑', tx+8, ty+20); }
                
                // Cannon launcher
                else if (char === 'c') drawBulletCannon(ctx, tx, ty, size, size);
                // Goal Boat
                else if (char === 'g') drawGoalBoat(ctx, tx, ty, size, size);
                
                // Hazards liquid fills (liquids occupy full width scroll waves)
                else if (char === 'L') drawLava(ctx, tx, ty, size, size, this.scrollX);
                else if (char === 'W') drawToxicWater(ctx, tx, ty, size, size, this.scrollX);
                else if (char === 'X') drawSpikes(ctx, tx, ty, size, size);
                else if (char === 'O') drawSawBlade(ctx, tx, ty, size, size, Date.now() / 60);
            }
        }
        
        // 3. Draw active level entities
        this.bullets.forEach(bullet => {
            drawBulletBill(ctx, bullet.x, bullet.y, bullet.w, bullet.h, bullet.facingRight);
        });
        
        this.powerups.forEach(key => {
            drawPowerupKey(ctx, key.x, key.y, key.w, key.h);
        });
        
        this.spears.forEach(spear => {
            ctx.save();
            ctx.fillStyle = '#cfd8dc';
            ctx.fillRect(spear.x, spear.y, spear.w, spear.h);
            drawSketchLine(ctx, spear.x, spear.y + 4, spear.x + spear.w, spear.y + 4, '#37474f', 1.5, 0.5);
            ctx.restore();
        });
        
        this.enemies.forEach(enemy => {
            if (enemy.type === 'piranha') {
                drawPiranhaPlant(ctx, enemy.cx - enemy.w/2, enemy.cy - enemy.h/2, enemy.w, enemy.h, enemy.openRatio);
            } else if (enemy.type === 'fireball') {
                drawFireball(ctx, enemy.x, enemy.y, enemy.w, enemy.h, enemy.walkFrame);
            } else {
                drawWalkingBomb(ctx, enemy.x, enemy.y, enemy.w, enemy.h, enemy.walkFrame, enemy.facingRight);
            }
        });
        
        if (this.boss && !this.boss.isDead) {
            drawSpearBoss(ctx, this.boss.x, this.boss.y, this.boss.w, this.boss.h, this.boss.animTimer, this.boss.hp);
        }
        
        // 4. Draw particles
        this.particles.forEach(part => {
            ctx.fillStyle = part.color;
            ctx.fillRect(part.x, part.y, part.w, part.h);
        });
        
        // 5. Draw playable Hero Character
        const p = this.player;
        const isWalking = Math.abs(p.vx) > 0.1;
        
        // Flicker effect when player is invincible
        let shouldDrawPlayer = true;
        if (p.isInvincible) {
            shouldDrawPlayer = (Math.floor(Date.now() / 60) % 2 === 0);
        }
        
        if (shouldDrawPlayer) {
            if (p.powerState === 'eagle') {
                drawEagle(ctx, p.x, p.y, p.w, p.h, isWalking, p.walkFrame, p.facingRight);
            } else {
                if (this.selectedHero === 'driver') {
                    drawDriver(ctx, p.x, p.y, p.w, p.h, isWalking, p.walkFrame, p.facingRight);
                } else if (this.selectedHero === 'astronaut') {
                    drawAstronaut(ctx, p.x, p.y, p.w, p.h, isWalking, p.walkFrame, p.facingRight);
                } else if (this.selectedHero === 'princess') {
                    drawPrincess(ctx, p.x, p.y, p.w, p.h, isWalking, p.walkFrame, p.facingRight);
                } else if (this.selectedHero === 'ninja') {
                    drawNinja(ctx, p.x, p.y, p.w, p.h, isWalking, p.walkFrame, p.facingRight);
                } else if (this.selectedHero === 'fox') {
                    drawFox(ctx, p.x, p.y, p.w, p.h, isWalking, p.walkFrame, p.facingRight);
                } else if (this.selectedHero === 'gorilla') {
                    drawGorilla(ctx, p.x, p.y, p.w, p.h, isWalking, p.walkFrame, p.facingRight);
                } else {
                    drawCowboy(ctx, p.x, p.y, p.w, p.h, isWalking, p.walkFrame, p.facingRight);
                }
            }
        }
        
        ctx.restore();
    }
};

// Bootstrap when DOM loads
window.addEventListener('DOMContentLoaded', () => {
    Game.init();
});

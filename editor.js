/* ==========================================================================
   Super Owen - Interactive Sketch Level Editor Module
   ========================================================================== */

const LevelEditor = {
    canvas: null,
    ctx: null,
    grid: [],
    cols: 160, // 160 columns * 32px = 5120px wide level
    rows: 15,  // 15 rows * 32px = 480px high level
    cellSize: 32,
    
    // Editor UI state
    currentBrush: 'S', // Default to Solid Block
    scrollX: 0,
    isMouseDown: false,
    mouseButton: 0, // 0 = Left (draw), 2 = Right (erase), 1 = Middle (pan)
    lastMouseX: 0,
    lastMouseY: 0,
    
    // Brush palette definitions
    brushes: [
        { char: 'S', label: 'Solid', group: 'block', draw: (ctx, x, y, size) => drawSolidBlock(ctx, x, y, size, size) },
        { char: '?', label: 'Coin ?', group: 'block', draw: (ctx, x, y, size) => drawQuestionBlock(ctx, x, y, size, size, false) },
        { char: 'K', label: 'Key ?', group: 'block', draw: (ctx, x, y, size) => drawQuestionBlock(ctx, x, y, size, size, false) },
        { char: 'B', label: 'Brick', group: 'block', draw: (ctx, x, y, size) => drawBrickBlock(ctx, x, y, size, size) },
        { char: 'R', label: 'Red Girder', group: 'block', draw: (ctx, x, y, size) => drawRedCrossHatchPlatform(ctx, x, y, size, size) },
        { char: 'P', label: 'Gold Pyr', group: 'block', draw: (ctx, x, y, size) => drawGoldenPyramidBlock(ctx, x, y, size, size) },
        { char: 'T', label: 'Pipe Top', group: 'block', draw: (ctx, x, y, size) => drawPipeTop(ctx, x, y, size, size) },
        { char: 't', label: 'Pipe Body', group: 'block', draw: (ctx, x, y, size) => drawPipeBody(ctx, x, y, size, size) },
        { char: 'C', label: 'Coin', group: 'block', draw: (ctx, x, y, size) => drawCoin(ctx, x + size/2, y + size/2, 8, 0) },
        
        { char: 'L', label: 'Lava', group: 'hazard', draw: (ctx, x, y, size) => drawLava(ctx, y, size, size, 0) },
        { char: 'W', label: 'Acid', group: 'hazard', draw: (ctx, x, y, size) => drawToxicWater(ctx, y, size, size, 0) },
        { char: 'X', label: 'Spikes', group: 'hazard', draw: (ctx, x, y, size) => drawSpikes(ctx, x, y, size, size) },
        { char: 'O', label: 'Saw Blade', group: 'hazard', draw: (ctx, x, y, size) => drawSawBlade(ctx, x, y, size, size, 0) },
        { char: 'M', label: 'Bomb NPC', group: 'hazard', draw: (ctx, x, y, size) => drawWalkingBomb(ctx, x, y, size, size, 0, true) },
        { char: 'p', label: 'Chomper', group: 'hazard', draw: (ctx, x, y, size) => drawPiranhaPlant(ctx, x, y, size, size, 0.5) },
        { char: 'c', label: 'Cannon', group: 'hazard', draw: (ctx, x, y, size) => drawBulletCannon(ctx, x, y, size, size) },
        
        { char: 'E', label: 'Boss', group: 'hazard', draw: (ctx, x, y, size) => drawSpearBoss(ctx, x, y, size, size, 0, 3) },
        { char: 'g', label: 'Goal Ship', group: 'block', draw: (ctx, x, y, size) => drawGoalBoat(ctx, x, y, size, size) },
        { char: '1', label: 'Hero Spawn', group: 'block', draw: (ctx, x, y, size) => drawOwen(ctx, x, y, size, size, false, 0, true) },
        
        // Connecting Warp Pipe Entrances & Exits!
        { char: '2', label: 'Warp A In', group: 'block', draw: (ctx, x, y, size) => { drawPipeTop(ctx, x, y, size, size); ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.fillText('A↓', x + 8, y + 20); } },
        { char: '3', label: 'Warp A Out', group: 'block', draw: (ctx, x, y, size) => { drawPipeTop(ctx, x, y, size, size); ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.fillText('A↑', x + 8, y + 20); } },
        { char: '4', label: 'Warp B In', group: 'block', draw: (ctx, x, y, size) => { drawPipeTop(ctx, x, y, size, size); ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.fillText('B↓', x + 8, y + 20); } },
        { char: '5', label: 'Warp B Out', group: 'block', draw: (ctx, x, y, size) => { drawPipeTop(ctx, x, y, size, size); ctx.fillStyle = '#fff'; ctx.font = 'bold 10px sans-serif'; ctx.fillText('B↑', x + 8, y + 20); } },
    ],

    /**
     * Initializes the Level Editor
     */
    init() {
        this.canvas = document.getElementById('editor-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resetGrid();
        this.buildSidebarPalette();
        this.setupEventListeners();
        
        // Load autosaved custom level if it exists
        const saved = localStorage.getItem('super_owen_custom_level');
        if (saved) {
            this.importLevelData(saved);
        }
        
        this.render();
    },

    /**
     * Resets the entire grid to empty spaces.
     */
    resetGrid() {
        this.grid = [];
        for (let r = 0; r < this.rows; r++) {
            this.grid[r] = [];
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c] = '.';
            }
        }
        // Place default starting elements
        this.grid[10][5] = '1'; // Player spawn
        // Floor
        for (let c = 0; c < this.cols; c++) {
            this.grid[13][c] = 'S';
            this.grid[14][c] = 'S';
        }
    },

    /**
     * Fills the sidebar UI palette dynamically.
     */
    buildSidebarPalette() {
        const blocksGrid = document.getElementById('brush-grid-blocks');
        const hazardsGrid = document.getElementById('brush-grid-hazards');
        
        blocksGrid.innerHTML = '';
        hazardsGrid.innerHTML = '';
        
        this.brushes.forEach(brush => {
            const container = document.createElement('div');
            container.className = `brush-item ${brush.char === this.currentBrush ? 'active' : ''}`;
            container.setAttribute('data-brush', brush.char);
            container.setAttribute('data-label', brush.label);
            
            // Draw a preview on a small canvas inside the sidebar item
            const previewCanvas = document.createElement('canvas');
            previewCanvas.width = 32;
            previewCanvas.height = 32;
            container.appendChild(previewCanvas);
            
            const pCtx = previewCanvas.getContext('2d');
            brush.draw(pCtx, 0, 0, 32);
            
            container.addEventListener('click', () => {
                document.querySelectorAll('.brush-item').forEach(el => el.classList.remove('active'));
                container.classList.add('active');
                this.currentBrush = brush.char;
            });
            
            if (brush.group === 'block') {
                blocksGrid.appendChild(container);
            } else {
                hazardsGrid.appendChild(container);
            }
        });
        
        // Add Eraser brush
        const eraserContainer = document.createElement('div');
        eraserContainer.className = 'brush-item';
        eraserContainer.setAttribute('data-brush', '.');
        eraserContainer.setAttribute('data-label', 'Eraser');
        
        const eraserCanvas = document.createElement('canvas');
        eraserCanvas.width = 32;
        eraserCanvas.height = 32;
        eraserContainer.appendChild(eraserCanvas);
        const erCtx = eraserCanvas.getContext('2d');
        erCtx.strokeStyle = '#ff1744';
        erCtx.lineWidth = 2;
        erCtx.beginPath();
        erCtx.moveTo(4, 4); erCtx.lineTo(28, 28);
        erCtx.moveTo(28, 4); erCtx.lineTo(4, 28);
        erCtx.stroke();
        
        eraserContainer.addEventListener('click', () => {
            document.querySelectorAll('.brush-item').forEach(el => el.classList.remove('active'));
            eraserContainer.classList.add('active');
            this.currentBrush = '.';
        });
        blocksGrid.appendChild(eraserContainer);
    },

    /**
     * Registers all mouse, key, and canvas listeners.
     */
    setupEventListeners() {
        // Prevent default context menu so we can right-click erase!
        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
        
        this.canvas.addEventListener('mousedown', e => {
            this.isMouseDown = true;
            this.mouseButton = e.button;
            this.handleMouseDraw(e);
        });
        
        this.canvas.addEventListener('mousemove', e => {
            if (this.isMouseDown) {
                if (this.mouseButton === 1) { // Middle click drag pan
                    const dx = e.clientX - this.lastMouseX;
                    this.scrollX = Math.max(0, Math.min(this.scrollX - dx, this.cols * this.cellSize - this.canvas.width));
                } else {
                    this.handleMouseDraw(e);
                }
            }
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });
        
        window.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });
        
        // Wheel scrolling for level panning
        this.canvas.addEventListener('wheel', e => {
            e.preventDefault();
            this.scrollX = Math.max(0, Math.min(this.scrollX + e.deltaY, this.cols * this.cellSize - this.canvas.width));
        });
    },

    /**
     * Interprets mouse coordinates to place blocks.
     */
    handleMouseDraw(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left + this.scrollX;
        const my = e.clientY - rect.top;
        
        const c = Math.floor(mx / this.cellSize);
        const r = Math.floor(my / this.cellSize);
        
        if (c >= 0 && c < this.cols && r >= 0 && r < this.rows) {
            if (this.mouseButton === 2) {
                // Right click = Erase
                this.grid[r][c] = '.';
            } else if (this.mouseButton === 0) {
                // Left click = Place active brush
                this.grid[r][c] = this.currentBrush;
            }
        }
    },

    /**
     * Serializes the 2D grid into a single string.
     */
    exportLevelData() {
        let lines = [];
        for (let r = 0; r < this.rows; r++) {
            lines.push(this.grid[r].join(''));
        }
        return lines.join('\n');
    },

    /**
     * Imports a serialized string back into the grid.
     */
    importLevelData(dataString) {
        if (!dataString) return;
        const lines = dataString.split('\n');
        this.rows = Math.min(lines.length, 15);
        this.cols = Math.min(lines[0].length, 180);
        
        this.grid = [];
        for (let r = 0; r < this.rows; r++) {
            this.grid[r] = [];
            const chars = lines[r].split('');
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c] = chars[c] || '.';
            }
        }
    },

    /**
     * Renders the editor view (draws gridlines, backgrounds, and all active blocks).
     */
    render() {
        if (document.getElementById('level-editor-screen').style.display === 'none') return;
        
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const size = this.cellSize;
        
        ctx.fillStyle = '#05060a';
        ctx.fillRect(0, 0, w, h);
        
        ctx.save();
        ctx.translate(-this.scrollX, 0);
        
        // 1. Draw grid background vertical coordinates
        const startCol = Math.floor(this.scrollX / size);
        const endCol = Math.min(this.cols, startCol + Math.ceil(w / size) + 1);
        
        // 2. Draw static sketched clouds in editor background
        for (let i = 0; i < this.cols; i += 10) {
            drawCanvasCloud(ctx, i * size + 40, 60, 0.6);
            drawCanvasCloud(ctx, i * size + 200, 100, 0.4);
        }
        
        // 3. Draw grid entities
        for (let r = 0; r < this.rows; r++) {
            for (let c = startCol; c < endCol; c++) {
                const char = this.grid[r][c];
                const x = c * size;
                const y = r * size;
                
                // Draw thin marker grid squares for building guide
                ctx.strokeStyle = 'rgba(255,255,255,0.03)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, size, size);
                
                if (char !== '.') {
                    const brush = this.brushes.find(b => b.char === char);
                    if (brush) {
                        brush.draw(ctx, x, y, size);
                    }
                }
            }
        }
        
        ctx.restore();
        
        // Request next frame to support dynamic jitter animations inside editor
        requestAnimationFrame(() => this.render());
    }
};

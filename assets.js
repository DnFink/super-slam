/* ==========================================================================
   Super Owen - Dynamic Marker Sketch Asset Renderer
   ========================================================================== */

// Global configuration for sketch drawing
const SketchConfig = {
    jitter: 1.5,
    vibrationSpeed: 100, // Speed of vibration in ms
};

/**
 * Returns a time-dependent index to animate hand-drawn lines (vibration).
 */
function getJitterTimeIndex() {
    return Math.floor(Date.now() / SketchConfig.vibrationSpeed) % 2;
}

/**
 * Draws a jittery, sketchy line between two points.
 */
function drawSketchLine(ctx, x1, y1, x2, y2, color, width = 2, jitterAmt = SketchConfig.jitter) {
    const timeIndex = getJitterTimeIndex();
    
    // Draw twice for a sketchy, overlapping pen look
    for (let pass = 0; pass < 2; pass++) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) continue;
        
        const segments = Math.max(2, Math.floor(distance / 8));
        
        ctx.moveTo(x1, y1);
        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const px = x1 + dx * t;
            const py = y1 + dy * t;
            
            // Generate deterministic but sketchy random offsets
            const seed = (i * 123.45 + pass * 67.8 + timeIndex * 99.1);
            const jx = Math.sin(seed) * jitterAmt;
            const jy = Math.cos(seed * 0.8) * jitterAmt;
            
            ctx.lineTo(px + jx, py + jy);
        }
        
        // Add a slight overshoot for hand-drawn authenticity
        const seedEnd = (pass * 22.3 + timeIndex * 44.1);
        const overX = (dx / distance) * (Math.sin(seedEnd) * jitterAmt * 1.5);
        const overY = (dy / distance) * (Math.cos(seedEnd) * jitterAmt * 1.5);
        ctx.lineTo(x2 + overX, y2 + overY);
        
        ctx.stroke();
    }
}

/**
 * Draws a sketchy rectangle, optionally filled with marker-like hatch patterns.
 */
function drawSketchRect(ctx, x, y, w, h, strokeColor, fillColor = null, width = 2, jitterAmt = SketchConfig.jitter, fillStyle = 'marker') {
    // Fill background first if requested
    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
        
        // Dynamic marker cross-hatching
        if (fillStyle === 'marker') {
            ctx.save();
            ctx.beginPath();
            ctx.rect(x + 2, y + 2, w - 4, h - 4);
            ctx.clip();
            
            const spacing = 8;
            for (let i = -h; i < w; i += spacing) {
                drawSketchLine(ctx, x + i, y, x + i + h, y + h, fillColor, 1, jitterAmt * 0.7);
            }
            ctx.restore();
        }
    }
    
    // Draw sketchy perimeter lines
    if (strokeColor) {
        drawSketchLine(ctx, x, y, x + w, y, strokeColor, width, jitterAmt);
        drawSketchLine(ctx, x + w, y, x + w, y + h, strokeColor, width, jitterAmt);
        drawSketchLine(ctx, x + w, y + h, x, y + h, strokeColor, width, jitterAmt);
        drawSketchLine(ctx, x, y + h, x, y, strokeColor, width, jitterAmt);
    }
}

/**
 * Draws a sketchy circle/oval.
 */
function drawSketchCircle(ctx, cx, cy, r, strokeColor, fillColor = null, width = 2, jitterAmt = SketchConfig.jitter) {
    const timeIndex = getJitterTimeIndex();
    
    // Draw fill first
    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(0.1, r * 0.9), 0, Math.PI * 2);
        ctx.fill();
        
        // Marker hatches inside circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(0.1, r * 0.8), 0, Math.PI * 2);
        ctx.clip();
        
        const spacing = 6;
        for (let i = -r * 2; i < r * 2; i += spacing) {
            drawSketchLine(ctx, cx + i, cy - r, cx + i + r * 2, cy + r, fillColor, 1, jitterAmt * 0.5);
        }
        ctx.restore();
    }
    
    // Draw strokes
    if (strokeColor) {
        for (let pass = 0; pass < 2; pass++) {
            ctx.beginPath();
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = width;
            
            const segments = Math.max(8, Math.floor(r * 2));
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const seed = (i * 88.5 + pass * 45.2 + timeIndex * 33.1);
                const currR = Math.max(0.1, r + Math.sin(seed) * (jitterAmt * 0.6));
                
                const px = cx + Math.cos(angle) * currR;
                const py = cy + Math.sin(angle) * currR;
                
                if (i === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.stroke();
        }
    }
}

/**
 * Draws a sketchy Bezier curve.
 */
function drawSketchBezier(ctx, x1, y1, cx1, cy1, cx2, cy2, x2, y2, color, width = 2, jitterAmt = SketchConfig.jitter) {
    const timeIndex = getJitterTimeIndex();
    
    for (let pass = 0; pass < 2; pass++) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        
        const segments = 16;
        ctx.moveTo(x1, y1);
        
        for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            
            // Standard cubic bezier calculation
            const u = 1 - t;
            const tt = t * t;
            const uu = u * u;
            const uuu = uu * u;
            const ttt = tt * t;
            
            let px = uuu * x1 + 3 * uu * t * cx1 + 3 * u * tt * cx2 + ttt * x2;
            let py = uuu * y1 + 3 * uu * t * cy1 + 3 * u * tt * cy2 + ttt * y2;
            
            const seed = (i * 155.3 + pass * 22.1 + timeIndex * 87.2);
            px += Math.sin(seed) * jitterAmt;
            py += Math.cos(seed * 0.8) * jitterAmt;
            
            ctx.lineTo(px, py);
        }
        ctx.stroke();
    }
}

/* ==========================================================================
   GAME SPRITE DRAWING FUNCTIONS
   ========================================================================== */

/**
 * Draws the Main Hero "Owen" (Blue Wind-up Bomb)
 */
function drawOwen(ctx, x, y, w, h, isWalking = false, walkFrame = 0, facingRight = true) {
    ctx.save();
    
    // Scale & Translate to center the character in the bounds
    ctx.translate(x + w / 2, y + h / 2);
    if (!facingRight) {
        ctx.scale(-1, 1);
    }
    
    const scale = Math.min(w / 32, h / 32);
    ctx.scale(scale, scale);
    
    const timeIndex = getJitterTimeIndex();
    
    // 1. Draw Winding Key on the Back (rotating when walking)
    ctx.save();
    ctx.translate(-14, 0); // Position key behind the body
    let keyAngle = 0;
    if (isWalking) {
        keyAngle = (walkFrame * 22.5) * Math.PI / 180;
    } else {
        keyAngle = Math.sin(Date.now() / 300) * 0.2;
    }
    ctx.rotate(keyAngle);
    
    // Sketched Golden Key Shaft and Loops
    drawSketchRect(ctx, 0, -2, 10, 4, "#ffb300", "#ffd700", 1.5, 0.8);
    drawSketchCircle(ctx, 10, -5, 6, "#ffb300", "#ffd700", 1.5, 0.8);
    drawSketchCircle(ctx, 10, 5, 6, "#ffb300", "#ffd700", 1.5, 0.8);
    ctx.restore();
    
    // 2. Draw Yellow Feet (walking animation)
    ctx.save();
    let leftFootY = 12;
    let rightFootY = 12;
    let leftFootX = -6;
    let rightFootX = 6;
    
    if (isWalking) {
        const offset = Math.sin(walkFrame * 0.5) * 4;
        leftFootY += offset;
        rightFootY -= offset;
        leftFootX -= offset * 0.5;
        rightFootX += offset * 0.5;
    }
    
    // Draw feet as sketchy yellow ellipses/circles
    drawSketchCircle(ctx, leftFootX, leftFootY, 5, "#cca300", "#ffeb3b", 1.5, 0.8);
    drawSketchCircle(ctx, rightFootX, rightFootY, 5, "#cca300", "#ffeb3b", 1.5, 0.8);
    ctx.restore();

    // 3. Draw Top Fuse/Wick
    drawSketchLine(ctx, 0, -14, 0, -20, "#333", 2, 0.8);
    // Draw tiny sparking orange flame
    const flameSize = 3 + Math.sin(Date.now() / 50) * 1.5;
    drawSketchCircle(ctx, 0, -22, flameSize, "#ff3d00", "#ff9100", 1, 1);
    
    // 4. Draw Main Blue Body (egg/teardrop shape)
    // Draw custom path for Bob-omb egg body
    const bodyColor = "#0062cc";
    const bodyFill = "#0091ff";
    drawSketchCircle(ctx, 0, 0, 13, bodyColor, bodyFill, 2, SketchConfig.jitter);
    
    // 5. Draw Cute Face (White Cheeks, Big White Eyes, Black pupils)
    // Cheeks
    drawSketchCircle(ctx, -5, 3, 5, "rgba(0,0,0,0)", "rgba(255,255,255,0.7)", 1, 0.5);
    drawSketchCircle(ctx, 5, 3, 5, "rgba(0,0,0,0)", "rgba(255,255,255,0.7)", 1, 0.5);
    
    // Eyes (Two vertical ovals)
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(-4, -3, 3, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(4, -3, 3, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Pupils
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(-4, -3, 1.2, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(4, -3, 1.2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Smiley mouth (curly mustachioed shape)
    drawSketchBezier(ctx, -6, 4, -3, 7, 3, 7, 6, 4, "#000", 2, 0.5);
    
    ctx.restore();
}

/**
 * Draws Driver Owen (Red racing suit, white helmet)
 */
function drawDriver(ctx, x, y, w, h, isWalking = false, walkFrame = 0, facingRight = true) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    if (!facingRight) ctx.scale(-1, 1);
    const scale = Math.min(w / 32, h / 32);
    ctx.scale(scale, scale);
    const bob = isWalking ? Math.sin(walkFrame * 0.5) * 2 : 0;
    
    // Feet
    let leftFootY = 12, rightFootY = 12;
    if (isWalking) {
        const offset = Math.sin(walkFrame * 0.5) * 4;
        leftFootY += offset; rightFootY -= offset;
    }
    drawSketchCircle(ctx, -5, leftFootY, 4, "#212121", "#424242", 1.5, 0.8);
    drawSketchCircle(ctx, 5, rightFootY, 4, "#212121", "#424242", 1.5, 0.8);
    
    // Body (Red Racing Suit)
    drawSketchRect(ctx, -7, 0 + bob, 14, 12, "#b71c1c", "#e53935", 2, 1);
    
    // Arms
    let armAngle = isWalking ? Math.sin(walkFrame * 0.5) * 0.5 : 0.2;
    ctx.save(); ctx.translate(-7, 2 + bob); ctx.rotate(armAngle);
    drawSketchRect(ctx, -6, -2, 6, 4, "#b71c1c", "#e53935", 1.5, 0.8);
    drawSketchCircle(ctx, -6, 0, 2.5, "#fff", "#fff", 1.5, 0.8); // White glove
    ctx.restore();
    
    ctx.save(); ctx.translate(7, 2 + bob); ctx.rotate(-armAngle);
    drawSketchRect(ctx, 0, -2, 6, 4, "#b71c1c", "#e53935", 1.5, 0.8);
    drawSketchCircle(ctx, 6, 0, 2.5, "#fff", "#fff", 1.5, 0.8); // White glove
    ctx.restore();
    
    // Head & Helmet
    drawSketchCircle(ctx, 0, -8 + bob, 8, "#e0e0e0", "#ffffff", 2, 0.8); // White helmet
    // Visor opening (showing peach face)
    drawSketchRect(ctx, 0, -11 + bob, 8, 6, "#ff8a65", "#ffcc80", 1.5, 0.5);
    // Eye
    drawSketchCircle(ctx, 4, -9 + bob, 1.5, "#000", "#000", 1, 0.5);
    
    ctx.restore();
}

/**
 * Draws Astronaut Owen (Red/white space suit, glass bubble)
 */
function drawAstronaut(ctx, x, y, w, h, isWalking = false, walkFrame = 0, facingRight = true) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    if (!facingRight) ctx.scale(-1, 1);
    const scale = Math.min(w / 32, h / 32);
    ctx.scale(scale, scale);
    const bob = isWalking ? Math.sin(walkFrame * 0.5) * 2 : 0;
    
    // Feet
    let leftFootY = 12, rightFootY = 12;
    if (isWalking) {
        const offset = Math.sin(walkFrame * 0.5) * 4;
        leftFootY += offset; rightFootY -= offset;
    }
    drawSketchCircle(ctx, -6, leftFootY, 4.5, "#9e9e9e", "#e0e0e0", 1.5, 0.8);
    drawSketchCircle(ctx, 6, rightFootY, 4.5, "#9e9e9e", "#e0e0e0", 1.5, 0.8);
    
    // Body (Bulky White Suit with Red Accents)
    drawSketchRect(ctx, -8, 0 + bob, 16, 12, "#b71c1c", "#ffffff", 2, 1);
    drawSketchRect(ctx, -4, 2 + bob, 8, 8, "#b71c1c", "#e53935", 1.5, 0.8); // Red chest panel
    
    // Arms
    let armAngle = isWalking ? Math.sin(walkFrame * 0.5) * 0.5 : 0.2;
    ctx.save(); ctx.translate(-8, 2 + bob); ctx.rotate(armAngle);
    drawSketchRect(ctx, -7, -2.5, 7, 5, "#b71c1c", "#ffffff", 1.5, 0.8);
    drawSketchCircle(ctx, -7, 0, 3, "#b71c1c", "#e53935", 1.5, 0.8); // Red glove
    ctx.restore();
    
    ctx.save(); ctx.translate(8, 2 + bob); ctx.rotate(-armAngle);
    drawSketchRect(ctx, 0, -2.5, 7, 5, "#b71c1c", "#ffffff", 1.5, 0.8);
    drawSketchCircle(ctx, 7, 0, 3, "#b71c1c", "#e53935", 1.5, 0.8); // Red glove
    ctx.restore();
    
    // Head inside bubble
    drawSketchCircle(ctx, 0, -10 + bob, 6, "#ff8a65", "#ffcc80", 1.5, 0.5); // Peach face
    drawSketchCircle(ctx, 3, -11 + bob, 1.5, "#000", "#000", 1, 0.5); // Eye
    
    // Glass Bubble Helmet
    drawSketchCircle(ctx, 0, -10 + bob, 10, "#64b5f6", "rgba(187, 222, 251, 0.4)", 2, 0.5);
    
    ctx.restore();
}

/**
 * Draws Cowboy Owen (Red shirt, brown hat)
 */
function drawCowboy(ctx, x, y, w, h, isWalking = false, walkFrame = 0, facingRight = true) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    if (!facingRight) ctx.scale(-1, 1);
    const scale = Math.min(w / 32, h / 32);
    ctx.scale(scale, scale);
    const bob = isWalking ? Math.sin(walkFrame * 0.5) * 2 : 0;
    
    // Feet
    let leftFootY = 12, rightFootY = 12;
    if (isWalking) {
        const offset = Math.sin(walkFrame * 0.5) * 4;
        leftFootY += offset; rightFootY -= offset;
    }
    drawSketchCircle(ctx, -5, leftFootY, 4, "#4e342e", "#795548", 1.5, 0.8); // Brown boots
    drawSketchCircle(ctx, 5, rightFootY, 4, "#4e342e", "#795548", 1.5, 0.8);
    
    // Body (Red shirt, blue jeans)
    drawSketchRect(ctx, -7, 6 + bob, 14, 6, "#0d47a1", "#1976d2", 1.5, 0.8); // Jeans
    drawSketchRect(ctx, -7, 0 + bob, 14, 6, "#b71c1c", "#e53935", 1.5, 1); // Red shirt
    
    // Arms
    let armAngle = isWalking ? Math.sin(walkFrame * 0.5) * 0.5 : 0.2;
    ctx.save(); ctx.translate(-7, 2 + bob); ctx.rotate(armAngle);
    drawSketchRect(ctx, -6, -2, 6, 4, "#b71c1c", "#e53935", 1.5, 0.8);
    drawSketchCircle(ctx, -6, 0, 2.5, "#d84315", "#ff8a65", 1.5, 0.8); // Peach hand
    ctx.restore();
    
    ctx.save(); ctx.translate(7, 2 + bob); ctx.rotate(-armAngle);
    drawSketchRect(ctx, 0, -2, 6, 4, "#b71c1c", "#e53935", 1.5, 0.8);
    drawSketchCircle(ctx, 6, 0, 2.5, "#d84315", "#ff8a65", 1.5, 0.8);
    ctx.restore();
    
    // Head (Peach)
    drawSketchCircle(ctx, 0, -8 + bob, 7, "#ff8a65", "#ffcc80", 2, 0.8);
    drawSketchCircle(ctx, 3, -9 + bob, 1.5, "#000", "#000", 1, 0.5); // Eye
    
    // Cowboy Hat (Brown)
    drawSketchBezier(ctx, -12, -12 + bob, -6, -14 + bob, 6, -14 + bob, 12, -12 + bob, "#4e342e", 2, 0.8); // Brim
    drawSketchBezier(ctx, -6, -13 + bob, -4, -20 + bob, 4, -20 + bob, 6, -13 + bob, "#4e342e", 2, 0.8); // Top
    
    ctx.restore();
}

/**
 * Draws Eagle Power-up Form
 */
function drawEagle(ctx, x, y, w, h, isWalking = false, walkFrame = 0, facingRight = true) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    if (!facingRight) ctx.scale(-1, 1);
    
    // Eagle is a bit larger
    const scale = Math.min(w / 40, h / 40);
    ctx.scale(scale, scale);
    const bob = isWalking ? Math.sin(walkFrame * 0.5) * 3 : Math.sin(Date.now() / 200) * 2; // Hover bob
    
    // Tail feathers
    drawSketchBezier(ctx, -12, 6 + bob, -18, 10 + bob, -16, 14 + bob, -8, 10 + bob, "#4e342e", 2, 0.8);
    
    // Wings (flapping based on bob/walkFrame)
    let flapAngle = isWalking ? Math.sin(walkFrame * 1.5) * 0.8 : Math.sin(Date.now() / 150) * 0.5;
    
    // Back Wing
    ctx.save(); ctx.translate(-4, -4 + bob); ctx.rotate(-flapAngle);
    drawSketchBezier(ctx, 0, 0, -6, -12, 6, -16, 12, -4, "#4e342e", 2, 0.8);
    ctx.restore();
    
    // Body (Brown)
    drawSketchCircle(ctx, -2, 4 + bob, 10, "#4e342e", "#795548", 2, 0.8);
    
    // Head (White)
    drawSketchCircle(ctx, 8, -2 + bob, 7, "#e0e0e0", "#ffffff", 2, 0.8);
    
    // Yellow Beak
    ctx.fillStyle = "#fbc02d";
    ctx.beginPath();
    ctx.moveTo(14, -4 + bob);
    ctx.lineTo(20, -1 + bob);
    ctx.lineTo(13, 2 + bob);
    ctx.fill();
    ctx.strokeStyle = "#f57f17";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Eye
    drawSketchCircle(ctx, 10, -3 + bob, 1.5, "#000", "#000", 1, 0.5);
    
    // Front Wing
    ctx.save(); ctx.translate(0, 0 + bob); ctx.rotate(flapAngle);
    drawSketchBezier(ctx, -2, 0, -10, -14, 8, -18, 14, -2, "#5d4037", 2, 0.8);
    ctx.restore();
    
    ctx.restore();
}

/**
 * Draws Princess Owen (Pink dress, tiara, fairy wings)
 */
function drawPrincess(ctx, x, y, w, h, isWalking = false, walkFrame = 0, facingRight = true) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    if (!facingRight) ctx.scale(-1, 1);
    const scale = Math.min(w / 32, h / 32);
    ctx.scale(scale, scale);
    const bob = isWalking ? Math.sin(walkFrame * 0.5) * 2 : 0;
    
    // Wings (Fluttering)
    let wingAngle = isWalking ? Math.sin(walkFrame * 1.5) * 0.5 : Math.sin(Date.now() / 200) * 0.2;
    ctx.save(); ctx.translate(-6, -4 + bob); ctx.rotate(-wingAngle);
    drawSketchBezier(ctx, 0, 0, -8, -10, 4, -16, 8, -2, "#81d4fa", 1.5, 0.5); // Top wing
    drawSketchBezier(ctx, 0, 0, -10, 2, -4, 12, 6, 4, "#81d4fa", 1.5, 0.5);   // Bottom wing
    ctx.restore();
    
    // Feet
    let leftFootY = 12, rightFootY = 12;
    if (isWalking) {
        const offset = Math.sin(walkFrame * 0.5) * 4;
        leftFootY += offset; rightFootY -= offset;
    }
    drawSketchCircle(ctx, -5, leftFootY, 3.5, "#e91e63", "#f48fb1", 1.5, 0.8); // Pink shoes
    drawSketchCircle(ctx, 5, rightFootY, 3.5, "#e91e63", "#f48fb1", 1.5, 0.8);
    
    // Body (Pink Dress)
    drawSketchBezier(ctx, 0, -4 + bob, -12, 10 + bob, 12, 10 + bob, 0, -4 + bob, "#c2185b", 2, 1);
    ctx.fillStyle = "#e91e63";
    ctx.fill();
    
    // Arms
    let armAngle = isWalking ? Math.sin(walkFrame * 0.5) * 0.5 : 0.2;
    ctx.save(); ctx.translate(-6, 2 + bob); ctx.rotate(armAngle);
    drawSketchRect(ctx, -5, -1.5, 5, 3, "#c2185b", "#e91e63", 1.5, 0.8);
    drawSketchCircle(ctx, -5, 0, 2, "#ffcc80", "#ffe0b2", 1.5, 0.8); // Peach hand
    ctx.restore();
    
    ctx.save(); ctx.translate(6, 2 + bob); ctx.rotate(-armAngle);
    drawSketchRect(ctx, 0, -1.5, 5, 3, "#c2185b", "#e91e63", 1.5, 0.8);
    drawSketchCircle(ctx, 5, 0, 2, "#ffcc80", "#ffe0b2", 1.5, 0.8);
    
    // Star Wand
    ctx.save(); ctx.translate(5, 0); ctx.rotate(0.5);
    drawSketchLine(ctx, 0, 0, 0, -10, "#fff59d", 2, 0.5);
    drawSketchCircle(ctx, 0, -12, 3, "#fbc02d", "#fff176", 1.5, 0.5);
    ctx.restore();
    ctx.restore();
    
    // Head (Peach)
    drawSketchCircle(ctx, 0, -8 + bob, 7, "#ff8a65", "#ffcc80", 2, 0.8);
    drawSketchCircle(ctx, 3, -9 + bob, 1.5, "#000", "#000", 1, 0.5); // Eye
    
    // Hair (Blonde)
    drawSketchBezier(ctx, -7, -8 + bob, -10, 0 + bob, -4, 4 + bob, -6, -4 + bob, "#fbc02d", 2, 0.8);
    
    // Tiara
    drawSketchBezier(ctx, -4, -14 + bob, 0, -18 + bob, 4, -14 + bob, 0, -14 + bob, "#f57f17", 1.5, 0.5);
    
    ctx.restore();
}

/**
 * Draws Ninja Owen (Dark purple suit, mask, ponytail)
 */
function drawNinja(ctx, x, y, w, h, isWalking = false, walkFrame = 0, facingRight = true) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    if (!facingRight) ctx.scale(-1, 1);
    const scale = Math.min(w / 32, h / 32);
    ctx.scale(scale, scale);
    const bob = isWalking ? Math.sin(walkFrame * 0.5) * 2 : 0;
    
    // Katana on back
    drawSketchLine(ctx, -10, -12 + bob, 8, 8 + bob, "#9e9e9e", 2, 0.5);
    drawSketchLine(ctx, -10, -12 + bob, -6, -8 + bob, "#212121", 3, 0.5); // Hilt
    
    // Feet
    let leftFootY = 12, rightFootY = 12;
    if (isWalking) {
        const offset = Math.sin(walkFrame * 0.5) * 4;
        leftFootY += offset; rightFootY -= offset;
    }
    drawSketchCircle(ctx, -5, leftFootY, 3.5, "#212121", "#424242", 1.5, 0.8); // Dark shoes
    drawSketchCircle(ctx, 5, rightFootY, 3.5, "#212121", "#424242", 1.5, 0.8);
    
    // Body (Dark Purple Suit)
    drawSketchRect(ctx, -6, 0 + bob, 12, 10, "#311b92", "#4527a0", 2, 1);
    // Red belt
    drawSketchRect(ctx, -6, 6 + bob, 12, 2, "#b71c1c", "#e53935", 1, 0.5);
    
    // Arms
    let armAngle = isWalking ? Math.sin(walkFrame * 0.5) * 0.6 : 0.3;
    ctx.save(); ctx.translate(-6, 2 + bob); ctx.rotate(armAngle);
    drawSketchRect(ctx, -5, -1.5, 5, 3, "#311b92", "#4527a0", 1.5, 0.8);
    drawSketchCircle(ctx, -5, 0, 2, "#ffcc80", "#ffe0b2", 1.5, 0.8);
    ctx.restore();
    
    ctx.save(); ctx.translate(6, 2 + bob); ctx.rotate(-armAngle);
    drawSketchRect(ctx, 0, -1.5, 5, 3, "#311b92", "#4527a0", 1.5, 0.8);
    drawSketchCircle(ctx, 5, 0, 2, "#ffcc80", "#ffe0b2", 1.5, 0.8);
    ctx.restore();
    
    // Head (Masked)
    drawSketchCircle(ctx, 0, -8 + bob, 7, "#311b92", "#4527a0", 2, 0.8);
    // Eye slit
    drawSketchRect(ctx, 0, -11 + bob, 6, 4, "#ff8a65", "#ffcc80", 1, 0.3);
    drawSketchCircle(ctx, 3, -9 + bob, 1.2, "#000", "#000", 1, 0.5); // Eye
    
    // Ponytail
    let tailAngle = isWalking ? Math.sin(walkFrame * 1.5) * 0.5 : 0;
    ctx.save(); ctx.translate(-6, -10 + bob); ctx.rotate(tailAngle);
    drawSketchBezier(ctx, 0, 0, -8, -4, -10, 6, -12, 4, "#311b92", 2, 0.8);
    ctx.restore();
    
    ctx.restore();
}

/**
 * Draws Fox Owen (Orange fur, bushy tail, big ears)
 */
function drawFox(ctx, x, y, w, h, isWalking = false, walkFrame = 0, facingRight = true) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    if (!facingRight) ctx.scale(-1, 1);
    const scale = Math.min(w / 32, h / 32);
    ctx.scale(scale, scale);
    const bob = isWalking ? Math.sin(walkFrame * 0.5) * 2 : 0;
    
    // Bushy Tail
    let tailAngle = isWalking ? Math.sin(walkFrame * 0.5) * 0.5 : Math.sin(Date.now() / 300) * 0.2;
    ctx.save(); ctx.translate(-6, 6 + bob); ctx.rotate(-tailAngle);
    drawSketchBezier(ctx, 0, 0, -12, -8, -20, 4, -18, 12, "#e65100", 2, 1);
    ctx.fillStyle = "#ff9800"; ctx.fill();
    // White tip
    drawSketchCircle(ctx, -16, 8, 4, "rgba(0,0,0,0)", "#fff", 1, 0.5);
    ctx.restore();
    
    // Feet
    let leftFootY = 12, rightFootY = 12;
    if (isWalking) {
        const offset = Math.sin(walkFrame * 0.5) * 4;
        leftFootY += offset; rightFootY -= offset;
    }
    drawSketchCircle(ctx, -5, leftFootY, 3.5, "#3e2723", "#4e342e", 1.5, 0.8); // Dark paws
    drawSketchCircle(ctx, 5, rightFootY, 3.5, "#3e2723", "#4e342e", 1.5, 0.8);
    
    // Body (Orange Fur)
    drawSketchRect(ctx, -6, 0 + bob, 12, 10, "#e65100", "#ff9800", 2, 1);
    // White Belly
    drawSketchRect(ctx, -2, 2 + bob, 8, 8, "rgba(0,0,0,0)", "#fff", 1, 0.5);
    
    // Arms
    let armAngle = isWalking ? Math.sin(walkFrame * 0.5) * 0.5 : 0.2;
    ctx.save(); ctx.translate(-6, 2 + bob); ctx.rotate(armAngle);
    drawSketchRect(ctx, -5, -1.5, 5, 3, "#e65100", "#ff9800", 1.5, 0.8);
    drawSketchCircle(ctx, -5, 0, 2, "#3e2723", "#4e342e", 1.5, 0.8); // Dark paw
    ctx.restore();
    
    ctx.save(); ctx.translate(6, 2 + bob); ctx.rotate(-armAngle);
    drawSketchRect(ctx, 0, -1.5, 5, 3, "#e65100", "#ff9800", 1.5, 0.8);
    drawSketchCircle(ctx, 5, 0, 2, "#3e2723", "#4e342e", 1.5, 0.8);
    ctx.restore();
    
    // Head (Orange)
    drawSketchCircle(ctx, 0, -8 + bob, 7, "#e65100", "#ff9800", 2, 0.8);
    // White muzzle area
    drawSketchCircle(ctx, 3, -6 + bob, 4, "rgba(0,0,0,0)", "#fff", 1, 0.5);
    drawSketchCircle(ctx, 6, -6 + bob, 1.5, "#000", "#000", 1, 0.5); // Nose
    drawSketchCircle(ctx, 2, -9 + bob, 1.5, "#000", "#000", 1, 0.5); // Eye
    
    // Pointy Ears
    drawSketchBezier(ctx, -5, -13 + bob, -8, -20 + bob, -2, -18 + bob, -1, -14 + bob, "#e65100", 1.5, 0.5);
    ctx.fillStyle = "#ff9800"; ctx.fill();
    drawSketchBezier(ctx, 1, -14 + bob, 4, -20 + bob, 8, -18 + bob, 5, -13 + bob, "#e65100", 1.5, 0.5);
    ctx.fillStyle = "#ff9800"; ctx.fill();
    
    ctx.restore();
}

/**
 * Draws Gorilla Owen (Dark fur, big silver chest)
 */
function drawGorilla(ctx, x, y, w, h, isWalking = false, walkFrame = 0, facingRight = true) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    if (!facingRight) ctx.scale(-1, 1);
    const scale = Math.min(w / 32, h / 32);
    ctx.scale(scale, scale);
    const bob = isWalking ? Math.sin(walkFrame * 0.5) * 2 : 0;
    
    // Feet (Short stubby legs)
    let leftFootY = 12, rightFootY = 12;
    if (isWalking) {
        const offset = Math.sin(walkFrame * 0.5) * 4;
        leftFootY += offset; rightFootY -= offset;
    }
    drawSketchCircle(ctx, -6, leftFootY, 4, "#212121", "#424242", 1.5, 0.8);
    drawSketchCircle(ctx, 6, rightFootY, 4, "#212121", "#424242", 1.5, 0.8);
    
    // Body (Bulky dark brown/black fur)
    drawSketchRect(ctx, -9, -2 + bob, 18, 14, "#212121", "#3e2723", 2, 1);
    // Silverback / Gray chest
    drawSketchRect(ctx, -5, 2 + bob, 10, 8, "rgba(0,0,0,0)", "#9e9e9e", 1, 0.5);
    // Pec lines
    drawSketchLine(ctx, -5, 6 + bob, 5, 6 + bob, "#757575", 1.5, 0.5);
    drawSketchLine(ctx, 0, 2 + bob, 0, 10 + bob, "#757575", 1.5, 0.5);
    
    // Big Arms
    let armAngle = isWalking ? Math.sin(walkFrame * 0.5) * 0.7 : 0.4;
    
    // Back arm
    ctx.save(); ctx.translate(-8, 0 + bob); ctx.rotate(armAngle);
    drawSketchRect(ctx, -4, -2, 4, 10, "#212121", "#3e2723", 1.5, 0.8);
    drawSketchCircle(ctx, -2, 9, 3, "#212121", "#424242", 1.5, 0.8); // Fist
    ctx.restore();
    
    // Front arm
    ctx.save(); ctx.translate(8, 0 + bob); ctx.rotate(-armAngle);
    drawSketchRect(ctx, 0, -2, 4, 10, "#212121", "#3e2723", 1.5, 0.8);
    drawSketchCircle(ctx, 2, 9, 3, "#212121", "#424242", 1.5, 0.8); // Fist
    ctx.restore();
    
    // Head (Large, sits low on body)
    drawSketchCircle(ctx, 0, -6 + bob, 6, "#212121", "#3e2723", 2, 0.8);
    // Brow ridge
    drawSketchLine(ctx, -4, -8 + bob, 6, -8 + bob, "#212121", 2, 0.5);
    // Face (Grayish)
    drawSketchRect(ctx, 0, -7 + bob, 6, 6, "rgba(0,0,0,0)", "#9e9e9e", 1, 0.5);
    // Eye
    drawSketchCircle(ctx, 3, -6 + bob, 1.2, "#000", "#000", 1, 0.5);
    
    ctx.restore();
}

/* ==========================================================================
   BLOCK TYPES RENDERERS
   ========================================================================== */

/**
 * Draws a Yellow Question Mark `?` Block
 */
function drawQuestionBlock(ctx, x, y, w, h, isHit = false) {
    const colorBg = isHit ? "#8d6e63" : "#fbc02d";
    const colorBorder = isHit ? "#4e342e" : "#e65100";
    const colorText = isHit ? "#5d4037" : "#000000";
    
    // Main block base
    drawSketchRect(ctx, x, y, w, h, colorBorder, colorBg, 2, SketchConfig.jitter);
    
    // Inside details: 4 small corner rivets
    const offset = 4;
    drawSketchCircle(ctx, x + offset, y + offset, 1.5, colorBorder, null, 1, 0.5);
    drawSketchCircle(ctx, x + w - offset, y + offset, 1.5, colorBorder, null, 1, 0.5);
    drawSketchCircle(ctx, x + offset, y + h - offset, 1.5, colorBorder, null, 1, 0.5);
    drawSketchCircle(ctx, x + w - offset, y + h - offset, 1.5, colorBorder, null, 1, 0.5);
    
    if (!isHit) {
        // Draw the iconic hand-drawn question mark
        ctx.save();
        ctx.font = "bold 26px 'Fredoka', cursive";
        ctx.fillStyle = colorText;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("?", x + w / 2, y + h / 2 - 2);
        ctx.restore();
    }
}

/**
 * Draws a breakable brown grid brick block
 */
function drawBrickBlock(ctx, x, y, w, h) {
    // Brick base
    drawSketchRect(ctx, x, y, w, h, "#4e342e", "#8d6e63", 2, SketchConfig.jitter);
    
    // Draw horizontal brick lines
    drawSketchLine(ctx, x, y + h/2, x + w, y + h/2, "#4e342e", 1.5, 0.8);
    
    // Draw vertical brick lines
    drawSketchLine(ctx, x + w/4, y, x + w/4, y + h/2, "#4e342e", 1.5, 0.8);
    drawSketchLine(ctx, x + 3*w/4, y, x + 3*w/4, y + h/2, "#4e342e", 1.5, 0.8);
    
    drawSketchLine(ctx, x + w/2, y + h/2, x + w/2, y + h, "#4e342e", 1.5, 0.8);
}

/**
 * Draws a solid brown grid stone block
 */
function drawSolidBlock(ctx, x, y, w, h) {
    drawSketchRect(ctx, x, y, w, h, "#37474f", "#78909c", 2, SketchConfig.jitter);
    
    // Inside cross hatch for solid rocky grid look
    drawSketchLine(ctx, x, y, x + w, y + h, "#37474f", 1.2, 0.8);
    drawSketchLine(ctx, x + w, y, x, y + h, "#37474f", 1.2, 0.8);
}

/**
 * Draws a red diagonal-crossed girders/platforms
 */
function drawRedCrossHatchPlatform(ctx, x, y, w, h) {
    // Top border
    drawSketchRect(ctx, x, y, w, h, "#b71c1c", "#ff8a80", 1.5, SketchConfig.jitter, 'solid');
    
    // Diagonal latticing inside
    const steps = 4;
    const stepW = w / steps;
    for (let i = 0; i < steps; i++) {
        drawSketchLine(ctx, x + i * stepW, y, x + (i + 1) * stepW, y + h, "#b71c1c", 1.5, 0.8);
        drawSketchLine(ctx, x + (i + 1) * stepW, y, x + i * stepW, y + h, "#b71c1c", 1.5, 0.8);
    }
}

/**
 * Draws a golden pyramid block
 */
function drawGoldenPyramidBlock(ctx, x, y, w, h) {
    drawSketchRect(ctx, x, y, w, h, "#f57f17", "#fbc02d", 2, SketchConfig.jitter);
    
    // Drawn with concentric squares to look tiered
    drawSketchRect(ctx, x + 4, y + 4, w - 8, h - 8, "#f57f17", null, 1.2, 0.6);
    drawSketchRect(ctx, x + 8, y + 8, w - 16, h - 16, "#f57f17", null, 1, 0.4);
}

/* ==========================================================================
   INTERACTIVE PIPES / TUBES
   ========================================================================== */

/**
 * Draws pipe top (lip/rim)
 */
function drawPipeTop(ctx, x, y, w, h) {
    drawSketchRect(ctx, x, y, w, h, "#1b5e20", "#4caf50", 2.5, SketchConfig.jitter);
    // Draw shading highlight line (a sketchy white line on left)
    drawSketchLine(ctx, x + 6, y + 2, x + 6, y + h - 2, "#a5d6a7", 2, 0.8);
}

/**
 * Draws pipe body
 */
function drawPipeBody(ctx, x, y, w, h) {
    drawSketchRect(ctx, x, y, w, h, "#1b5e20", "#4caf50", 2.5, SketchConfig.jitter);
    // Draw shading highlight line
    drawSketchLine(ctx, x + 8, y, x + 8, y + h, "#a5d6a7", 2.5, 0.8);
}

/* ==========================================================================
   ENEMIES AND HAZARDS
   ========================================================================== */

/**
 * Draws a Trapping Plant / Piranha Chomper (Snapping jaws in green pot/pipe)
 */
function drawPiranhaPlant(ctx, x, y, w, h, openRatio = 0.5) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    
    const scale = Math.min(w / 32, h / 48);
    ctx.scale(scale, scale);
    
    const bob = Math.sin(Date.now() / 150) * 1.5;
    
    // Stem
    drawSketchRect(ctx, -3, 4 + bob, 6, 20, "#1b5e20", "#4caf50", 2, 0.8);
    // Green leaves
    drawSketchCircle(ctx, -8, 12 + bob, 4, "#1b5e20", "#4caf50", 1.5, 0.8);
    drawSketchCircle(ctx, 8, 14 + bob, 4, "#1b5e20", "#4caf50", 1.5, 0.8);
    
    // Draw Snapping Red Bulb Head
    ctx.save();
    ctx.translate(0, -10 + bob);
    
    // Calculate jaw angles based on openRatio
    const jawAngle = openRatio * 0.45;
    
    // Top Jaw
    ctx.save();
    ctx.rotate(-jawAngle);
    drawSketchCircle(ctx, 0, -5, 10, "#b71c1c", "#e53935", 2, 1);
    // White polka spots
    drawSketchCircle(ctx, -4, -8, 2.5, "rgba(0,0,0,0)", "#fff", 1, 0.5);
    drawSketchCircle(ctx, 3, -6, 2, "rgba(0,0,0,0)", "#fff", 1, 0.5);
    // White sharp triangular teeth
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(-7, 0); ctx.lineTo(-5, -4); ctx.lineTo(-3, 0);
    ctx.moveTo(-3, 0); ctx.lineTo(-1, -5); ctx.lineTo(1, 0);
    ctx.moveTo(1, 0); ctx.lineTo(4, -4); ctx.lineTo(7, 0);
    ctx.fill();
    ctx.restore();
    
    // Bottom Jaw
    ctx.save();
    ctx.rotate(jawAngle);
    drawSketchCircle(ctx, 0, 5, 10, "#b71c1c", "#e53935", 2, 1);
    // White spot
    drawSketchCircle(ctx, -3, 8, 2, "rgba(0,0,0,0)", "#fff", 1, 0.5);
    // Bottom teeth
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(-6, 0); ctx.lineTo(-4, 4); ctx.lineTo(-2, 0);
    ctx.moveTo(-2, 0); ctx.lineTo(0, 5); ctx.lineTo(2, 0);
    ctx.moveTo(2, 0); ctx.lineTo(5, 4); ctx.lineTo(7, 0);
    ctx.fill();
    ctx.restore();
    
    ctx.restore();
    ctx.restore();
}

/**
 * Draws a bouncing Fireball enemy
 */
function drawFireball(ctx, x, y, w, h, animTimer = 0) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    
    // Rotate as it rolls
    ctx.rotate(animTimer * 0.2);
    
    const scale = Math.min(w / 28, h / 28);
    ctx.scale(scale, scale);
    
    const timeIndex = getJitterTimeIndex();
    
    // Outer flame glow (jagged circle)
    ctx.beginPath();
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 10 + Math.random() * 4;
        const cx = Math.cos(angle) * radius;
        const cy = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
    }
    ctx.closePath();
    ctx.fillStyle = '#ff4400';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffaa00';
    strokeJitter(ctx, timeIndex);

    // Inner core
    ctx.beginPath();
    ctx.arc(0, 0, 6 + Math.random() * 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffff00';
    ctx.fill();
    
    ctx.restore();
}

/**
 * Draws a Walking Bomb Enemy (patrolling left/right)
 */
function drawWalkingBomb(ctx, x, y, w, h, walkFrame = 0, facingRight = true) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    if (!facingRight) {
        ctx.scale(-1, 1);
    }
    const scale = Math.min(w / 28, h / 28);
    ctx.scale(scale, scale);
    
    const timeIndex = getJitterTimeIndex();
    
    // 1. Rotating key on the back
    ctx.save();
    ctx.translate(-12, 0);
    ctx.rotate((walkFrame * 20) * Math.PI / 180);
    drawSketchRect(ctx, 0, -1.5, 8, 3, "#3e2723", "#d7ccc8", 1.2, 0.5);
    drawSketchCircle(ctx, 8, -3, 4, "#3e2723", "#d7ccc8", 1.2, 0.5);
    drawSketchCircle(ctx, 8, 3, 4, "#3e2723", "#d7ccc8", 1.2, 0.5);
    ctx.restore();
    
    // 2. Yellow/Orange walking feet
    let lY = 10, rY = 10;
    if (walkFrame % 4 < 2) {
        lY += 3; rY -= 3;
    } else {
        lY -= 3; rY += 3;
    }
    drawSketchCircle(ctx, -5, lY, 4, "#e65100", "#ffb74d", 1.2, 0.6);
    drawSketchCircle(ctx, 5, rY, 4, "#e65100", "#ffb74d", 1.2, 0.6);
    
    // 3. Black fuse top
    drawSketchLine(ctx, 0, -10, 0, -15, "#222", 2, 0.6);
    
    // 4. Main Body: Bomb (Green or Dark-Purple marker color to distinguish from hero Owen)
    drawSketchCircle(ctx, 0, 0, 11, "#1b5e20", "#388e3c", 2, SketchConfig.jitter);
    
    // 5. Angry white eyes with vertical pupils
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(-3, -3, 2.5, 4, 0.2, 0, Math.PI * 2);
    ctx.ellipse(3, -3, 2.5, 4, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Angry eyebrows
    drawSketchLine(ctx, -6, -8, -1, -5, "#000", 2, 0.5);
    drawSketchLine(ctx, 6, -8, 1, -5, "#000", 2, 0.5);
    
    // Small black pupils
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(-2.5, -3, 1, 0, Math.PI * 2);
    ctx.arc(2.5, -3, 1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

/**
 * Draws a Bullet Bill Cannon (horizontal launcher)
 */
function drawBulletCannon(ctx, x, y, w, h) {
    // Cannon Base Platform
    drawSketchRect(ctx, x, y + h - 12, w, 12, "#212121", "#424242", 2, SketchConfig.jitter);
    
    // Cannon Column
    drawSketchRect(ctx, x + 4, y + 16, w - 8, h - 28, "#212121", "#616161", 2, SketchConfig.jitter);
    
    // Spinning gear symbol or rivets on column
    drawSketchCircle(ctx, x + w / 2, y + h / 2 + 4, 6, "#212121", null, 1.5, 0.5);
    drawSketchLine(ctx, x + w / 2 - 6, y + h / 2 + 4, x + w / 2 + 6, y + h / 2 + 4, "#212121", 1, 0.5);
    
    // Cannon Launcher Top (thick lip barrel)
    drawSketchRect(ctx, x + 1, y, w - 2, 16, "#212121", "#424242", 2.5, SketchConfig.jitter);
}

/**
 * Draws a Bullet Bill torpedo (flying hazard)
 */
function drawBulletBill(ctx, x, y, w, h, facingRight = false) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    if (facingRight) {
        ctx.scale(-1, 1);
    }
    
    const scale = Math.min(w / 32, h / 24);
    ctx.scale(scale, scale);
    
    // Bullet body shape (torpedo head)
    ctx.fillStyle = "#212121";
    ctx.beginPath();
    ctx.moveTo(-16, -10);
    ctx.lineTo(6, -10);
    ctx.quadraticCurveTo(16, -10, 16, 0);
    ctx.quadraticCurveTo(16, 10, 6, 10);
    ctx.lineTo(-16, 10);
    ctx.closePath();
    ctx.fill();
    
    // Sketchy outlines
    drawSketchLine(ctx, -16, -10, 6, -10, "#000", 2, 0.8);
    drawSketchBezier(ctx, 6, -10, 15, -10, 15, 10, 6, 10, "#000", 2, 0.8);
    drawSketchLine(ctx, 6, 10, -16, 10, "#000", 2, 0.8);
    drawSketchLine(ctx, -16, 10, -16, -10, "#000", 2, 0.8);
    
    // Angry white eye
    drawSketchCircle(ctx, 6, -3, 3.5, "#000", "#fff", 1.5, 0.5);
    drawSketchLine(ctx, 2, -7, 9, -5, "#000", 2, 0.5); // angry brow
    drawSketchCircle(ctx, 6, -3, 1, "#000", "#000", 1, 0.5);
    
    // White glove/hand on side
    drawSketchCircle(ctx, -5, 2, 4, "#000", "#fff", 1.2, 0.5);
    drawSketchLine(ctx, -9, 2, -5, 2, "#000", 1.5, 0.5); // arm
    
    ctx.restore();
}

/**
 * Draws a Spikes platform (hurt hazard)
 */
function drawSpikes(ctx, x, y, w, h) {
    // Ground plate
    drawSketchRect(ctx, x, y + h - 6, w, 6, "#263238", "#455a64", 1.5, 0.8);
    
    // 4 metal spike triangles
    const count = 4;
    const spikeW = w / count;
    ctx.fillStyle = "#90a4ae";
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
        const sx = x + i * spikeW;
        ctx.moveTo(sx, y + h - 6);
        ctx.lineTo(sx + spikeW / 2, y);
        ctx.lineTo(sx + spikeW, y + h - 6);
        
        // Draw sketchy borders around spikes
        drawSketchLine(ctx, sx, y + h - 6, sx + spikeW / 2, y, "#37474f", 1.5, 0.6);
        drawSketchLine(ctx, sx + spikeW / 2, y, sx + spikeW, y + h - 6, "#37474f", 1.5, 0.6);
    }
    ctx.fill();
}

/**
 * Draws a spinning Circular Saw blade (spinning spires)
 */
function drawSawBlade(ctx, x, y, w, h, spinFrame = 0) {
    ctx.save();
    ctx.translate(x + w/2, y + h/2);
    ctx.rotate((spinFrame * 15) * Math.PI / 180);
    
    const r = w / 2 - 2;
    const innerR = r - 6;
    const timeIndex = getJitterTimeIndex();
    
    // Outer saw teeth
    ctx.fillStyle = "#cfd8dc";
    ctx.beginPath();
    const teethCount = 12;
    for (let i = 0; i < teethCount * 2; i++) {
        const angle = (i / (teethCount * 2)) * Math.PI * 2;
        const currentRadius = (i % 2 === 0) ? r : innerR;
        
        const px = Math.cos(angle) * currentRadius;
        const py = Math.sin(angle) * currentRadius;
        
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#37474f";
    ctx.lineWidth = 1.8;
    ctx.stroke();
    
    // Inner circular grid center
    drawSketchCircle(ctx, 0, 0, 6, "#37474f", "#78909c", 1.5, 0.5);
    
    ctx.restore();
}

/**
 * Draws a Fire Bar / fireball element
 */
function drawFireball(ctx, x, y, r) {
    // Red outer glow, orange center, yellow core
    drawSketchCircle(ctx, x, y, r, "#d84315", "#ff8a65", 1.5, 1);
    drawSketchCircle(ctx, x, y, r - 3, "#e65100", "#ffb74d", 1, 0.8);
    drawSketchCircle(ctx, x, y, r - 6, "rgba(0,0,0,0)", "#ffd54f", 1, 0.5);
}

/**
 * Draws a Golden Coin (popping out or floating in levels)
 */
function drawCoin(ctx, cx, cy, r, spinFrame = 0) {
    ctx.save();
    ctx.translate(cx, cy);
    
    // Coin spin scaling (width squish based on frame)
    const stretch = Math.abs(Math.sin(spinFrame * 0.25));
    ctx.scale(stretch, 1);
    
    // Outer coin circle
    drawSketchCircle(ctx, 0, 0, r, "#e65100", "#ffd54f", 2, 0.6);
    
    // Inner coin stripe (marker line)
    drawSketchRect(ctx, -2, -r + 4, 4, r*2 - 8, "#e65100", "#ffeb3b", 1.2, 0.4);
    
    ctx.restore();
}

/**
 * Draws the Golden Winding Key Power-Up
 */
function drawPowerupKey(ctx, x, y, w, h) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    
    const bob = Math.sin(Date.now() / 200) * 3;
    ctx.translate(0, bob);
    
    // Blinking effect
    const isBlink = Math.floor(Date.now() / 150) % 2 === 0;
    const fillColor = isBlink ? "#ffffff" : "#ffecb3"; // Blink between white and egg-yellow
    const strokeColor = "#ffb300";
    
    // Scale vertically to make an egg shape
    ctx.scale(1, 1.3);
    
    // Draw the egg
    drawSketchCircle(ctx, 0, 0, 8, strokeColor, fillColor, 2, 0.8);
    
    // Add a few speckles/spots for egg texture
    ctx.fillStyle = "#ffb300";
    ctx.beginPath();
    ctx.arc(-3, -2, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(2, 3, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(4, -1, 1.2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}


function drawHorse(ctx, x, y, w, h, facingRight = true) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    if (!facingRight) ctx.scale(-1, 1);
    
    drawSketchRect(ctx, -15, 5, 30, 15, "#5d4037", "#795548", 2, 0.5); // Body
    drawSketchRect(ctx, 10, -5, 12, 15, "#5d4037", "#795548", 2, 0.5); // Neck
    drawSketchRect(ctx, -15, 20, 4, 10, "#3e2723", "#4e342e", 2, 0.5); // Back leg
    drawSketchRect(ctx, 10, 20, 4, 10, "#3e2723", "#4e342e", 2, 0.5); // Front leg
    drawSketchCircle(ctx, 18, -2, 2, "#000", "#000", 1, 0); // Eye
    
    ctx.restore();
}

function drawRacecar(ctx, x, y, w, h, facingRight = true) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    if (!facingRight) ctx.scale(-1, 1);
    
    drawSketchRect(ctx, -20, 5, 40, 15, "#b71c1c", "#f44336", 2, 0.5); // Car body
    drawSketchCircle(ctx, -12, 20, 6, "#000", "#424242", 2, 0.5); // Back wheel
    drawSketchCircle(ctx, 12, 20, 6, "#000", "#424242", 2, 0.5); // Front wheel
    drawSketchRect(ctx, 5, 0, 10, 8, "#fff", "#e0e0e0", 2, 0.5); // Windshield
    
    ctx.restore();
}

function drawJetpack(ctx, x, y, w, h, facingRight = true) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    if (!facingRight) ctx.scale(-1, 1);
    
    drawSketchRect(ctx, -15, -5, 8, 20, "#455a64", "#607d8b", 2, 0.5);
    const fireBob = Math.random() * 5;
    drawSketchRect(ctx, -13, 15, 4, 10 + fireBob, "#ff5722", "#ffeb3b", 1, 1.0);
    
    ctx.restore();
}

function drawCape(ctx, x, y, w, h, facingRight = true) {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    if (!facingRight) ctx.scale(-1, 1);
    
    const flutter = Math.sin(Date.now() / 100) * 5;
    drawSketchBezier(ctx, -8, -10, -25, -5 + flutter, -20, 10 + flutter, -8, 10, "#b71c1c", 2, 1.0);
    ctx.fillStyle = "#f44336";
    ctx.beginPath();
    ctx.moveTo(-8, -10);
    ctx.quadraticCurveTo(-25, -5 + flutter, -20, 10 + flutter);
    ctx.lineTo(-8, 10);
    ctx.fill();
    
    ctx.restore();
}

/**
 * Draws the final level Goal Boat (wooden hull + mast + flag)
 */
function drawGoalBoat(ctx, x, y, w, h) {
    ctx.save();
    const bob = Math.sin(Date.now() / 400) * 2.5;
    ctx.translate(0, bob);
    
    // 1. Boat Hull (red base, white deck line)
    drawSketchBezier(ctx, x, y + h - 16, x + 16, y + h, x + w - 16, y + h, x + w, y + h - 16, "#3e2723", "#d84315", 2.5, SketchConfig.jitter);
    drawSketchRect(ctx, x + 8, y + h - 22, w - 16, 6, "#3e2723", "#fff", 2, 0.8);
    
    // Deck railings/bars
    const bars = 8;
    const barSpacing = (w - 32) / bars;
    for (let i = 0; i <= bars; i++) {
        drawSketchLine(ctx, x + 16 + i * barSpacing, y + h - 22, x + 16 + i * barSpacing, y + h - 16, "#3e2723", 1.5, 0.5);
    }
    
    // 2. Mast (central pole)
    drawSketchRect(ctx, x + w / 2 - 3, y + 16, 6, h - 38, "#3e2723", "#5d4037", 2, 0.8);
    
    // 3. Goal Flag (Red triangle flag with white circle containing a hand-drawn letter "M" or "O")
    const flagY = y + 16;
    drawSketchBezier(ctx, x + w / 2, flagY, x + w / 2 - 15, flagY + 4, x + w / 2 - 35, flagY + 2, x + w / 2 - 45, flagY + 8, "#d84315", 2, 0.8);
    drawSketchBezier(ctx, x + w / 2 - 45, flagY + 8, x + w / 2 - 35, flagY + 14, x + w / 2 - 15, flagY + 12, x + w / 2, flagY + 16, "#d84315", 2, 0.8);
    
    // Fill the flag
    ctx.fillStyle = "#e53935";
    ctx.beginPath();
    ctx.moveTo(x + w / 2, flagY);
    ctx.quadraticCurveTo(x + w / 2 - 25, flagY + 4, x + w / 2 - 45, flagY + 8);
    ctx.quadraticCurveTo(x + w / 2 - 25, flagY + 12, x + w / 2, flagY + 16);
    ctx.fill();
    
    // White crest circle in flag center
    drawSketchCircle(ctx, x + w / 2 - 18, flagY + 8, 4.5, "#d84315", "#fff", 1.2, 0.5);
    
    // Drawn crest letter "O"
    ctx.save();
    ctx.font = "bold 8px 'Fredoka'";
    ctx.fillStyle = "#e53935";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("O", x + w / 2 - 18, flagY + 8);
    ctx.restore();
    
    ctx.restore();
}

/**
 * Draws the Level 3 Spear Boss
 */
function drawSpearBoss(ctx, x, y, w, h, animTimer = 0, hp = 3) {
    ctx.save();
    ctx.translate(x + w/2, y + h/2);
    
    const scale = Math.min(w / 36, h / 44);
    ctx.scale(scale, scale);
    
    const timeIndex = getJitterTimeIndex();
    const isAngry = hp <= 1;
    const bodyColor = isAngry ? "#d84315" : "#5d4037"; // turns reddish when mad
    const bodyFill = isAngry ? "#ff7043" : "#8d6e63";
    
    // 1. Walking feet
    const walkOffset = Math.sin(animTimer * 0.15) * 4;
    drawSketchCircle(ctx, -8, 16 + walkOffset, 6, "#3e2723", "#ffeb3b", 2, 0.8);
    drawSketchCircle(ctx, 8, 16 - walkOffset, 6, "#3e2723", "#ffeb3b", 2, 0.8);
    
    // 2. Main Peanut Body
    // Drawn as a bumpy double sphere/peanut path
    ctx.fillStyle = bodyFill;
    ctx.beginPath();
    ctx.arc(0, -5, 14, 0, Math.PI * 2);
    ctx.arc(0, 10, 16, 0, Math.PI * 2);
    ctx.fill();
    
    drawSketchCircle(ctx, 0, -5, 14, bodyColor, null, 2.2, 1);
    drawSketchCircle(ctx, 0, 10, 16, bodyColor, null, 2.2, 1);
    
    // 3. Green Kingly Crown on top of head
    ctx.fillStyle = "#4caf50";
    ctx.beginPath();
    ctx.moveTo(-10, -18);
    ctx.lineTo(-8, -25);
    ctx.lineTo(-3, -20);
    ctx.lineTo(0, -27);
    ctx.lineTo(3, -20);
    ctx.lineTo(8, -25);
    ctx.lineTo(10, -18);
    ctx.closePath();
    ctx.fill();
    drawSketchBezier(ctx, -10, -18, -4, -26, 4, -26, 10, -18, "#1b5e20", 1.8, 0.6);
    
    // 4. White mask / eyes face plate
    drawSketchCircle(ctx, 0, -4, 9, "#3e2723", "#f5f5f5", 1.5, 0.6);
    
    // Angry glowing eyes
    const eyeColor = isAngry ? "#ff1744" : "#000";
    drawSketchCircle(ctx, -3, -5, 2.5, eyeColor, eyeColor, 1.5, 0.5);
    drawSketchCircle(ctx, 3, -5, 2.5, eyeColor, eyeColor, 1.5, 0.5);
    
    // Angry eyebrows
    drawSketchLine(ctx, -6, -9, -1, -7, "#000", 2.2, 0.5);
    drawSketchLine(ctx, 6, -9, 1, -7, "#000", 2.2, 0.5);
    
    // 5. Holding Spear Weapon (thrusting out based on animation)
    ctx.save();
    const thrustX = Math.sin(animTimer * 0.15) * 8;
    ctx.translate(14 + thrustX, 4);
    ctx.rotate(0.3);
    
    // Wooden pole shaft
    drawSketchLine(ctx, -20, 0, 15, 0, "#3e2723", 2, 0.8);
    // Spear head (triangle marker shape)
    ctx.fillStyle = "#cfd8dc";
    ctx.beginPath();
    ctx.moveTo(15, -4);
    ctx.lineTo(25, 0);
    ctx.lineTo(15, 4);
    ctx.closePath();
    ctx.fill();
    drawSketchLine(ctx, 15, -4, 25, 0, "#37474f", 1.5, 0.5);
    drawSketchLine(ctx, 25, 0, 15, 4, "#37474f", 1.5, 0.5);
    ctx.restore();
    
    ctx.restore();
}

/* ==========================================================================
   BACKGROUNDS AND ENVIRONMENT WAVES
   ========================================================================== */

/**
 * Draws wavy animated orange lava
 */
function drawLava(ctx, xVal, yVal, w, h, scrollX = 0) {
    ctx.save();
    const waveCount = 2; // waves per block
    const waveW = w / waveCount;
    const amplitude = 4;
    const speed = Date.now() / 250;
    
    ctx.fillStyle = "#ff6f00";
    ctx.beginPath();
    ctx.moveTo(xVal, yVal);
    
    // Draw wavy top surface
    for (let x = xVal; x <= xVal + w + waveW; x += Math.max(5, waveW / 3)) {
        const angle = ((x + scrollX) / waveW) * Math.PI * 2 + speed;
        const y = yVal + Math.sin(angle) * amplitude;
        ctx.lineTo(Math.min(x, xVal + w), y);
    }
    
    // Bottom border
    ctx.lineTo(xVal + w, yVal + h);
    ctx.lineTo(xVal, yVal + h);
    ctx.closePath();
    ctx.fill();
    
    // Highlight bubble waves (yellow/light-orange sketchy crests)
    ctx.strokeStyle = "#ffd54f";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = xVal; x <= xVal + w + waveW; x += Math.max(8, waveW / 2)) {
        const angle = ((x + scrollX) / waveW) * Math.PI * 2 + speed;
        const y = yVal - 1 + Math.sin(angle) * amplitude;
        if (x === xVal) ctx.moveTo(Math.min(x, xVal + w), y);
        else ctx.lineTo(Math.min(x, xVal + w), y);
    }
    ctx.stroke();
    
    ctx.restore();
}

/**
 * Draws wavy animated purple toxic water
 */
function drawToxicWater(ctx, xVal, yVal, w, h, scrollX = 0) {
    ctx.save();
    const waveCount = 2; // waves per block
    const waveW = w / waveCount;
    const amplitude = 5;
    const speed = Date.now() / 300;
    
    ctx.fillStyle = "#4a148c"; // deep violet
    ctx.beginPath();
    ctx.moveTo(xVal, yVal);
    
    for (let x = xVal; x <= xVal + w + waveW; x += Math.max(5, waveW / 3)) {
        const angle = ((x + scrollX) / waveW) * Math.PI * 2 + speed;
        const y = yVal + Math.sin(angle) * amplitude;
        ctx.lineTo(Math.min(x, xVal + w), y);
    }
    
    ctx.lineTo(xVal + w, yVal + h);
    ctx.lineTo(xVal, yVal + h);
    ctx.closePath();
    ctx.fill();
    
    // Light purple acid bubble highlight
    ctx.strokeStyle = "#e040fb";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = xVal; x <= xVal + w + waveW; x += Math.max(8, waveW / 2)) {
        const angle = ((x + scrollX) / waveW) * Math.PI * 2 + speed;
        const y = yVal - 1 + Math.sin(angle) * amplitude;
        if (x === xVal) ctx.moveTo(Math.min(x, xVal + w), y);
        else ctx.lineTo(Math.min(x, xVal + w), y);
    }
    ctx.stroke();
    
    ctx.restore();
}

/**
 * Draws sketchy pencil background clouds (on canvas)
 */
function drawCanvasCloud(ctx, cx, cy, scale = 1.0) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    
    // Draw cloud shapes (overlapping sketchy circles/arcs)
    drawSketchCircle(ctx, -15, 0, 16, "rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)", 1.5, 0.8);
    drawSketchCircle(ctx, 15, 0, 16, "rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)", 1.5, 0.8);
    drawSketchCircle(ctx, 0, -10, 20, "rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)", 1.5, 0.8);
    
    // Flat bottom line
    drawSketchLine(ctx, -32, 8, 32, 8, "rgba(255,255,255,0.08)", 1.5, 0.8);
    
    ctx.restore();
}

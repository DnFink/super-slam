const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });

// Mock AudioEngine and Canvas methods before loading scripts
dom.window.AudioEngine = {
    setTheme: () => {},
    playSFX: () => {},
    startMusic: () => {},
    stopMusic: () => {},
    toggleSound: () => false,
    toggleMusic: () => false
};

// Mock canvas getContext
dom.window.HTMLCanvasElement.prototype.getContext = function () {
    return {
        clearRect: () => {},
        fillRect: () => {},
        translate: () => {},
        rotate: () => {},
        scale: () => {},
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        closePath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        rect: () => {},
        clip: () => {},
        stroke: () => {},
        fill: () => {},
        arc: () => {},
        ellipse: () => {},
        quadraticCurveTo: () => {},
        fillText: () => {},
        strokeText: () => {}
    };
};

// RequestAnimationFrame / CancelAnimationFrame polyfills
let nextRafId = 1;
const activeRafs = new Set();
dom.window.requestAnimationFrame = (cb) => {
    const id = nextRafId++;
    activeRafs.add(id);
    return id;
};
dom.window.cancelAnimationFrame = (id) => {
    activeRafs.delete(id);
};

console.log("Loading scripts...");
const audioSrc = fs.readFileSync('audio.js', 'utf8');
const assetsSrc = fs.readFileSync('assets.js', 'utf8');
const gameSrc = fs.readFileSync('game.js', 'utf8');

try {
    dom.window.eval(audioSrc + "\nwindow.AudioEngine = AudioEngine;");
    dom.window.eval(assetsSrc);
    dom.window.eval(gameSrc + "\nwindow.Game = Game;");
    
    const Game = dom.window.Game;
    const doc = dom.window.document;

    console.log("1. Initializing Game...");
    Game.init();
    assert.strictEqual(Game.gameState, 'menu', "Initial state should be menu");

    console.log("2. Testing all 10 Heroes selection & rendering...");
    const heroes = ['cowboy', 'astronaut', 'driver', 'princess', 'ninja', 'fox', 'gorilla', 'superslam', 'bomb', 'superowen'];
    doc.getElementById('btn-select-character').click();
    assert.strictEqual(doc.querySelector('.menu-screen.active').id, 'character-select-screen');

    for (const hero of heroes) {
        const card = doc.querySelector(`.char-card[data-character="${hero}"]`);
        assert(card, `Character card for ${hero} should exist`);
        assert(card.querySelector('.char-card-canvas-wrapper'), `Character card for ${hero} should have .char-card-canvas-wrapper`);
        card.click();
        assert.strictEqual(Game.selectedHero, hero);
        assert.strictEqual(doc.getElementById('hud-char-val').innerText, Game.heroNames[hero]);

        // Test drawing both normal and Special Mode for this hero
        Game.startCampaignLevel(1);
        Game.draw();
        Game.player.isSpecialMode = true;
        Game.draw();
        Game.player.isSpecialMode = false;
    }

    console.log("3. Testing RAF loop deduplication (no double speed bug)...");
    Game.startCampaignLevel(1);
    assert.strictEqual(activeRafs.size, 1, "Only 1 RAF loop should be active");
    Game.restartCurrentLevel();
    assert.strictEqual(activeRafs.size, 1, "Restarting level should cancel previous RAF loop");
    Game.pauseGame();
    Game.resumeGame();
    assert.strictEqual(activeRafs.size, 1, "Resuming game should keep exactly 1 RAF loop");

    console.log("4. Testing Jump, Coyote Time, Double Jump, and Variable Jump Height...");
    Game.startCampaignLevel(1);
    // Settle player onto ground
    for (let i = 0; i < 30; i++) Game.update();
    assert(Game.player.isGrounded, "Player should land on ground");

    // Step off ledge simulation (coyote time)
    Game.player.isGrounded = false;
    Game.player.coyoteTimer = 5;
    Game.keys[' '] = true;
    Game.update();
    assert.strictEqual(Game.player.vy < -8, true, "Coyote jump should trigger upward velocity");
    assert.strictEqual(Game.player.doubleJumped, false, "Coyote jump should count as first jump");

    // Release jump early (variable jump height)
    const vyBeforeRelease = Game.player.vy;
    Game.keys[' '] = false;
    Game.update();
    assert(Game.player.vy > vyBeforeRelease * 0.8, "Releasing jump early should dampen upward speed");

    // Double jump in mid-air
    Game.keys[' '] = true;
    Game.update();
    assert.strictEqual(Game.player.doubleJumped, true, "Second press in air should trigger double jump");
    Game.keys[' '] = false;
    Game.update();

    console.log("5. Testing Owl Power-up & Brick Breaking...");
    const testR = 10, testC = 18;
    assert.strictEqual(Game.levelGrid[testR][testC], 'B', "Expected brick block at (10, 18) in Level 1");
    Game.hitBlockFromUnder(testR, testC, 'B');
    assert.strictEqual(Game.levelGrid[testR][testC], 'B', "Normal hero should only bump brick block");

    // Give Owl power-up
    Game.powerups.push({ x: Game.player.x, y: Game.player.y, vx: 0, vy: 0, w: 24, h: 24 });
    Game.updatePowerups();
    assert.strictEqual(Game.player.powerState, 'owl', "Player should transform into Owl");
    Game.hitBlockFromUnder(testR, testC, 'B');
    assert.strictEqual(Game.levelGrid[testR][testC], '.', "Owl hero should shatter brick block");

    console.log("6. Testing Invincibility Diamond (hasStarPower) vs Lava & Enemies...");
    Game.startCampaignLevel(1);
    Game.powerups.push({ type: 'diamond', x: Game.player.x, y: Game.player.y, vx: 0, vy: 0, w: 20, h: 20 });
    Game.updatePowerups();
    assert.strictEqual(Game.player.isInvincible, true);
    assert.strictEqual(Game.player.hasStarPower, true);
    // Drop player onto Lava tile in Level 1 (row 14, col 25 is 'L')
    Game.player.x = 25 * 32;
    Game.player.y = 14 * 32 - 10;
    Game.checkTriggerCollisions();
    assert.strictEqual(Game.lives, 2, "Star power should bounce player out of lava without losing a life");
    assert.strictEqual(Game.player.vy, -18, "Star power should bounce player upward from lava");

    console.log("7. Testing Level 2 & Level 3 loading, Boss defeat, Firepower unlock & Castle Wall destruction...");
    Game.startCampaignLevel(2);
    for (let i = 0; i < 20; i++) { Game.update(); Game.draw(); }

    Game.startCampaignLevel(3);
    assert(Game.boss && !Game.boss.isDead, "Level 3 should spawn Spear Boss");
    // Verify 'M' and 'R' tiles were cleared to '.' in levelGrid
    for (let r = 0; r < Game.levelHeight; r++) {
        for (let c = 0; c < Game.levelWidth; c++) {
            assert.notStrictEqual(Game.levelGrid[r][c], 'M', "M should not remain in levelGrid");
            assert.notStrictEqual(Game.levelGrid[r][c], 'R', "R should not remain in levelGrid");
        }
    }

    // Stomp boss 3 times
    for (let hit = 0; hit < 3; hit++) {
        Game.boss.hitInvincible = 0;
        Game.player.x = Game.boss.x;
        Game.player.y = Game.boss.y - Game.player.h + 4;
        Game.player.vy = 5;
        Game.updateEnemiesSpearBoss();
    }
    assert.strictEqual(Game.boss.isDead, true, "Boss should be dead after 3 stomps");
    assert.strictEqual(Game.player.hasFirepower, true, "Firepower should unlock immediately when Boss dies");
    assert.strictEqual(doc.getElementById('vbtn-fire').style.display, 'flex', "Mobile FIRE button should appear when Firepower unlocks");

    // Test dying on life 2 after boss dies -> player should STILL keep hasFirepower so Level 3 never softlocks!
    Game.playerDie();
    assert.strictEqual(Game.lives, 1, "Player should have 1 life left");
    assert.strictEqual(Game.player.hasFirepower, true, "Player must retain Firepower after respawning so Level 3 castle wall is still breakable");

    // Shoot fireball at Castle Wall ('H' in row 13)
    const wallCol = Game.levelGrid[13].indexOf('H');
    assert(wallCol > 0, "Castle wall 'H' should exist in row 13 of Level 3");
    Game.player.x = (wallCol - 1) * 32;
    Game.player.y = 13 * 32;
    Game.scrollX = Game.player.x - 200;
    Game.player.facingRight = true;
    Game.prevKeys['c'] = false;
    Game.keys['c'] = true;
    Game.updatePlayerBullets();
    assert.strictEqual(Game.playerBullets.length, 1, "Pressing C should spawn a player fireball");
    for (let i = 0; i < 10; i++) Game.updatePlayerBullets();
    assert.strictEqual(Game.levelGrid[13][wallCol], '.', "Player fireball should break Castle Wall 'H'");

    console.log("8. Testing Level 3 Victory & Leaderboard XSS sanitization...");
    Game.levelVictory();
    assert.strictEqual(Game.gameState, 'victory_celebration');
    Game.showVictoryPopup();
    assert.strictEqual(doc.getElementById('btn-next-level').innerText, 'Finish Campaign');
    doc.getElementById('player-name-input').value = '<img src=x onerror=alert(1)>';
    Game.submitScore();
    Game.renderLeaderboards();
    const lbHtml = doc.getElementById('leaderboard-list-3').innerHTML;
    assert(!lbHtml.includes('<img'), "Leaderboard should escape HTML tags in player names");

    console.log("ALL QC TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
} catch (e) {
    console.error("QC Test Failed:", e);
    process.exit(1);
}


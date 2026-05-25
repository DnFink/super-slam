const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');

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
        scale: () => {},
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        stroke: () => {},
        fill: () => {},
        arc: () => {},
        quadraticCurveTo: () => {},
        fillText: () => {}
    };
};

// RequestAnimationFrame polyfill
dom.window.requestAnimationFrame = (cb) => setTimeout(cb, 16);

console.log("Loading scripts...");
const audioSrc = fs.readFileSync('audio.js', 'utf8');
const assetsSrc = fs.readFileSync('assets.js', 'utf8');
const gameSrc = fs.readFileSync('game.js', 'utf8');

try {
    dom.window.eval(audioSrc);
    dom.window.eval(assetsSrc);
    dom.window.eval(gameSrc);
    
    console.log("Initializing Game...");
    dom.window.Game.init();
    
    console.log("Testing Button Clicks...");
    const btnCampaign = dom.window.document.getElementById('btn-campaign');
    btnCampaign.click();
    console.log("Campaign button clicked. Current Screen:", dom.window.document.querySelector('.menu-screen.active').id);
    
    console.log("Starting Level 1...");
    dom.window.Game.startCampaignLevel(1);
    console.log("Game state:", dom.window.Game.gameState);
    
    console.log("Simulating 1 frame of update()...");
    dom.window.Game.update();
    console.log("Update ran successfully.");
    
    // Simulate Special Mode activation
    console.log("Activating Special Mode (pressing X)...");
    dom.window.Game.keys['x'] = true;
    dom.window.Game.update();
    console.log("Player Special Mode:", dom.window.Game.player.isSpecialMode);
    
    // Simulate Draw
    console.log("Simulating 1 frame of draw()...");
    dom.window.Game.draw();
    console.log("Draw ran successfully.");
    
    console.log("ALL TESTS PASSED.");
} catch (e) {
    console.error("QC Test Failed:", e);
}

/* ==========================================================================
   Super Slam - 8-Bit Web Audio Synthesizer Engine
   ========================================================================== */

const AudioEngine = {
    ctx: null,
    isSoundMuted: false,
    isMusicMuted: false,
    musicInterval: null,
    musicStep: 0,
    themes: [
        // Theme 0: Fallback / Default
        {
            bpm: 110,
            bassline: ['C3', 'G3', 'C3', 'G3', 'F3', 'C4', 'F3', 'C4', 'G3', 'D4', 'G3', 'D4', 'C3', 'G3', 'C3', 'C4', 'C3', 'G3', 'C3', 'G3', 'F3', 'C4', 'F3', 'C4', 'G3', 'D4', 'G3', 'B3', 'C4', 'G4', 'C4', 'R'],
            melody: ['E5', 'G5', 'C6', 'R',  'A5', 'R',  'F5', 'R', 'D5', 'F5', 'B5', 'R',  'G5', 'R',  'E5', 'R', 'E5', 'G5', 'C6', 'R',  'A5', 'R',  'C6', 'R', 'B5', 'R',  'A5', 'R',  'G5', 'F5', 'E5', 'D5'],
            bassOsc: 'square',
            melOsc: 'triangle'
        },
        // Theme 1: Level 1
        {
            bpm: 110,
            bassline: ['C3', 'G3', 'C3', 'G3', 'F3', 'C4', 'F3', 'C4', 'G3', 'D4', 'G3', 'D4', 'C3', 'G3', 'C3', 'C4', 'C3', 'G3', 'C3', 'G3', 'F3', 'C4', 'F3', 'C4', 'G3', 'D4', 'G3', 'B3', 'C4', 'G4', 'C4', 'R'],
            melody: ['E5', 'G5', 'C6', 'R',  'A5', 'R',  'F5', 'R', 'D5', 'F5', 'B5', 'R',  'G5', 'R',  'E5', 'R', 'E5', 'G5', 'C6', 'R',  'A5', 'R',  'C6', 'R', 'B5', 'R',  'A5', 'R',  'G5', 'F5', 'E5', 'D5'],
            bassOsc: 'square',
            melOsc: 'triangle'
        },
        // Theme 2: Level 2 (Underground)
        {
            bpm: 135,
            bassline: ['C3', 'C3', 'D#3', 'D#3', 'F3', 'F3', 'F#3', 'F#3', 'G3', 'G3', 'C4', 'C4', 'B3', 'B3', 'G3', 'G3', 'C3', 'C3', 'D#3', 'D#3', 'F3', 'F3', 'F#3', 'F#3', 'G3', 'G3', 'F3', 'F3', 'D#3', 'D#3', 'C3', 'C3'],
            melody: ['C5', 'R', 'D#5', 'R', 'F5', 'R', 'F#5', 'R', 'G5', 'R', 'C6', 'R', 'B5', 'R', 'G5', 'R', 'C5', 'R', 'D#5', 'R', 'F5', 'R', 'F#5', 'R', 'G5', 'R', 'F5', 'R', 'D#5', 'R', 'C5', 'R'],
            bassOsc: 'sawtooth',
            melOsc: 'square'
        },
        // Theme 3: Level 3 (Sky)
        {
            bpm: 125,
            bassline: ['F3', 'F3', 'A3', 'C4', 'G3', 'G3', 'B3', 'D4', 'C3', 'C3', 'E3', 'G3', 'C4', 'C4', 'G3', 'E3', 'F3', 'F3', 'A3', 'C4', 'G3', 'G3', 'B3', 'D4', 'C4', 'G3', 'E3', 'C3', 'R', 'R', 'R', 'R'],
            melody: ['A5', 'R', 'C6', 'R', 'B5', 'R', 'D6', 'R', 'C6', 'R', 'E6', 'R', 'G6', 'R', 'E6', 'R', 'A5', 'R', 'C6', 'R', 'B5', 'R', 'D6', 'R', 'C6', 'R', 'G5', 'R', 'E5', 'R', 'C5', 'R'],
            bassOsc: 'square',
            melOsc: 'sine'
        },
        // Theme 4: Custom Level
        {
            bpm: 140,
            bassline: ['E3', 'E3', 'E3', 'E3', 'G3', 'G3', 'A3', 'A3', 'E3', 'E3', 'E3', 'E3', 'D3', 'D3', 'C3', 'D3', 'E3', 'E3', 'E3', 'E3', 'G3', 'G3', 'A3', 'A3', 'C4', 'C4', 'B3', 'B3', 'G3', 'G3', 'E3', 'R'],
            melody: ['E5', 'B5', 'E6', 'R', 'D6', 'R', 'B5', 'R', 'E5', 'B5', 'E6', 'R', 'D6', 'R', 'B5', 'R', 'E5', 'B5', 'E6', 'R', 'D6', 'R', 'B5', 'R', 'G5', 'R', 'F#5', 'R', 'D5', 'R', 'E5', 'R'],
            bassOsc: 'sawtooth',
            melOsc: 'sawtooth'
        }
    ],

    currentTheme: 1,

    setTheme(lvl) {
        let newTheme = 1;
        if (lvl === 'custom') {
            newTheme = 4;
        } else if (lvl === 0 || lvl === 'menu') {
            newTheme = 0;
        } else {
            newTheme = lvl > 0 && lvl <= 3 ? lvl : 1;
        }
        
        if (this.currentTheme !== newTheme) {
            this.currentTheme = newTheme;
            if (this.musicInterval) {
                this.stopMusic();
                this.startMusic();
            }
        }
    },

    frequencies: {
        'C3': 130.81, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
        'C5': 523.25, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
        'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'F6': 1396.91, 'G6': 1567.98, 'R': 0
    },

    /**
     * Lazy-initializes the Web Audio Context.
     */
    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    /**
     * Synthesizes retro sounds using square/triangle oscillators and noise.
     */
    playSFX(type) {
        if (this.isSoundMuted) return;
        this.init();
        
        const now = this.ctx.currentTime;
        
        switch (type) {
            case 'jump': {
                // Classic platformer upward square-wave frequency sweep
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                
                osc.frequency.setValueAtTime(140, now);
                osc.frequency.exponentialRampToValueAtTime(700, now + 0.16);
                
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.16);
                break;
            }
            case 'coin': {
                // Double chime (classic high pitched coin ding)
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                
                osc.frequency.setValueAtTime(this.frequencies['B5'], now);
                osc.frequency.setValueAtTime(this.frequencies['E6'], now + 0.08);
                
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.setValueAtTime(0.08, now + 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.28);
                break;
            }
            case 'stomp': {
                // Squishy crunch (white noise low-pass burst)
                const bufferSize = this.ctx.sampleRate * 0.1;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                
                const noiseNode = this.ctx.createBufferSource();
                noiseNode.buffer = buffer;
                
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(800, now);
                filter.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                
                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                
                noiseNode.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);
                
                noiseNode.start(now);
                noiseNode.stop(now + 0.1);
                break;
            }
            case 'hit': {
                // Dull thump for hitting normal blocks
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);
                
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.12);
                break;
            }
            case 'powerup': {
                // satisfying ascending square scale: C5 - E5 - G5 - C6
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                
                const notes = ['C5', 'E5', 'G5', 'C6'];
                const stepD = 0.08;
                
                notes.forEach((note, idx) => {
                    osc.frequency.setValueAtTime(this.frequencies[note], now + idx * stepD);
                });
                
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + notes.length * stepD);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + notes.length * stepD);
                break;
            }
            case 'hurt': {
                // descending square glitched rumble
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                
                osc.frequency.setValueAtTime(450, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.25);
                
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.25);
                break;
            }
            case 'victory': {
                // Major scale triumphant retro arpeggio
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                
                const notes = ['C5', 'E5', 'G5', 'C6', 'E6', 'G6'];
                const stepD = 0.09;
                
                notes.forEach((note, idx) => {
                    osc.frequency.setValueAtTime(this.frequencies[note], now + idx * stepD);
                });
                
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.setValueAtTime(0.08, now + (notes.length - 1) * stepD);
                gain.gain.exponentialRampToValueAtTime(0.001, now + notes.length * stepD + 0.2);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + notes.length * stepD + 0.2);
                break;
            }
            case 'boss_hit': {
                // explosive stomp noise
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
                
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            }
        }
    },

    /**
     * Start the repeating chiptune background music loop.
     */
    startMusic() {
        this.init();
        if (this.musicInterval) return;
        
        const theme = this.themes[this.currentTheme];
        const stepTime = 60 / theme.bpm / 2; // eighth notes
        
        this.musicInterval = setInterval(() => {
            if (this.isMusicMuted) return;
            
            const now = this.ctx.currentTime;
            const idx = this.musicStep % 32;
            
            // 1. Play Bass Note
            const bassNote = theme.bassline[idx];
            if (bassNote !== 'R' && this.frequencies[bassNote]) {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = theme.bassOsc;
                osc.frequency.setValueAtTime(this.frequencies[bassNote], now);
                
                gain.gain.setValueAtTime(0.03, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + stepTime * 0.9);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + stepTime * 0.9);
            }
            
            // 2. Play Lead Melody Note
            const melNote = theme.melody[idx];
            if (melNote !== 'R' && this.frequencies[melNote]) {
                const oscMel = this.ctx.createOscillator();
                const gainMel = this.ctx.createGain();
                oscMel.type = theme.melOsc;
                oscMel.frequency.setValueAtTime(this.frequencies[melNote], now);
                
                gainMel.gain.setValueAtTime(0.035, now);
                gainMel.gain.exponentialRampToValueAtTime(0.001, now + stepTime * 0.85);
                
                oscMel.connect(gainMel);
                gainMel.connect(this.ctx.destination);
                oscMel.start(now);
                oscMel.stop(now + stepTime * 0.85);
            }
            
            // 3. Play Basic Drum Noise on beats (every 2 steps / quarter note)
            if (this.musicStep % 2 === 0) {
                const drumBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.03, this.ctx.sampleRate);
                const dData = drumBuffer.getChannelData(0);
                for (let i = 0; i < dData.length; i++) {
                    dData[i] = Math.random() * 2 - 1;
                }
                
                const drumNode = this.ctx.createBufferSource();
                drumNode.buffer = drumBuffer;
                
                const drumGain = this.ctx.createGain();
                // Alternate drum volume (kick vs snare vibe)
                const vol = (this.musicStep % 4 === 0) ? 0.015 : 0.008;
                drumGain.gain.setValueAtTime(vol, now);
                drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
                
                drumNode.connect(drumGain);
                drumGain.connect(this.ctx.destination);
                drumNode.start(now);
                drumNode.stop(now + 0.03);
            }
            
            this.musicStep++;
        }, stepTime * 1000);
    },

    /**
     * Stop background music playback.
     */
    stopMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    },

    /**
     * Toggle sound effects muting.
     */
    toggleSound() {
        this.isSoundMuted = !this.isSoundMuted;
        return this.isSoundMuted;
    },

    /**
     * Toggle BGM muting.
     */
    toggleMusic() {
        this.isMusicMuted = !this.isMusicMuted;
        this.init();
        return this.isMusicMuted;
    }
};

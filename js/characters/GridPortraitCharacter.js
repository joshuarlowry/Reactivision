import { drawPixelSpeechBubble } from './speechBubble.js';

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

function randBetween(min, max) {
    return min + Math.random() * (max - min);
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
    });
}

// Map expression names to grid coordinates (row, col) in a 6x6 grid
const EXPRESSION_MAP = {
    neutral: [0, 0],
    eyes_closed: [0, 1],
    winking: [0, 2],
    slight_smile: [0, 3],
    winking_smile: [0, 4],
    happy: [0, 5],
    looking_left: [1, 0],
    mouth_open: [1, 1],
    laughing: [1, 2],
    grinning: [1, 3],
    smirking_wink: [1, 4],
    smirk: [1, 5],
    sad: [2, 0],
    crying: [2, 1],
    angry: [2, 2],
    furious: [2, 3],
    scared: [2, 4],
    terrified: [2, 5],
    happy_wink: [3, 0],
    laughing_eyes_closed: [3, 1],
    surprised: [3, 2],
    shocked: [3, 3],
    confused: [3, 4],
    skeptical: [3, 5],
    embarrassed: [4, 0],
    blushing: [4, 1],
    flustered: [4, 2],
    determined: [4, 3],
    tired: [4, 4],
    yawning: [4, 5],
    pensive: [5, 0],
    thinking: [5, 1],
    disgusted: [5, 2],
    sick: [5, 3],
    sleeping: [5, 4],
    shouting: [5, 5]
};

// Idle animation expressions to cycle through
const IDLE_EXPRESSIONS = [
    'neutral',
    'eyes_closed',
    'happy',
    'winking',
    'slightly_smile',
    'thinking',
    'pensive'
];

export class GridPortraitCharacter {
    constructor(canvas, ctx, opts = {}) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.basePath = opts.basePath || 'assets/characters/grid_portrait';
        this.gridImage = null;
        this.cellWidth = opts.cellWidth || 256;
        this.cellHeight = opts.cellHeight || 320;
        this.cols = opts.cols || 6;
        this.rows = opts.rows || 6;

        this.x = canvas.width / 2;
        this.y = canvas.height - 50;

        this.isTalking = false;
        this.speechText = "";

        this.expression = 'neutral';
        this.expressionTimeLeftMs = 0;
        this.nextIdleActionInMs = randBetween(1200, 3200);

        this.ready = false;
        this._loadPromise = this.loadSprites();
    }

    async loadSprites() {
        try {
            this.gridImage = await loadImage(`${this.basePath}/grid.png`);
            this.ready = true;
        } catch (e) {
            // Keep running even if an asset fails to load
            this.ready = false;
            // eslint-disable-next-line no-console
            console.warn('Failed to load grid portrait sprites', e);
        }
    }

    setExpression(expression) {
        if (EXPRESSION_MAP[expression]) {
            this.expression = expression;
            this.expressionTimeLeftMs = 0;
        }
    }

    resize() {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height - 50;
    }

    setTalking(talking) {
        this.isTalking = talking;
    }

    say(text, opts = {}) {
        this.speechText = text;
        this.isTalking = true;
        if (this.speechTimeout) clearTimeout(this.speechTimeout);
        const timeoutMs = typeof opts.timeoutMs === 'number' ? opts.timeoutMs : Math.max(2000, text.length * 100);
        this.speechTimeout = setTimeout(() => {
            this.isTalking = false;
            this.speechText = "";
        }, timeoutMs);
        return timeoutMs;
    }

    update(dt = 16) {
        const dtMs = clamp(dt, 0, 100);

        if (this.expressionTimeLeftMs > 0) {
            this.expressionTimeLeftMs -= dtMs;
            if (this.expressionTimeLeftMs <= 0) {
                this.expression = 'neutral';
                this.expressionTimeLeftMs = 0;
            }
            return;
        }

        this.nextIdleActionInMs -= dtMs;
        if (this.nextIdleActionInMs > 0) return;

        // Choose a random idle expression
        const randomExpr = IDLE_EXPRESSIONS[Math.floor(Math.random() * IDLE_EXPRESSIONS.length)];
        this.expression = randomExpr;
        this.expressionTimeLeftMs = randBetween(600, 1200);
        this.nextIdleActionInMs = randBetween(2000, 5000);
    }

    draw() {
        // Get grid coordinates for current expression
        const coords = EXPRESSION_MAP[this.expression];
        if (!coords) return;

        const [row, col] = coords;

        // Fallback: simple placeholder if sprites aren't loaded yet
        if (!this.gridImage || !this.ready) {
            const w = Math.min(260, Math.floor(this.canvas.width * 0.45));
            const h = Math.min(320, Math.floor(this.canvas.height * 0.55));
            const x = Math.floor(this.x - w / 2);
            const y = Math.floor(this.y - h);
            this.ctx.fillStyle = 'rgba(255,255,255,0.85)';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 3;
            this.ctx.fillRect(x, y, w, h);
            this.ctx.strokeRect(x, y, w, h);
            this.ctx.fillStyle = '#000';
            this.ctx.font = '16px "Courier New", Courier, monospace';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('Loading…', x + w / 2, y + h / 2);

            if (this.speechText) {
                drawPixelSpeechBubble(this.ctx, this.canvas, x + w, y, this.speechText);
            }
            return;
        }

        // Calculate source region in grid
        const srcX = col * this.cellWidth;
        const srcY = row * this.cellHeight;

        // Scale portrait to fit nicely in the scene
        const maxH = Math.floor(this.canvas.height * 0.72);
        const maxW = Math.floor(this.canvas.width * 0.62);
        const scale = Math.min(maxW / this.cellWidth, maxH / this.cellHeight);

        const drawW = Math.floor(this.cellWidth * scale);
        const drawH = Math.floor(this.cellHeight * scale);

        const drawX = Math.floor(this.x - drawW / 2);
        const drawY = Math.floor(this.y - drawH);

        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(
            this.gridImage,
            srcX, srcY, this.cellWidth, this.cellHeight,
            drawX, drawY, drawW, drawH
        );

        if (this.speechText) {
            drawPixelSpeechBubble(this.ctx, this.canvas, drawX + drawW, drawY, this.speechText);
        }
    }
}

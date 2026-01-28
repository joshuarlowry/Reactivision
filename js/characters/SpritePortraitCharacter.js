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

export class SpritePortraitCharacter {
    constructor(canvas, ctx, opts = {}) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.basePath = opts.basePath || 'assets/characters/portrait_male_glasses';
        this.x = canvas.width / 2;
        this.y = canvas.height - 50;

        this.isTalking = false;
        this.speechText = "";

        this.pose = 'front'; // front | front_blink | look_left_15 | look_left_30 | look_right_15 | look_right_30
        this.poseTimeLeftMs = 0;
        this.nextIdleActionInMs = randBetween(1200, 3200);

        this.images = {
            front: null,
            front_blink: null,
            look_left_15: null,
            look_left_30: null
        };
        this.ready = false;

        this._loadPromise = this.loadSprites();
    }

    async loadSprites() {
        try {
            const [front, blink, left15, left30] = await Promise.all([
                loadImage(`${this.basePath}/front.png`),
                loadImage(`${this.basePath}/front_blink.png`),
                loadImage(`${this.basePath}/look_left_15.png`),
                loadImage(`${this.basePath}/look_left_30.png`)
            ]);

            this.images.front = front;
            this.images.front_blink = blink;
            this.images.look_left_15 = left15;
            this.images.look_left_30 = left30;
            this.ready = true;
        } catch (e) {
            // Keep running even if an asset fails to load
            this.ready = false;
            // eslint-disable-next-line no-console
            console.warn('Failed to load portrait sprites', e);
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

        if (this.poseTimeLeftMs > 0) {
            this.poseTimeLeftMs -= dtMs;
            if (this.poseTimeLeftMs <= 0) {
                this.pose = 'front';
                this.poseTimeLeftMs = 0;
            }
            return;
        }

        this.nextIdleActionInMs -= dtMs;
        if (this.nextIdleActionInMs > 0) return;

        // Choose the next idle action
        const r = Math.random();
        if (r < 0.72) {
            // Blink
            this.pose = 'front_blink';
            this.poseTimeLeftMs = randBetween(90, 140);
            this.nextIdleActionInMs = randBetween(1800, 4200);
        } else {
            // Look left/right (reuse left sprites and flip for right)
            const angle = Math.random() < 0.55 ? 15 : 30;
            const dir = Math.random() < 0.5 ? 'left' : 'right';
            this.pose = `look_${dir}_${angle}`;
            this.poseTimeLeftMs = randBetween(600, 1200);
            this.nextIdleActionInMs = randBetween(2600, 6500);
        }
    }

    draw() {
        const isLookRight = this.pose.startsWith('look_right_');
        const leftPose = isLookRight ? this.pose.replace('look_right_', 'look_left_') : this.pose;
        const img = this.ready ? this.images[leftPose] || this.images.front : null;

        // Fallback: simple placeholder if sprites aren't loaded yet
        if (!img) {
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

        // Scale portrait to fit nicely in the scene.
        // We keep it large, but avoid covering the whole canvas.
        const maxH = Math.floor(this.canvas.height * 0.72);
        const maxW = Math.floor(this.canvas.width * 0.62);
        const scale = Math.min(maxW / img.width, maxH / img.height);

        const drawW = Math.floor(img.width * scale);
        const drawH = Math.floor(img.height * scale);

        const drawX = Math.floor(this.x - drawW / 2);
        const drawY = Math.floor(this.y - drawH);

        this.ctx.imageSmoothingEnabled = false;
        if (isLookRight) {
            // Mirror horizontally around the portrait center
            this.ctx.save();
            this.ctx.translate(drawX + drawW, 0);
            this.ctx.scale(-1, 1);
            this.ctx.drawImage(img, 0, drawY, drawW, drawH);
            this.ctx.restore();
        } else {
            this.ctx.drawImage(img, drawX, drawY, drawW, drawH);
        }

        if (this.speechText) {
            drawPixelSpeechBubble(this.ctx, this.canvas, drawX + drawW, drawY, this.speechText);
        }
    }
}


import { drawPixelSpeechBubble } from './speechBubble.js';

export class PixelRobotCharacter {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.x = canvas.width / 2;
        this.y = canvas.height - 50; // Standing on ground
        this.isTalking = false;
        this.speechText = "";
        this.talkTimer = 0;

        // Pixel Art Configuration
        this.pixelScale = 12; // Scale factor for the pixels

        // 1 = Body (Light Grey)
        // 2 = Outline/Dark (Dark Grey)
        // 3 = Eye/Accent (Cyan)
        // 4 = Mouth (Black/Dark)
        // 5 = Highlight (White)
        this.spriteIdle = [
            [0,0,0,0,0,0,2,2,2,2,0,0,0,0,0,0], // Antenna top
            [0,0,0,0,0,0,2,3,3,2,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0], // Antenna stick
            [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0], // Head top
            [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],
            [0,0,0,2,1,3,3,1,1,3,3,1,2,0,0,0], // Eyes
            [0,0,0,2,1,3,3,1,1,3,3,1,2,0,0,0],
            [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],
            [0,0,0,2,1,1,1,4,4,1,1,1,2,0,0,0], // Mouth (closed)
            [0,0,0,2,1,1,1,1,1,1,1,1,2,0,0,0],
            [0,0,0,0,2,2,2,2,2,2,2,2,0,0,0,0], // Neck
            [0,0,2,2,2,2,2,2,2,2,2,2,2,2,0,0], // Shoulders
            [0,2,1,1,1,2,1,1,1,1,2,1,1,1,2,0], // Arms start
            [0,2,1,1,1,2,1,5,5,1,2,1,1,1,2,0], // Chest
            [0,2,1,1,1,2,1,1,1,1,2,1,1,1,2,0],
            [0,2,2,2,2,2,1,1,1,1,2,2,2,2,2,0], // Hands/Waist
            [0,0,0,0,0,2,1,1,1,1,2,0,0,0,0,0],
            [0,0,0,0,0,2,1,1,1,1,2,0,0,0,0,0],
            [0,0,0,0,0,2,2,0,0,2,2,0,0,0,0,0], // Legs split
            [0,0,0,0,0,2,1,2,0,2,1,2,0,0,0,0],
            [0,0,0,0,0,2,1,2,0,2,1,2,0,0,0,0],
            [0,0,0,0,2,2,2,2,0,2,2,2,2,0,0,0]  // Feet
        ];
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
        // Auto stop talking after some time based on text length
        if (this.speechTimeout) clearTimeout(this.speechTimeout);
        const timeoutMs = typeof opts.timeoutMs === 'number' ? opts.timeoutMs : Math.max(2000, text.length * 100);
        this.speechTimeout = setTimeout(() => {
            this.isTalking = false;
            this.speechText = "";
        }, timeoutMs);
        return timeoutMs;
    }

    update(dt = 16) {
        if (this.isTalking) {
            // Preserve prior behavior (~0.2 per frame at ~60fps)
            this.talkTimer += dt * 0.0125;
        } else {
            this.talkTimer = 0;
        }
    }

    draw() {
        const spriteHeight = this.spriteIdle.length * this.pixelScale;
        const spriteWidth = this.spriteIdle[0].length * this.pixelScale;

        // Center horizontally and stand on ground
        const drawX = Math.floor(this.x - spriteWidth / 2);
        const drawY = Math.floor(this.y - spriteHeight);

        this.drawSprite(drawX, drawY);

        // Speech Bubble
        if (this.speechText) {
            drawPixelSpeechBubble(this.ctx, this.canvas, drawX + spriteWidth, drawY, this.speechText);
        }
    }

    drawSprite(startX, startY) {
        const palette = {
            1: '#C0C0C0', // Silver
            2: '#2F2F2F', // Dark Grey/Black Outline
            3: '#00FFFF', // Cyan Eyes
            4: '#2F2F2F', // Mouth Base
            5: '#FFFFFF'  // Highlight
        };

        for (let r = 0; r < this.spriteIdle.length; r++) {
            for (let c = 0; c < this.spriteIdle[r].length; c++) {
                let pixelType = this.spriteIdle[r][c];

                // Animate Mouth
                if (this.isTalking) {
                    // Mouth coordinates in sprite grid: Row 8, Cols 7-8
                    if (r === 8 && (c === 7 || c === 8)) {
                        if (Math.sin(this.talkTimer * 2) > 0) {
                            pixelType = 3; // Light up mouth when talking
                        }
                    }
                }

                if (pixelType !== 0) {
                    this.ctx.fillStyle = palette[pixelType];
                    this.ctx.fillRect(
                        startX + c * this.pixelScale,
                        startY + r * this.pixelScale,
                        this.pixelScale,
                        this.pixelScale
                    );
                }
            }
        }
    }
}


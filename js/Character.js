export class Character {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.x = canvas.width / 2;
        this.y = canvas.height - 50; // Standing on ground
        this.isTalking = false;
        this.speechText = "";
        this.talkTimer = 0;
    }

    resize() {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height - 50;
    }

    setTalking(talking) {
        this.isTalking = talking;
    }

    say(text) {
        this.speechText = text;
        this.isTalking = true;
        // Auto stop talking after some time based on text length
        if (this.speechTimeout) clearTimeout(this.speechTimeout);
        this.speechTimeout = setTimeout(() => {
            this.isTalking = false;
            this.speechText = "";
        }, Math.max(2000, text.length * 100));
    }

    update() {
        if (this.isTalking) {
            this.talkTimer += 0.2;
        } else {
            this.talkTimer = 0;
        }
    }

    draw() {
        const headRadius = 20;
        const torsoLen = 50;
        const legLen = 40;
        
        // Key points
        const feetY = this.y;
        const hipY = feetY - legLen;
        const neckY = hipY - torsoLen;
        const headCy = neckY - headRadius;

        // Stick Figure Drawing
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;
        this.ctx.fillStyle = '#000';
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Head
        this.ctx.beginPath();
        this.ctx.arc(this.x, headCy, headRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.fillStyle = '#FFF';
        this.ctx.fill();

        // Eyes
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(this.x - 7, headCy - 5, 2, 0, Math.PI * 2);
        this.ctx.arc(this.x + 7, headCy - 5, 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Mouth (Talking Animation)
        this.ctx.beginPath();
        const mouthY = headCy + 8;
        if (this.isTalking) {
            const openAmount = 2 + Math.abs(Math.sin(this.talkTimer)) * 4;
            this.ctx.ellipse(this.x, mouthY, 6, openAmount, 0, 0, Math.PI * 2);
        } else {
            this.ctx.moveTo(this.x - 5, mouthY);
            this.ctx.lineTo(this.x + 5, mouthY);
        }
        this.ctx.stroke();

        // Torso
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, neckY);
        this.ctx.lineTo(this.x, hipY);
        this.ctx.stroke();

        // Arms
        const shoulderY = neckY + 10;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, shoulderY);
        this.ctx.lineTo(this.x - 30, shoulderY + 30); // Left Arm
        this.ctx.moveTo(this.x, shoulderY);
        this.ctx.lineTo(this.x + 30, shoulderY + 30); // Right Arm
        this.ctx.stroke();

        // Legs
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, hipY);
        this.ctx.lineTo(this.x - 20, feetY);
        this.ctx.moveTo(this.x, hipY);
        this.ctx.lineTo(this.x + 20, feetY);
        this.ctx.stroke();

        // Speech Bubble
        if (this.speechText) {
            this.drawSpeechBubble(this.x + 40, headCy - 40, this.speechText);
        }
    }

    drawSpeechBubble(x, y, text) {
        const padding = 10;
        this.ctx.font = '16px Arial';
        const textMetrics = this.ctx.measureText(text);
        const textWidth = textMetrics.width;
        const bubbleWidth = textWidth + padding * 2;
        const bubbleHeight = 34; 

        // Adjust position so it doesn't go off screen
        let drawX = x;
        if (drawX + bubbleWidth > this.canvas.width) {
            drawX = this.canvas.width - bubbleWidth - 10;
        }

        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;

        // Bubble rounded rect
        this.ctx.beginPath();
        this.ctx.roundRect(drawX, y - bubbleHeight, bubbleWidth, bubbleHeight, 5);
        this.ctx.fill();
        this.ctx.stroke();

        // Tail
        // Only draw tail if bubble is close to head (simple check)
        if (drawX === x) {
             this.ctx.beginPath();
             this.ctx.moveTo(drawX, y - 5);
             this.ctx.lineTo(drawX - 10, y + 10);
             this.ctx.lineTo(drawX + 15, y - 1);
             this.ctx.fill();
             // Re-stroke bubble border to cover tail overlap if needed, or just let it be
             // Simplified tail drawing
        }
        
        // Text
        this.ctx.fillStyle = 'black';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(text, drawX + padding, y - bubbleHeight + 22);
    }
}

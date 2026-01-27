export class Environment {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.backgroundColor = '#87CEEB'; // Sky blue default
        this.weatherType = 'clear'; // clear, rain, snow
        this.particles = [];
        this.resize();
    }

    resize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    setWeather(type) {
        this.weatherType = type;
        this.particles = []; // Reset particles on change
        // Initial population
        if (type !== 'clear') {
            const count = type === 'rain' ? 100 : 200;
            for (let i = 0; i < count; i++) {
                this.particles.push(this.createParticle(true));
            }
        }
    }

    setBackgroundColor(color) {
        this.backgroundColor = color;
    }

    createParticle(randomY = false) {
        const x = Math.random() * this.width;
        const y = randomY ? Math.random() * this.height : -10;
        const speed = this.weatherType === 'rain' 
            ? 10 + Math.random() * 10 
            : 1 + Math.random() * 2;
        
        return {
            x,
            y,
            speed,
            size: this.weatherType === 'rain' ? 2 : Math.random() * 3 + 1,
            drift: this.weatherType === 'snow' ? Math.random() * 2 - 1 : 0
        };
    }

    update() {
        if (this.weatherType === 'clear') return;

        // Add new particles to maintain density
        const targetCount = this.weatherType === 'rain' ? 100 : 200;
        if (this.particles.length < targetCount) {
             this.particles.push(this.createParticle());
        }

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.y += p.speed;
            p.x += p.drift;

            // Reset if out of bounds
            if (p.y > this.height) {
                this.particles[i] = this.createParticle();
            }
            if (p.x > this.width || p.x < 0) {
                 if (this.weatherType === 'snow') {
                     // Wrap around for snow
                     p.x = p.x > this.width ? 0 : this.width;
                 } else {
                     this.particles[i] = this.createParticle();
                 }
            }
        }
    }

    draw() {
        // Draw Background
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw Ground (Simple)
        this.ctx.fillStyle = '#4CAF50'; // Green grass
        this.ctx.fillRect(0, this.height - 50, this.width, 50);

        // Draw Weather
        this.ctx.fillStyle = this.weatherType === 'rain' ? '#0000FF' : '#FFFFFF';
        this.ctx.strokeStyle = '#0000FF';
        this.ctx.lineWidth = 1;

        for (const p of this.particles) {
            if (this.weatherType === 'rain') {
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x, p.y + 10);
                this.ctx.stroke();
            } else {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
}

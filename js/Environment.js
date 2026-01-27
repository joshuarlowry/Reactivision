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
            const count = type === 'rain' ? 80 : 150; // Fewer particles for cleaner look
            for (let i = 0; i < count; i++) {
                this.particles.push(this.createParticle(true));
            }
        }
    }

    setBackgroundColor(color) {
        this.backgroundColor = color;
    }

    createParticle(randomY = false) {
        const x = Math.floor(Math.random() * this.width);
        const y = randomY ? Math.floor(Math.random() * this.height) : -10;
        const speed = this.weatherType === 'rain' 
            ? 12 + Math.random() * 8 
            : 2 + Math.random() * 2;
        
        // Pixel sizes
        const size = this.weatherType === 'rain' ? 2 : Math.floor(Math.random() * 3 + 3);

        return {
            x,
            y,
            speed,
            size,
            drift: this.weatherType === 'snow' ? Math.floor(Math.random() * 3 - 1) : 0
        };
    }

    update() {
        if (this.weatherType === 'clear') return;

        // Add new particles to maintain density
        const targetCount = this.weatherType === 'rain' ? 80 : 150;
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
        this.ctx.imageSmoothingEnabled = false;

        // Draw Background
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw Ground (Pixel Art Style)
        const groundHeight = 60;
        const groundY = this.height - groundHeight;
        
        // Main ground
        this.ctx.fillStyle = '#4CAF50'; // Green grass
        this.ctx.fillRect(0, groundY, this.width, groundHeight);
        
        // Top edge highlight/texture
        this.ctx.fillStyle = '#66BB6A'; 
        this.ctx.fillRect(0, groundY, this.width, 4);

        // Draw Weather
        this.ctx.fillStyle = this.weatherType === 'rain' ? '#0000FF' : '#FFFFFF';
        
        for (const p of this.particles) {
            // Snap to grid for pixel effect (optional, but looks nice)
            const px = Math.floor(p.x);
            const py = Math.floor(p.y);

            if (this.weatherType === 'rain') {
                // Rain drops are tall rectangles
                this.ctx.fillRect(px, py, 2, 8);
            } else {
                // Snow flakes are squares
                this.ctx.fillRect(px, py, p.size, p.size);
            }
        }
    }
}

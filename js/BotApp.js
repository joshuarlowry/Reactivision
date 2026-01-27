import { Environment } from './Environment.js';
import { Character } from './Character.js';

export class BotApp {
    constructor() {
        this.canvas = document.getElementById('bot-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.environment = new Environment(this.canvas, this.ctx);
        this.character = new Character(this.canvas, this.ctx);
        
        this.lastTime = 0;
        this.resize();

        window.addEventListener('resize', () => this.resize());
        requestAnimationFrame((t) => this.loop(t));
    }

    resize() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        
        this.environment.resize();
        this.character.resize();
    }

    setWeather(type) {
        this.environment.setWeather(type);
    }

    setBackgroundColor(color) {
        this.environment.setBackgroundColor(color);
    }

    setTalking(isTalking) {
        this.character.setTalking(isTalking);
    }

    say(text) {
        this.character.say(text);
    }

    loop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        this.environment.update();
        this.character.update();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.environment.draw();
        this.character.draw();
    }
}

import { BotApp } from './BotApp.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = new BotApp();

    // Test Harness Controls
    const weatherSelect = document.getElementById('weather-select');
    const bgColorInput = document.getElementById('bg-color');
    const talkBtn = document.getElementById('talk-btn');
    const sayBtn = document.getElementById('say-btn');
    const speechInput = document.getElementById('speech-input');

    // Weather Control
    weatherSelect.addEventListener('change', (e) => {
        app.setWeather(e.target.value);
    });

    // Background Color Control
    bgColorInput.addEventListener('input', (e) => {
        app.setBackgroundColor(e.target.value);
    });

    // Toggle Talking
    let isTalking = false;
    talkBtn.addEventListener('click', () => {
        isTalking = !isTalking;
        app.setTalking(isTalking);
        talkBtn.textContent = isTalking ? "Stop Talking" : "Toggle Talking";
    });

    // Say Text
    sayBtn.addEventListener('click', () => {
        const text = speechInput.value;
        if (text.trim()) {
            app.say(text);
            speechInput.value = '';
        }
    });

    // Allow Enter key to submit speech
    speechInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sayBtn.click();
        }
    });
});

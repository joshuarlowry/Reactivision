import { BotApp } from './BotApp.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = new BotApp();

    // Test Harness Controls
    const characterSelect = document.getElementById('character-select');
    const weatherSelect = document.getElementById('weather-select');
    const bgColorInput = document.getElementById('bg-color');
    const talkBtn = document.getElementById('talk-btn');
    const sayBtn = document.getElementById('say-btn');
    const speechInput = document.getElementById('speech-input');
    const expressionGroup = document.getElementById('expression-group');
    const expressionSelect = document.getElementById('expression-select');

    // Character Control
    if (characterSelect) {
        characterSelect.value = app.getCharacter();
        characterSelect.addEventListener('change', (e) => {
            app.setCharacter(e.target.value);
            // Show/hide expression selector based on character
            if (expressionGroup) {
                expressionGroup.style.display = e.target.value === 'grid_portrait' ? 'block' : 'none';
            }
        });
    }

    // Expression Control (for Grid Portrait character)
    if (expressionSelect) {
        expressionSelect.addEventListener('change', (e) => {
            app.setExpression(e.target.value);
        });
    }

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

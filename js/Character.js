import { PixelRobotCharacter } from './characters/PixelRobotCharacter.js';
import { SpritePortraitCharacter } from './characters/SpritePortraitCharacter.js';

export const CHARACTER_CATALOG = {
    robot: {
        label: 'Robot (pixel)',
        create: (canvas, ctx) => new PixelRobotCharacter(canvas, ctx)
    },
    portrait_male_glasses: {
        label: 'Portrait (sprite)',
        create: (canvas, ctx) => new SpritePortraitCharacter(canvas, ctx, {
            basePath: 'assets/characters/portrait_male_glasses'
        })
    }
};

export class Character {
    constructor(canvas, ctx, type = 'robot') {
        this.canvas = canvas;
        this.ctx = ctx;

        this._type = null;
        this._impl = null;

        // Preserve conversational state across swaps
        this._isTalking = false;
        this._speechText = '';

        this.setType(type);
    }

    getType() {
        return this._type;
    }

    setType(type) {
        const desired = CHARACTER_CATALOG[type] ? type : 'robot';
        if (this._type === desired && this._impl) return;

        this._type = desired;
        this._impl = CHARACTER_CATALOG[desired].create(this.canvas, this.ctx);

        // Re-apply state to new impl
        if (this._speechText) {
            this._impl.say?.(this._speechText);
        } else {
            this._impl.setTalking?.(this._isTalking);
        }
        this._impl.resize?.();
    }

    resize() {
        this._impl?.resize?.();
    }

    setTalking(talking) {
        this._isTalking = talking;
        this._impl?.setTalking?.(talking);
    }

    say(text) {
        this._speechText = text;
        this._isTalking = true;
        this._impl?.say?.(text);
    }

    update(dt) {
        this._impl?.update?.(dt);
    }

    draw() {
        this._impl?.draw?.();
    }
}

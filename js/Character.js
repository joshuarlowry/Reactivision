import { PixelRobotCharacter } from './characters/PixelRobotCharacter.js';
import { SpritePortraitCharacter } from './characters/SpritePortraitCharacter.js';
import { GridPortraitCharacter } from './characters/GridPortraitCharacter.js';

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
    },
    grid_portrait: {
        label: 'Grid Portrait',
        create: (canvas, ctx) => new GridPortraitCharacter(canvas, ctx, {
            basePath: 'assets/characters/grid_portrait',
            cellWidth: 256,
            cellHeight: 320,
            cols: 6,
            rows: 6
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
        this._speechExpiresAt = 0;
        this._speechClearTimeout = null;
        this._speechId = 0;

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
        const now = Date.now();
        if (this._speechText && this._speechExpiresAt > now) {
            const remainingMs = Math.max(0, this._speechExpiresAt - now);
            this._impl.say?.(this._speechText, { timeoutMs: remainingMs });
        } else {
            // Speech expired (or never existed)
            this._speechText = '';
            this._speechExpiresAt = 0;
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
        const timeoutMs = this._impl?.say?.(text) ?? Math.max(2000, text.length * 100);
        const now = Date.now();
        this._speechExpiresAt = now + timeoutMs;

        // Ensure stale speech can't be resurrected later
        this._speechId += 1;
        const myId = this._speechId;
        if (this._speechClearTimeout) clearTimeout(this._speechClearTimeout);
        this._speechClearTimeout = setTimeout(() => {
            if (this._speechId !== myId) return;
            this._speechText = '';
            this._speechExpiresAt = 0;
        }, timeoutMs);
    }

    update(dt) {
        this._impl?.update?.(dt);
    }

    draw() {
        this._impl?.draw?.();
    }

    setExpression(expression) {
        this._impl?.setExpression?.(expression);
    }
}

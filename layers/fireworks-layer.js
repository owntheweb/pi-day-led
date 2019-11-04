
const { Layer } = require('./layer');
const { fadeCanvas, randRgbFillStyle, randRgbShadeStyle } = require('../utils/canvas-utils');
const { hexToRgb } = require('../utils/utils');

class FireworksLayer extends Layer {
    
    constructor(config) {        
        super(config);

        this.rate = this.config.hasOwnProperty('rate') ? this.config.rate : 1;
        // this.color = this.config.hasOwnProperty('color') ? this.config.color : 'rainbow';
        this.colors = this.config.hasOwnProperty('colors') ? this.config.colors : [];
        // this.rgb = this.color !== 'rainbow' ? hexToRgb(this.color) : undefined;
        this.maxProjDist = this.config.hasOwnProperty('maxProjDist') ? this.config.maxProjDist : 8;
        this.fireworks = [];

        // fireworks per frame multiplier
        const baseFireworksPerSecond = 10;
        const fireworksPerSecond = baseFireworksPerSecond * this.rate;
        this.fireworksPerFameMult = 1 - (fireworksPerSecond / this.config.frameRate);
    };

    // number of fireworks to add per individual frame
    // this may often be 0
    // TODO: check this, currently maxed at 1 per frame
    numFireworks() {
        if(Math.random() > this.fireworksPerFameMult) {
            return 1;
        }
        return 0;
    }

    // determine firework fill style with some random variety included
    fireworkFillStyle() {
        if (this.colors.length > 0) {
            const activeColor = this.colors[Math.floor(Math.random() * this.colors.length)];
            const rgb = hexToRgb(activeColor);
            return randRgbShadeStyle(rgb.r, rgb.g, rgb.b, 0.7);
        }
        return randRgbFillStyle();
    }

    // make simple fireworks suitable for a small led sign
    makeFirework() {
        return {
            fillStyle: this.fireworkFillStyle(),
            projDist: 0,
            x: Math.floor(Math.random() * this.canvas.width),
            y: Math.floor(Math.random() * this.canvas.height)
        }
    }

    // add fireworks to the scene at a given rate
    addFireworks() {
        const numFireworks = this.numFireworks();
        for (let i = 0; i < numFireworks; i++) {
            this.fireworks.push(this.makeFirework());
        }
    }

    // clear out spent fireworks
    clearOldFireworks() {
        this.fireworks = this.fireworks.filter(firework => {
            if(firework.projDist <= this.maxProjDist) {
                return true;
            }
            return false;
        });
    }

    drawFireworkProjectile(fillStyle, x, y) {
        this.ctx.beginPath();
        this.ctx.fillStyle = fillStyle;
        this.ctx.rect(x, y, 1, 1);
        this.ctx.fill();
    }

    // animate all fireworks
    animateFireworks() {
        this.fireworks = this.fireworks.map(firework => {
            if(firework.projDist === 0) {
                // new fireworks just draw the center point to start
                this.drawFireworkProjectile(firework.fillStyle, firework.x, firework.y);
            } else {
                // send projectiles outward in 45 degree angles
                this.drawFireworkProjectile(firework.fillStyle, firework.x, firework.y - firework.projDist); // 0
                this.drawFireworkProjectile(firework.fillStyle, firework.x + firework.projDist / 2.5, firework.y - firework.projDist / 2.5); // 45
                this.drawFireworkProjectile(firework.fillStyle, firework.x + firework.projDist, firework.y); // 90
                this.drawFireworkProjectile(firework.fillStyle, firework.x + firework.projDist / 2.5, firework.y + firework.projDist / 2.5); // 120
                this.drawFireworkProjectile(firework.fillStyle, firework.x, firework.y + firework.projDist); // 180
                this.drawFireworkProjectile(firework.fillStyle, firework.x - firework.projDist / 2.5, firework.y + firework.projDist / 2.5); // 225
                this.drawFireworkProjectile(firework.fillStyle, firework.x - firework.projDist, firework.y); // 270
                this.drawFireworkProjectile(firework.fillStyle, firework.x - firework.projDist / 2.5, firework.y - firework.projDist / 2.5); // 315
            }
            firework.projDist++;
            return firework;
        });
    }

    // get a frame of the animation
    getFrame() {
        this.frameInt++;
        this.addFireworks();
        this.clearOldFireworks();
        this.animateFireworks();
        fadeCanvas(this.ctx, this.canvas.width, this.canvas.height, {r: 0, g: 0, b: 0}); // TODO: set fade to color in config instead of 0, 0, 0
        return this.canvas;
    }

};

module.exports = {
    FireworksLayer
};

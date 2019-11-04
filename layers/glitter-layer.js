
// TODO: scene transitions (we'll start without)
const { Layer } = require('./layer');
const { fadeCanvas, randRgbFillStyle, randRgbShadeStyle } = require('../utils/canvas-utils');
const { hexToRgb, randInt } = require('../utils/utils');

class GlitterLayer extends Layer {
    
    constructor(config) {        
        super(config);

        this.rate = this.config.hasOwnProperty('rate') ? this.config.rate : 1;
        this.color = this.config.hasOwnProperty('color') ? this.config.color : 'rainbow';
        this.rgb = this.color !== 'rainbow' ? hexToRgb(this.color) : undefined;
        this.backgroundColor = this.config.hasOwnProperty('backgroundColor') ? this.config.backgroundColor : '#000000';
        this.backgroundRgb = hexToRgb(this.backgroundColor);
    };

    // determine number of pixels to generate based on rate float value
    numPixels() {
        const int = Math.floor(this.rate);
        const dec = int - this.rate;
        const numPixels = int + Math.round(Math.random() * dec);
        return numPixels;
    }

    // set a random pixel fill style based on provided RGB (same color)
    pixelFillStyle() {
        if (this.color !== 'rainbow') {
            return randRgbShadeStyle(this.rgb.r, this.rgb.g, this.rgb.b, 0.5);
        }
        return randRgbFillStyle();
    }

    // add a color pixel
    addPixels() {
        const numPixels = this.numPixels();
        for (let i = 0; i < numPixels; i++) {
            this.ctx.beginPath();
            this.ctx.fillStyle = this.pixelFillStyle();
            this.ctx.rect(randInt(this.canvas.width), randInt(this.canvas.height), 1, 1);
            this.ctx.fill();
        }
    }

    // get a frame of the animation
    getFrame() {
        this.frameInt++;
        this.addPixels();
        fadeCanvas(
            this.ctx,
            this.canvas.width,
            this.canvas.height,
            {
                r: this.backgroundRgb.r,
                g: this.backgroundRgb.g,
                b: this.backgroundRgb.b
            }
        );
        return this.canvas;
    }

};

module.exports = {
    GlitterLayer
};

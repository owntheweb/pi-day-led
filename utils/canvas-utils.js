
const { registerFont } = require('canvas');
const { randInt } = require('./utils');

module.exports = {
    fillCanvas: (ctx, canvasWidth, canvasHeight, r, g, b, a) => {
        ctx.beginPath();
        ctx.rect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = `rgba(${r}, ${r}, ${r}, ${a})`;
        ctx.fill();
    },
    
    // apply fade to all pixels, with noise values to prevent an odd canvas alpha rounding issue
    // thanks: http://jsfiddle.net/R4V97/97/
    fadeCanvas: (ctx, canvasWidth, canvasHeight, rgb) => {
        const fadeAlpha = 0.1 + (Math.random() * 0.2);
        ctx.beginPath();
        ctx.rect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${fadeAlpha}`;
        ctx.fill();
    },

    // register fonts for canvas use
    // TODO: DO NOT DISTRIBUTE until font licenses and/or install instructions are properly handled
    // TODO: fonts config file import
    registerFonts: () => {
        registerFont('./fonts/Pixellari.ttf', { family: 'Pixellari' });
        registerFont('./fonts/rainyhearts.ttf', { family: 'Rainy Hearts' });
        registerFont('./fonts/OwreKynge.ttf', { family: 'Owre Kynge' });
        registerFont('./fonts/PixelOperator.ttf', { family: 'Pixel Operator' });
    },

    randRgbFillStyle: () => {
        return `rgb(${randInt(255)}, ${randInt(255)}, ${randInt(255)})`;
    },

    // get random shade for a color (add black)
    randRgbShadeStyle: (r, g, b, minShade) => {
        const shadeMult = (Math.random() * (1.0 - minShade)) + minShade;
        const shaded = {
            r: Math.round(r * shadeMult),
            g: Math.round(g * shadeMult),
            b: Math.round(b * shadeMult),
        };
        return `rgb(${shaded.r}, ${shaded.g}, ${shaded.b})`;
    }
}
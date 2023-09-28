const { Layer } = require('./layer');
const { fadeCanvas } = require('../utils/canvas-utils');
const { createCanvas } = require('canvas');

// super crude to start for specific project that needs completed quickly with little chance of reuse
// (kick me if reusing this code)
class LightningLayer extends Layer {
    constructor(config) {
        super(config);
    }

    // make simple fireworks suitable for a small led sign
    makeLightning() {
        return {
            fillStyle: this.fireworkFillStyle(),
            projDist: 0,
            x: Math.floor(Math.random() * this.canvas.width),
            y: Math.floor(Math.random() * this.canvas.height),
        };
    }

    // generate a lightning bolt
    // Thanks GPT-4, kinda (had to make a few changes, ok starter/inspiration though)
    generateBolt = (ctx, x1, y1, x2, y2, displace, width) => {
        if (displace < 1) {
            // additive blending mode
            ctx.globalCompositeOperation = 'lighter';

            // blue glow
            ctx.lineWidth = 4;
            ctx.strokeStyle = 'rgba(0,50,255, 0.6)';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            // TEMP: displaced for quick stacked panel project where all this code breaks with normal things
            ctx.lineWidth = 4;
            ctx.strokeStyle = 'rgba(0,50,255, 0.6)';
            ctx.beginPath();
            ctx.moveTo(x1 + (width * 0.5), y1);
            ctx.lineTo(x2 + (width * 0.5), y2);
            ctx.stroke();
            // END TEMP

            // white line
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgb(255,255,255)';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            // TEMP: displaced for quick stacked panel project where all this code breaks with normal things
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgb(255,255,255)';
            ctx.beginPath();
            ctx.moveTo(x1 + (width * 0.5), y1);
            ctx.lineTo(x2 + (width * 0.5), y2);
            ctx.stroke();
            // END TEMP

            // reset blending mode to default
            ctx.globalCompositeOperation = 'source-over';
        } else {
            let midX = (x2 + x1) / 2;
            let midY = (y2 + y1) / 2;
            midX += Math.round((Math.random() - 0.5) * displace);
            midY += Math.round((Math.random() - 0.5) * displace);
            this.generateBolt(ctx, x1, y1, midX, midY, displace / 2);
            this.generateBolt(ctx, x2, y2, midX, midY, displace / 2);
        }
    };

    // get a frame of the animation
    getFrame() {
        this.frameInt++;
        fadeCanvas(this.ctx, this.canvas.width, this.canvas.height, {
            r: 0,
            g: 0,
            b: 0,
        });

        // TEMP DISABLED: how this should normally work, don't lose it
        const boltStartX = Math.round(Math.random() * this.canvas.width);
        const boltEndX = Math.round(
            boltStartX +
                Math.random() *
                    this.canvas.width *
                    0.4 *
                    (Math.random() < 0.5 ? -1 : 1)
        );
        this.generateBolt(
            this.ctx,
            boltStartX,
            0,
            boltEndX,
            this.canvas.height,
            15
        );


        // TEMP: displaced for quick stacked panel project where all this code breaks with normal things
        /*
        const boltStartX1 = Math.round(Math.random() * this.canvas.width * 0.5);
        const boltEndX1 = Math.round(
            boltStartX1 +
                Math.random() *
                    this.canvas.width * 0.5 *
                    0.4 *
                    (Math.random() < 0.5 ? -1 : 1)
        );
        this.generateBolt(
            this.ctx,
            boltStartX1,
            0,
            boltEndX1,
            this.canvas.height,
            15,
            this.canvas.width,
        );
        */
        // END TEMP

        return this.canvas;
    }
}

module.exports = {
    LightningLayer,
};

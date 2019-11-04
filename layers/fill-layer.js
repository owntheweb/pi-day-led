
// TODO: scene transitions (we'll start without)
const { Layer } = require('./layer');

class FillLayer extends Layer {
    
    constructor(config) {        
        super(config);
    };

    // TODO: only update the canvas if there's a fill change?
    getFrame() {
        this.frameInt++;
        // only render canvas once
        if(this.frameInt <= 0) {
            this.ctx.beginPath();
            this.ctx.rect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
            this.ctx.fillStyle = this.config.fillStyle;
            this.ctx.fill();
        }
        return this.canvas;
    }

};

module.exports = {
    FillLayer
};

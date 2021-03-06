
const { Layer } = require('./layer');

class ScrollingTextLayer extends Layer {
    
    constructor(config) {        
        super(config);

        this.ctx.fillStyle = this.config.fillStyle;
        this.ctx.font = this.config.size + 'px "' + this.config.font + '"';
        this.x = this.config.canvasWidth + 20;
        this.y = this.config.canvasHeight - Math.floor(this.config.size * 0.25);
        this.loops = this.config.hasOwnProperty('loops') ? this.config.loops : 0;
        this.text = this.config.hasOwnProperty('text') ? this.config.text : 'No text to scroll was specified. Have a nice day!';
        this.textMeasurement = this.ctx.measureText(this.text);
    };

    getFrame() {
        this.frameInt++;
        this.x -= this.config.speed;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillText(this.text, this.x, this.y);

        if (this.x < -this.textMeasurement.width - 20) {
            this.loops--;
            if (this.loops < 0) {
                this.completeEvent();
            } else {
                this.x = this.canvas.width + 20;
            }
        }
        return this.canvas;
    }

};

module.exports = {
    ScrollingTextLayer
};

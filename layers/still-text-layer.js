
const { Layer } = require('./layer');

class StillTextLayer extends Layer {
    
    constructor(config) {        
        super(config);

        this.ctx.fillStyle = this.config.fillStyle;
        this.ctx.font = this.config.size + 'px "' + this.config.font + '"';
        this.align = this.config.hasOwnProperty('align') ? this.config.align : 'left'; // left, center, right
        this.padding = this.config.hasOwnProperty('padding') ? this.config.padding : 0; // padding from align e.g. padding of 10 left aligned will pad left by 10 only
        this.text = this.config.hasOwnProperty('text') ? this.config.text : 'Hello!';
    };

    addText() {
        const textMeasurement = this.ctx.measureText(this.text);
        const textY = this.canvas.height - Math.floor(this.config.size * 0.25);
        let textX = 0;
        if (this.align === 'right') {
            textX = this.canvas.width - textMeasurement.width - this.padding;
        } else if (this.align === 'center') {
            textX = Math.round((this.canvas.width * .5) - (textMeasurement.width * .5));
        } else {
            // 'left' or something else that will default to left
            textX = this.padding;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillText(this.text, textX, textY);
    }

    getFrame() {
        this.frameInt++;

        // Draw still text once.
        if(this.frameInt <= 0) {
            this.addText();
        }
        return this.canvas;
    }

};

module.exports = {
    StillTextLayer
};

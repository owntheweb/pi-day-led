
// TODO: scene transitions (we'll start without)
const { createCanvas } = require('canvas');
const { EventEmitter } = require('events');
const { fromEvent } = require('rxjs');

class Layer {
    
    constructor(config) {        
        this.config = config;

        this.canvas = createCanvas(this.config.canvasWidth, this.config.canvasHeight);
        this.ctx = this.canvas.getContext('2d');

        this.eventEmitter = new EventEmitter();
        this.frameInt = -1;
        
        this.suffixDelay = this.config.hasOwnProperty('suffixDelay') ? this.config.suffixDelay : 0;

        this.showForTimeout = this.config.hasOwnProperty('seconds') ? this.showFor(this.config.seconds) : null;
    };

    // ensure config is valid
    configIsValid(config) {
        return true;
    }

    // emit a complete event when/if timer is set
    // TODO: Return observable instead?
    showFor(seconds) {
        setTimeout(() => {
            this.completeEvent();
        }, seconds * 1000);
    }

    getCompleteObservable() {
        if(!this.eventSource) {
            this.eventSource = fromEvent(this.eventEmitter, 'complete');
        }
        return this.eventSource;
    }

    completeEvent() {
        this.eventEmitter.emit('complete', 'complete');
    }

    // get a frame of the animation
    getFrame() {
        this.frameInt++;
        // only render canvas once for this starter example (other layer types will override this)
        if(this.frameInt <= 0) {
            this.ctx.beginPath();
            this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
            // 16777215 = decimal value of white
            this.ctx.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16);
            this.ctx.fill();
        }
        return this.canvas;
    }

};

module.exports = {
    Layer
};

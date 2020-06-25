const { Scheduler, interval, Subscriber, merge, Observable } = require('rxjs');
const { take, scan, flatMap } = require('rxjs/operators');
const LedMatrix = require('easybotics-rpi-rgb-led-matrix');
const { createCanvas } = require('canvas');
const Layers = require('./layers/layers');
const terminalImage = require('terminal-image');
const Jetty = require('jetty');
const { performance } = require('perf_hooks');
const { fillCanvas, registerFonts } = require('./utils/canvas-utils');

class PiLedDisplay {
    
    constructor(config) {        
        this.config = config;

        // render to console locally for preview purposes, to led matrix on Pi
        this.outputMethod = this.config.output === 'console' ? this.renderCanvasToConsole : this.renderCanvasToMatrix;

        // canvas that will be output to led matrix or terminal
        this.canvasWidth = this.config.ledMatrix.columns * this.config.ledMatrix.parallelDisplays;
        this.canvasHeight = this.config.ledMatrix.rows * this.config.ledMatrix.chainedDisplays;
        this.canvas = createCanvas(this.canvasWidth, this.canvasHeight);
        this.ctx = this.canvas.getContext('2d');
        
        // scene setup
        this.scenes = this.config.scenes;
        this.sceneInt = -1;
        this.sceneLayers = [];
        this.sceneObservables = [];
        this.sceneCompleteSubscriber = new Subscriber();

        //used to prevent race conditions if currently drawing to canvas
        this.drawing = false;

        this.animationInterval = Math.floor(1000 / this.config.ledMatrix.frameRate);
    };

    // get things going
    init() {
        // register fonts with canvas module once, covering all included layers that use custom fonts by name
        registerFonts();
        
        // prepare image output
        if (this.config.output === 'pi') {
            this.initLedMatrix();
        } else if (this.config.output === 'console') {
            // allow for clearing of terminal to draw mock led panel in same spot
            // TODO: Maybe send this to browser preview instead or in addition? It gets REALLY jittery in console...
            this.jetty = new Jetty(process.stdout);
        }

        // start the first scene
        this.nextScene();

        // start the animation loop
        this.animationLoop();
    }

    // ensure config is valid
    // TODO: TypeScript interfaces would be nice for this...
    configIsValid(config) {
        return true;
    }

    // clear anything from the old scene and set the stage for the next
    clearScene() {
        this.sceneLayers = [];
        fillCanvas(this.ctx, this.canvas.width, this.canvas.height, 0, 0, 0, 1.0);
    }

    // return one merged observable to listen for complete events, first complete event triggers next scene
    getMergedLayerObservable() {
        if (this.sceneLayers.length === 0) {
            throw new Error('There are no layers in the specified scene.');
        }
        if (this.sceneLayers.length > 1) {
            return this.sceneLayers.reduce((merged, source) => {
                return merge(merged.getCompleteObservable(), source.getCompleteObservable());
            });
        } else {
            return this.sceneLayers[0].getCompleteObservable();
        }
    }

    // set the next scene
    nextScene() {
        this.clearScene();
        this.sceneInt = this.sceneInt + 1 >= this.scenes.length ? 0 : this.sceneInt + 1;

        // add layers
        this.config.scenes[this.sceneInt].layers.map(layer => {
            this.addLayer(layer);
        });

        // listen for complete events
        // the first layer to complete triggers complete for the scene
        this.getMergedLayerObservable()
        .pipe(
            take(1)
        )
        .subscribe(complete => {
            this.nextScene();
        });
    }

    // add a layer to the scene (think Photoshop or Gimp layer of an image project,
    // first layer gets covered by second, etc.)
    addLayer(layer) {
        const config = {
            canvasWidth: this.canvas.width,
            canvasHeight: this.canvas.height,
            frameRate: this.config.ledMatrix.frameRate,
            ...layer
        };

        try {
            this.sceneLayers.push(new Layers[config.type](config));
        } catch (err) {
            console.log(`Unable to create a layer type of ${config.type}`, err);
        }
    }

    // init Raspberry Pi led matrix
    initLedMatrix() {
        this.matrix = new LedMatrix(this.config.ledMatrix.rows, this.config.ledMatrix.columns, this.config.ledMatrix.chainedDisplays, this.config.ledMatrix.parallelDisplays, this.config.ledMatrix.brightness, this.config.ledMatrix.hardwareMapping);
    }

    // render canvas to led matrix
    renderCanvasToMatrix() {
        return Observable.create(observer => {
            try {
                const width = this.canvas.width;
                const height = this.canvas.height;
                // grabbing all canvas image data at once saves mucho cpu:
                const colorData = this.ctx.getImageData(0, 0, width, height).data;
                let x = 0;
                let y = 0;
                const maxLength = colorData.length - 4;
                for (let i = 0; i <= maxLength; i += 4) {
                    x = (i / 4) % width;
                    y = Math.floor((i / 4) / width);
                    this.matrix.setPixel(x, y, colorData[i], colorData[i + 1], colorData[i + 2]);
                }
                this.matrix.update();
                observer.next(true);
                observer.complete();
            } catch (err) {
                observer.error(`There was an error rendering canvas to console. ${err}`);
            }
        });
    }

    // render canvas to console image
    renderCanvasToConsole() {
        return Observable.create(observer => {
            try {
                terminalImage.buffer(this.canvas.toBuffer('image/png'))
                   .then(img => {
                        this.jetty.clear();
                        process.stdout.write(img);
                        observer.next(true);
                        observer.complete();
                   });
                
            } catch (err) {
                observer.error(`There was an error rendering canvas to console. ${err}`);
            }
        });
    }

    // render individual layer canvases for a scene
    renderLayers() {
        return Observable.create(observer => {
            try {
                const renderedLayers = this.sceneLayers.map(layer => layer.getFrame());
                observer.next(renderedLayers);
                observer.complete();
            } catch (err) {
                observer.error(`There was an error rendering layers. ${err}`);
            }
        });
    }
    
    // mix layers to a single canvas image
    layersToCanvas(renderedLayers) {
        return Observable.create(observer => {
            try {
                renderedLayers.map(canvas => {
                    this.ctx.drawImage(canvas, 0, 0);
                });
                observer.next(true);
                observer.complete();
            } catch (err) {
                observer.error(`There was an error applying layers to canvas. ${err}`);
            }
        });
    }

    // animate layers for slide
    animateFrame() {
        return Observable.create(observer => {
            this.renderLayers()
                .pipe(
                    flatMap(renderedLayers => this.layersToCanvas(renderedLayers)),
                    flatMap(() => this.outputMethod()),
                )
                .subscribe(
                    () => {
                        observer.next(true);
                        observer.complete();
                    },
                    err => {
                        observer.error(`There was an error rendering the frame. ${err}`);
                    }
                );
        });
    }

    // control animation frame rate
    startAnimationClock() {
        const state = {
            prevFrameTime: performance.now(),
            time: performance.now(),
            delta: 0,
        };

        const clock = interval(this.animationInterval, Scheduler.animationFrame)
            .pipe(
                scan(
                    previous => {
                        const time = performance.now();
                        return {
                            time,
                            delta: time - previous.time,
                        };
                    }, 
                    state
                )
            );
        
        return clock;
    }

    // animation loop management
    animationLoop() {
        let rendering = false;
        let skippedFrames = 0;
        
        const clock = this.startAnimationClock();
        clock.subscribe(state => {
            if (rendering === false) {
                rendering = true;
                
                this.animateFrame()
                .subscribe(
                    () => {
                        rendering = false;
                    },
                    err => {
                        console.error('There was an error rendering the frame.', err);
                    }
                );
            } else {
                // TODO: This is often a sign of something wrong in the rendering code
                // If there are too many skipped frames, may be best to log and restart?
                skippedFrames++;
                console.log(`skipped frame: ${skippedFrames}`);
            }
        });
    }

};

module.exports = {
    PiLedDisplay
};

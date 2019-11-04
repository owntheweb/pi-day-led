const fs = require('fs');
const yaml = require('js-yaml');
const { bindNodeCallback, of } = require('rxjs');
const { flatMap } = require('rxjs/operators');
const { PiLedDisplay } = require('./pi-led-display');

const configPath = './config/config.yml';
const configEncoding = 'utf8';

const readFile = bindNodeCallback(fs.readFile);

readFile(configPath, configEncoding)
    .pipe(flatMap(yamlString => of(yaml.safeLoad(yamlString))))
    .subscribe(
        config => {
            const piDisplay = new PiLedDisplay(config);
            piDisplay.init();
        },
        err => console.error(err)
    );

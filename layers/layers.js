const { Layer } = require('./layer');
const { FillLayer } = require('./fill-layer');
const { ScrollingTextLayer } = require('./scrolling-text-layer');
const { GlitterLayer } = require('./glitter-layer');
const { FireworksLayer } = require('./fireworks-layer');
const { DailyObservancesLayer } = require('./daily-observances/daily-observances-layer');

module.exports = {
    'Reference': Layer,
    'Fill': FillLayer,
    'ScrollingText': ScrollingTextLayer,
    'Glitter': GlitterLayer,
    'Fireworks': FireworksLayer,
    'DailyObservances': DailyObservancesLayer
};
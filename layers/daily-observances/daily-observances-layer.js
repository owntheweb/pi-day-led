// https://www.npmjs.com/package/moment-holiday
// https://stackoverflow.com/questions/32342753/calculate-holidays-in-javascript
// https://en.wikipedia.org/wiki/List_of_observances_in_the_United_States_by_presidential_proclamation
// https://www.timeanddate.com/holidays/us/

const { ScrollingTextLayer } = require('../scrolling-text-layer');
const moment = require('moment-holiday');
const { us: unitedStatesObservances } = require('./daily-observances-us');
const { un: unitedNationsObservances } = require('./daily-observances-un');
const { unofficial: unofficialObservances } = require('./daily-observances-unofficial');

class DailyObservancesLayer extends ScrollingTextLayer {

  constructor(config) {        
    super(config);
    this.addHolidays();
    this.fallbackText = this.config.hasOwnProperty('text') ? this.config.text : 'There are no observances today. What is up with that?!';
    this.text = moment().isHoliday() ? this.holidayString() : this.fallbackText;
    this.textMeasurement = this.ctx.measureText(this.text);
  }

  // add all observances for now
  // TODO: This currently shows official US holidays, national observances, United Nations observances and unofficial.
  // It would be nice for others to be able to configure what to show (I currently want them all, todo, categorized though)
  // TODO: Loading as many holidays as there are here every time is creating lag before starting. Consider optimization.
  addHolidays() {
    moment.modifyHolidays.add(unitedStatesObservances);
    moment.modifyHolidays.add(unitedNationsObservances);
    moment.modifyHolidays.add(unofficialObservances);
  }

  // concatenate potentially multiple holidays into a single string
  holidayString() {
    const holidays = moment().isHoliday().join(', and ');
    return `Today we celebrate: ${holidays}`;
  }
}

module.exports = {
  DailyObservancesLayer
};
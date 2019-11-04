// https://www.npmjs.com/package/moment-holiday
// https://stackoverflow.com/questions/32342753/calculate-holidays-in-javascript
// https://en.wikipedia.org/wiki/List_of_observances_in_the_United_States_by_presidential_proclamation
// https://www.timeanddate.com/holidays/us/

const { ScrollingTextLayer } = require('../scrolling-text-layer');
const moment = require('moment-holiday');
const observances = require('./daily-observances-dates');

class DailyObservancesLayer extends ScrollingTextLayer {

  // TODO: This currently shows official US holidays, national observances, international observances and unofficial.
  // It would be nice for others to be able to configure what to show (I currently want them all, todo, categorized though)
  constructor(config) {        
    super(config);
    this.addAllHolidays();
    this.fallbackText = this.config.hasOwnProperty('text') ? this.config.text : 'There are no observances today. What is up with that?!';
    this.text = moment().isHoliday() ? this.holidayString() : this.fallbackText;
  }

  // add them all for now
  addAllHolidays() {
    for (let category in observances) {
      moment.modifyHolidays.add(observances[category]);
    }
  }

  // contatinate potentially multiple holidays into a single string
  holidayString() {
    const holidays = moment().isHoliday().join(' and ');
    return `Today we celebrate: ${holidays}`;
  }
}

module.exports = {
  DailyObservancesLayer
};
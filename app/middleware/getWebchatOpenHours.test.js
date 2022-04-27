const { expect, sinon } = require('test/util/chai');
const CONF = require('config');
const parseBool = require('app/core/utils/parseBool');

const modulePath = 'app/middleware/getWebchatOpenHours';

const getWebchatOpenHours = require(modulePath);

const testCells = [
  {
    dayOfWeek: 'MONDAY',
    from: '08:00:00',
    until: '20:00:00'
  },
  {
    dayOfWeek: 'iNvAliD',
    from: '08:00:00',
    until: '20:00:00'
  },
  {
    dayOfWeek: 'TUESDAY',
    from: 'iNvAliD',
    until: '20:00:00'
  },
  {
    dayOfWeek: 'WEDNESDAY',
    from: '08:00:00',
    until: 'iNvAliD'
  }
];

const testOpenHrsData = [
  {
    dayOfWeek: 'MONDAY',
    from: '08:00:00',
    until: '20:00:00'
  },
  {
    dayOfWeek: 'TUESDAY',
    from: '07:00:00',
    until: '19:00:00'
  },
  {
    dayOfWeek: 'WEDNESDAY',
    from: '09:00:00',
    until: '21:00:00'
  }
];

const testInvalidOpenHrsData = [
  {
    dayOfWeek: 'Monday',
    from: '08:00:00',
    until: '20:00:00'
  },
  {
    invalid: 'Tuesday',
    from: '08:00:00',
    until: '20:00:00'
  },
  {
    dayOfWeek: 'Wednesday',
    invalid: '08:00:00',
    until: '20:00:00'
  },
  {
    dayOfWeek: 'Thursday',
    from: '08:00:00',
    invalid: '20:00:00'
  },
  {
    dayOfWeek: 5,
    from: '08:00:00',
    until: '20:00:00'
  },
  {
    dayOfWeek: 'Saturday',
    from: 8,
    until: '20:00:00'
  },
  {
    dayOfWeek: 'Sunday',
    from: '08:00:00',
    until: 20
  }
];

describe(modulePath, () => {
  // eslint-disable-next-line no-unused-vars
  let req = {}, res = {}, next = {};

  beforeEach(() => {
    req = {
      session: { }
    };
    res = {
      redirect: sinon.stub(),
      set: sinon.stub(),
      locals: { }
    };
    next = sinon.stub();
  });

  context('generic tests', () => {
    if (!parseBool(CONF.features.antennaWebchatAvailabilityToggle)) {
      it('res object will not contain locals.antennaWebchat_Hours', done => {
        getWebchatOpenHours.getOpeningHours(req, res, next = () => {
          // eslint-disable-next-line no-unused-expressions
          expect(res.locals.antennaWebchat_hours).to.not.exist;
          done();
        });
      });
    }

    // DO NOT MERGE WITH THIS IN PLACE!
    // Currently makes an API call.  Still need to write stub for https.request()
    if (parseBool(CONF.features.antennaWebchatAvailabilityToggle)) {
      it('res object will contain locals.antennaWebchat_Hours', done => {
        getWebchatOpenHours.getOpeningHours(req, res, next = () => {
          // eslint-disable-next-line no-unused-expressions
          expect(res.locals.antennaWebchat_hours).to.exist;
          done();
        });
      });
    }

    it('will correctly title case the name of a day', () => {
      const result = getWebchatOpenHours.dayToTitleCase('Monday');
      expect(result).to.eql('Monday');
    });

    it('will return Invalid Day if invalid day name provided', () => {
      const result = getWebchatOpenHours.dayToTitleCase('tEsT');
      expect(result).to.eql('Invalid Day');
    });

    it('will correctly convert a 24hr time into short 12h format', () => {
      const result = getWebchatOpenHours.timeTo12Hr('20:00:00');
      expect(result).to.eql('8 PM');
    });

    it('will return Invalid Time if invalid time provided', () => {
      const result = getWebchatOpenHours.timeTo12Hr('8 o`clock');
      expect(result).to.eql('Invalid Time');
    });

    it('will return valid HTML messages and table when JSON data validates', () => {
      const responseData = `{ "daysOfWeekOpen": ${JSON.stringify(testOpenHrsData)}}`;
      const result = getWebchatOpenHours.formatOpenHoursMessage(responseData);
      expect(result).to.not.eql(false);
      expect(result).to.eql('<p>Web chat is now closed. Please come back during the following hours:</p><table><caption style="display: none">Divorce Web Chat Opening Hours</caption><tr><th style="text-align: left; padding-right: 25px">Day</th><th style="text-align: left; padding-right: 25px">From</th><th style="text-align: left; padding-right: 25px">Until</th></tr><tr><td style="padding-right: 25px;">Monday</td><td style="padding-right: 25px;">8 AM</td><td style="padding-right: 25px;">8 PM</td></tr><tr><td style="padding-right: 25px;">Tuesday</td><td style="padding-right: 25px;">7 AM</td><td style="padding-right: 25px;">7 PM</td></tr><tr><td style="padding-right: 25px;">Wednesday</td><td style="padding-right: 25px;">9 AM</td><td style="padding-right: 25px;">9 PM</td></tr></table><p>Alternatively, contact us using one of the ways below.</p>');
    });

    it('will return valid default HTML message when JSON data fails to validate', () => {
      const responseData = '{ "no": "expected property" }';
      const result = getWebchatOpenHours.formatOpenHoursMessage(responseData);
      expect(result).to.not.eql(false);
      expect(result).to.eql('<p>Web chat is currently closed. Please try again later.  Alternatively, contact us using one of the ways below.</p>');
    });

    it('will return valid JSON data from daysOfWeekOpen property of response object', () => {
      const responseData = `{ "daysOfWeekOpen": ${JSON.stringify(testOpenHrsData)}}`;
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result).to.not.eql(false);
      expect(result).to.eql(testOpenHrsData);
    });

    it('will return false when daysOfWeekOpen property of response object does not exist', () => {
      const responseData = '{ "no": "expected property" }';
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result).to.eql(false);
    });

    it('will return false when response object does not JSON.parse', () => {
      const responseData = { invalid: 'format' };
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result).to.eql(false);
    });

    it('will return false when daysOfWeekOpen property of response object contains JSON data with invalid day key', () => {
      const invalidDayKey = testInvalidOpenHrsData[1];
      const responseData = `{ "daysOfWeekOpen": ${JSON.stringify(invalidDayKey)}}`;
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result).to.eql(false);
    });

    it('will return false when daysOfWeekOpen property of response object contains JSON data with invalid from key', () => {
      const invalidFromKey = testInvalidOpenHrsData[2];
      const responseData = `{ "daysOfWeekOpen": ${JSON.stringify(invalidFromKey)}}`;
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result).to.eql(false);
    });

    it('will return false when daysOfWeekOpen property of response object contains JSON data with invalid until key', () => {
      const invalidUntilKey = testInvalidOpenHrsData[3];
      const responseData = `{ "daysOfWeekOpen": ${JSON.stringify(invalidUntilKey)}}`;
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result).to.eql(false);
    });

    it('will return false when daysOfWeekOpen property of response object contains JSON data with invalid day val', () => {
      const invalidDayVal = testInvalidOpenHrsData[4];
      const responseData = `{ "daysOfWeekOpen": ${JSON.stringify(invalidDayVal)}}`;
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result).to.eql(false);
    });

    it('will return false when daysOfWeekOpen property of response object contains JSON data with invalid from val', () => {
      const invalidFromVal = testInvalidOpenHrsData[5];
      const responseData = `{ "daysOfWeekOpen": ${JSON.stringify(invalidFromVal)}}`;
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result).to.eql(false);
    });

    it('will return false when daysOfWeekOpen property of response object contains JSON data with invalid until val', () => {
      const invalidUntilVal = testInvalidOpenHrsData[6];
      const responseData = `{ "daysOfWeekOpen": ${JSON.stringify(invalidUntilVal)}}`;
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result).to.eql(false);
    });

    it('will return a valid Object when valid day/from/until values are provided', () => {
      const result = getWebchatOpenHours.validateCellValues(testCells[0], 0);
      expect(result).to.not.eql(false);
      expect(result).to.eql({ day: 'Monday', from: '8 AM', until: '8 PM' });
    });

    it('will return false when an invalid day is provided', () => {
      const result = getWebchatOpenHours.validateCellValues(testCells[1], 1);
      expect(result).to.eql(false);
    });

    it('will return false when an invalid from time is provided', () => {
      const result = getWebchatOpenHours.validateCellValues(testCells[2], 2);
      expect(result).to.eql(false);
    });

    it('will return false when an invalid until time is provided', () => {
      const result = getWebchatOpenHours.validateCellValues(testCells[2], 2);
      expect(result).to.eql(false);
    });

    it('will return a valid HTML string when valid day/from/until values are provided', () => {
      const result = getWebchatOpenHours.parseOpenHoursToHtml(testOpenHrsData);
      expect(result).to.eql('<table><caption style="display: none">Divorce Web Chat Opening Hours</caption><tr><th style="text-align: left; padding-right: 25px">Day</th><th style="text-align: left; padding-right: 25px">From</th><th style="text-align: left; padding-right: 25px">Until</th></tr><tr><td style="padding-right: 25px;">Monday</td><td style="padding-right: 25px;">8 AM</td><td style="padding-right: 25px;">8 PM</td></tr><tr><td style="padding-right: 25px;">Tuesday</td><td style="padding-right: 25px;">7 AM</td><td style="padding-right: 25px;">7 PM</td></tr><tr><td style="padding-right: 25px;">Wednesday</td><td style="padding-right: 25px;">9 AM</td><td style="padding-right: 25px;">9 PM</td></tr></table>');
    });

    it('will return false when any invalid day/from/until values are provided', () => {
      const result = getWebchatOpenHours.parseOpenHoursToHtml(testCells);
      expect(result).to.eql(false);
    });
  });
});

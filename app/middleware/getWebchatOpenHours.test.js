const { expect, sinon } = require('test/util/chai');
const https = require('https');
const CONF = require('config');

const modulePath = 'app/middleware/getWebchatOpenHours';

const getWebchatOpenHours = require(modulePath);

const config = CONF.webchatAvailability;

const validOpenHrsData = [
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

const invalidOpenHrsData = [
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

  context('Day/Time string format and validation tests', () => {
    it('will correctly title case the name of a day', () => {
      const result = getWebchatOpenHours.dayToTitleCase('MONDAY');
      expect(result)
        .to
        .eql('Monday');
    });

    it('will return Invalid Day if invalid day name provided', () => {
      const result = getWebchatOpenHours.dayToTitleCase('tEsT');
      expect(result)
        .to
        .eql('Invalid Day');
    });

    it('will correctly convert a 24hr time into short 12h format', () => {
      const result = getWebchatOpenHours.timeTo12Hr('20:00:00');
      expect(result)
        .to
        .eql('8 PM');
    });

    it('will return Invalid Time if invalid time provided', () => {
      const result = getWebchatOpenHours.timeTo12Hr('8 o`clock');
      expect(result)
        .to
        .eql('Invalid Time');
    });
  });

  context('JSON data tests', () => {
    it('will return valid JSON data from daysOfWeekOpen property of response object', () => {
      const responseData = `{ "${config.format.responseProperty}": ${JSON.stringify(validOpenHrsData)}}`;
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result)
        .to
        .not
        .eql(false);
      expect(result)
        .to
        .eql(validOpenHrsData);
    });

    it('will return false when daysOfWeekOpen property of response object does not exist', () => {
      const responseData = '{ "no": "expected property" }';
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result)
        .to
        .eql(false);
    });

    it('will return false when response object does not JSON.parse', () => {
      const responseData = { invalid: 'format' };
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result)
        .to
        .eql(false);
    });

    it('will return false when daysOfWeekOpen property of response object contains JSON data with invalid day key', () => {
      const invalidDayKey = [{ invalid: 'Tuesday', from: '08:00:00', until: '20:00:00' }];
      const responseData = `{ "${config.format.responseProperty}": ${JSON.stringify(invalidDayKey)}}`;
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result)
        .to
        .eql(false);
    });

    it('will return false when daysOfWeekOpen property of response object contains JSON data with invalid from key', () => {
      const invalidFromKey = [{ dayOfWeek: 'Wednesday', invalid: '08:00:00', until: '20:00:00' }];
      const responseData = `{ "${config.format.responseProperty}": ${JSON.stringify(invalidFromKey)}}`;
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result)
        .to
        .eql(false);
    });

    it('will return false when daysOfWeekOpen property of response object contains JSON data with invalid until key', () => {
      const invalidUntilKey = [{ dayOfWeek: 'Thursday', from: '08:00:00', invalid: '20:00:00' }];
      const responseData = `{ "${config.format.responseProperty}": ${JSON.stringify(invalidUntilKey)}}`;
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result)
        .to
        .eql(false);
    });

    it('will return false when daysOfWeekOpen property of response object contains JSON data with invalid day val', () => {
      const invalidDayVal = [{ dayOfWeek: 5, from: '08:00:00', until: '20:00:00' }];
      const responseData = `{ "${config.format.responseProperty}": ${JSON.stringify(invalidDayVal)}}`;
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result)
        .to
        .eql(false);
    });

    it('will return false when daysOfWeekOpen property of response object contains JSON data with invalid from val', () => {
      const invalidFromVal = [{ dayOfWeek: 'Saturday', from: 8, until: '20:00:00' }];
      const responseData = `{ "${config.format.responseProperty}": ${JSON.stringify(invalidFromVal)}}`;
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result)
        .to
        .eql(false);
    });

    it('will return false when daysOfWeekOpen property of response object contains JSON data with invalid until val', () => {
      const invalidUntilVal = [{ dayOfWeek: 'Sunday', from: '08:00:00', until: 20 }];
      const responseData = `{ "${config.format.responseProperty}": ${JSON.stringify(invalidUntilVal)}}`;
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result)
        .to
        .eql(false);
    });

    it('will return false when daysOfWeekOpen property of response object contains JSON data with missing day key', () => {
      const invalidDayKey = [{ from: '08:00:00', until: '20:00:00' }];
      const responseData = `{ "${config.format.responseProperty}": ${JSON.stringify(invalidDayKey)}}`;
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result)
        .to
        .eql(false);
    });

    it('will return false when daysOfWeekOpen property of response object contains JSON data with missing from key', () => {
      const invalidFromKey = [{ dayOfWeek: 'Wednesday', until: '20:00:00' }];
      const responseData = `{ "${config.format.responseProperty}": ${JSON.stringify(invalidFromKey)}}`;
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result)
        .to
        .eql(false);
    });

    it('will return false when daysOfWeekOpen property of response object contains JSON data with missing until key', () => {
      const invalidUntilKey = [{ dayOfWeek: 'Thursday', from: '08:00:00' }];
      const responseData = `{ "${config.format.responseProperty}": ${JSON.stringify(invalidUntilKey)}}`;
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result)
        .to
        .eql(false);
    });

    it('will return false when daysOfWeekOpen property of response object contains JSON data with missing day val', () => {
      const invalidDayVal = [{ dayOfWeek: '', from: '08:00:00', until: '20:00:00' }];
      const responseData = `{ "${config.format.responseProperty}": ${JSON.stringify(invalidDayVal)}}`;
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result)
        .to
        .eql(false);
    });

    it('will return false when daysOfWeekOpen property of response object contains JSON data with missing from val', () => {
      const invalidFromVal = [{ dayOfWeek: 'Saturday', from: '', until: '20:00:00' }];
      const responseData = `{ "${config.format.responseProperty}": ${JSON.stringify(invalidFromVal)}}`;
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result)
        .to
        .eql(false);
    });

    it('will return false when daysOfWeekOpen property of response object contains JSON data with missing until val', () => {
      const invalidUntilVal = [{ dayOfWeek: 'Sunday', from: '08:00:00', until: '' }];
      const responseData = `{ "${config.format.responseProperty}": ${JSON.stringify(invalidUntilVal)}}`;
      const result = getWebchatOpenHours.validateJSONData(responseData);
      expect(result)
        .to
        .eql(false);
    });

    it('will return a valid Object when valid day/from/until values are provided', () => {
      const result = getWebchatOpenHours.validateCellValues(invalidOpenHrsData[0], 0);
      expect(result)
        .to
        .not
        .eql(false);
      expect(result)
        .to
        .eql({ day: 'Monday', from: '8 AM', until: '8 PM' });
    });

    it('will return false when an invalid day is provided', () => {
      const result = getWebchatOpenHours.validateCellValues(invalidOpenHrsData[1], 1);
      expect(result)
        .to
        .eql(false);
    });

    it('will return false when an invalid from time is provided', () => {
      const result = getWebchatOpenHours.validateCellValues(invalidOpenHrsData[2], 2);
      expect(result)
        .to
        .eql(false);
    });

    it('will return false when an invalid until time is provided', () => {
      const result = getWebchatOpenHours.validateCellValues(invalidOpenHrsData[3], 3);
      expect(result)
        .to
        .eql(false);
    });
  });

  context('HTML output tests', () => {
    it('will return a valid HTML Paragraph elem', () => {
      const testStr = 'test';
      const result = getWebchatOpenHours.parseMessageToParagraph(testStr);
      expect(result)
        .to
        .eql(`<p>${testStr}</p>`);
    });

    it('will return a valid HTML string when valid day/from/until values are provided', () => {
      const result = getWebchatOpenHours.parseOpenHoursToTable(validOpenHrsData);
      expect(result)
        .to
        .eql('<table><caption style="display: none">Divorce Web Chat Opening Hours</caption><tr><th style="text-align: left; padding-right: 25px">Day</th><th style="text-align: left; padding-right: 25px">From</th><th style="text-align: left; padding-right: 25px">Until</th></tr><tr><td style="padding-right: 25px;">Monday</td><td style="padding-right: 25px;">8 AM</td><td style="padding-right: 25px;">8 PM</td></tr><tr><td style="padding-right: 25px;">Tuesday</td><td style="padding-right: 25px;">7 AM</td><td style="padding-right: 25px;">7 PM</td></tr><tr><td style="padding-right: 25px;">Wednesday</td><td style="padding-right: 25px;">9 AM</td><td style="padding-right: 25px;">9 PM</td></tr></table>');
    });

    it('will return false when any invalid day/from/until values are provided', () => {
      const result = getWebchatOpenHours.parseOpenHoursToTable(invalidOpenHrsData);
      expect(result)
        .to
        .eql(false);
    });

    it('will return valid HTML messages and table when JSON data validates', () => {
      const responseData = `{ "daysOfWeekOpen": ${JSON.stringify(validOpenHrsData)}}`;
      const result = getWebchatOpenHours.formatOpenHoursMessage(responseData);
      expect(result)
        .to
        .not
        .eql(false);
      expect(result)
        .to
        .eql(`<p>${config.messages.prefixMessage}</p><table><caption style="display: none">Divorce Web Chat Opening Hours</caption><tr><th style="text-align: left; padding-right: 25px">Day</th><th style="text-align: left; padding-right: 25px">From</th><th style="text-align: left; padding-right: 25px">Until</th></tr><tr><td style="padding-right: 25px;">Monday</td><td style="padding-right: 25px;">8 AM</td><td style="padding-right: 25px;">8 PM</td></tr><tr><td style="padding-right: 25px;">Tuesday</td><td style="padding-right: 25px;">7 AM</td><td style="padding-right: 25px;">7 PM</td></tr><tr><td style="padding-right: 25px;">Wednesday</td><td style="padding-right: 25px;">9 AM</td><td style="padding-right: 25px;">9 PM</td></tr></table><p>${config.messages.suffixMessage}</p>`);
    });

    it('will return valid default HTML message when JSON data fails to validate', () => {
      const responseData = '{ "no": "expected property" }';
      const result = getWebchatOpenHours.formatOpenHoursMessage(responseData);
      expect(result)
        .to
        .not
        .eql(false);
      expect(result)
        .to
        .eql(`<p>${config.messages.defaultMessage}</p>`);
    });
  });

  context('HTTPS request tests', () => {
    it('will return a res object that contains locals.antennaWebchat_Hours, containing a valid HTML message if the api call is successful', done => {
      const responseData = `{ "daysOfWeekOpen": ${JSON.stringify(validOpenHrsData)}}`;
      const featureToggle = sinon.stub(CONF.features, 'antennaWebchatAvailabilityToggle').value(true);
      const stub = sinon.stub(https, 'request').callsFake((options, cBack) => {
        const on = (code, action) => {
          if (code === 'data') {
            action(responseData);
          }
        };
        cBack({ on });
        return { on, end: sinon.stub() };
      });

      // eslint-disable-next-line no-invalid-this
      getWebchatOpenHours.getOpeningHours(req, res, next = () => {
        stub.restore();
        featureToggle.restore();
        // eslint-disable-next-line no-unused-expressions
        expect(res.locals.antennaWebchat_hours).to.exist;
        expect(res.locals.antennaWebchat_hours)
          .to
          .eql(`<p>${config.messages.prefixMessage}</p><table><caption style="display: none">Divorce Web Chat Opening Hours</caption><tr><th style="text-align: left; padding-right: 25px">Day</th><th style="text-align: left; padding-right: 25px">From</th><th style="text-align: left; padding-right: 25px">Until</th></tr><tr><td style="padding-right: 25px;">Monday</td><td style="padding-right: 25px;">8 AM</td><td style="padding-right: 25px;">8 PM</td></tr><tr><td style="padding-right: 25px;">Tuesday</td><td style="padding-right: 25px;">7 AM</td><td style="padding-right: 25px;">7 PM</td></tr><tr><td style="padding-right: 25px;">Wednesday</td><td style="padding-right: 25px;">9 AM</td><td style="padding-right: 25px;">9 PM</td></tr></table><p>${config.messages.suffixMessage}</p>`);
        done();
      });
    });

    it('will return a res object that contains locals.antennaWebchat_Hours, containing the default HTML message if the api call fails', done => {
      const featureToggle = sinon.stub(CONF.features, 'antennaWebchatAvailabilityToggle').value(true);
      const stub = sinon.stub(https, 'request').callsFake((options, cBack) => {
        const on = (code, action) => {
          if (code === 'error') {
            action('Error');
          }
        };
        cBack({ on });
        return { on, end: sinon.stub() };
      });

      // eslint-disable-next-line no-invalid-this
      getWebchatOpenHours.getOpeningHours(req, res, next = () => {
        stub.restore();
        featureToggle.restore();
        // eslint-disable-next-line no-unused-expressions
        expect(res.locals.antennaWebchat_hours).to.exist;
        expect(res.locals.antennaWebchat_hours)
          .to
          .eql(
            getWebchatOpenHours.parseMessageToParagraph(config.messages.defaultMessage)
          );
        done();
      });
    });
  });

  context('Feature toggle disabled tests', () => {
    it('will return a res object that does not contain locals.antennaWebchat_Hours', done => {
      const featureToggle = sinon.stub(CONF.features, 'antennaWebchatAvailabilityToggle').value(false);
      getWebchatOpenHours.getOpeningHours(req, res, next = () => {
        featureToggle.restore();
        // eslint-disable-next-line no-unused-expressions
        expect(res.locals.antennaWebchat_hours).to.not.exist;
        done();
      });
    });
  });
});

/* eslint id-blacklist: ["error", "data", "err", "cb", "callback"] */
const { expect } = require('test/util/chai');

const modulePath = 'app/core/helpers/parseRequest';
const underTest = require(modulePath).parse;

let step = {};

describe(modulePath, () => {
  beforeEach(() => {
    step = {
      properties: {
        a: { type: 'string' },
        b: { type: 'string' },
        c: { type: 'number' },
        d: { type: 'integer' },
        e: { type: 'array' }
      }
    };
  });


  it('should strip the data from the request body', () => {
    const req = {
      body: {
        a: 'one',
        b: 'two',
        c: '3.1',
        d: '4',
        e: ['one', 'two']
      },
      method: 'post'
    };

    expect(underTest(step, req)).to.deep.equal({
      a: 'one',
      b: 'two',
      c: 3.1,
      d: 4,
      e: ['one', 'two']
    });
  });

  it('should ignore values not specified by the step properties', () => {
    const req = {
      body: {
        a: 'one',
        b: 'two',
        c: '3.1',
        d: '4',
        e: ['one', 'two'],
        f: 'ignore'
      },
      method: 'post'
    };

    expect(underTest(step, req)).to.deep.equal({
      a: 'one',
      b: 'two',
      c: 3.1,
      d: 4,
      e: ['one', 'two']
    });
  });


  it('should pass empty values through', () => {
    const req = {
      body: {
        a: '',
        b: '',
        c: '',
        d: '',
        e: []
      },
      method: 'post'
    };

    expect(underTest(step, req)).to.deep.equal({
      a: '',
      b: '',
      c: '',
      d: '',
      e: []
    });
  });


  it('if data type is array and has not been parsed in request, should create empty array', () => {
    const req = {
      body: {
        a: 'one',
        b: 'two',
        c: '3.1',
        d: '4'
      },
      method: 'post'
    };

    expect(underTest(step, req)).to.deep.equal({
      a: 'one',
      b: 'two',
      c: 3.1,
      d: 4,
      e: []
    });
  });
});

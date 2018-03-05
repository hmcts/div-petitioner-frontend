const { expect, sinon } = require('test/util/chai');
const weighted = require('weighted');
const CONF = require('config');
const { cloneDeep } = require('lodash');

const modulePath = 'app/services/courtsAllocation';

const underTest = require(modulePath);

describe(modulePath, () => {
  let tempConfig = {};

  beforeEach(() => {
    sinon.spy(weighted, 'select');
    tempConfig = cloneDeep(CONF.commonProps.court);
  });

  afterEach(() => {
    weighted.select.restore();
    CONF.commonProps.court = tempConfig;
  });

  it('makes the selection calls compiled from court config', () => {
    // Arrange.
    CONF.commonProps.court = {
      foo: {
        bar: 'baz',
        weight: 1
      },
      bar: {
        some: 'other-prop',
        weight: 2
      }
    };
    const expected = {
      foo: 1,
      bar: 2
    };
    // Act.
    underTest.allocateCourt();
    // Assert.
    expect(weighted.select.args[0][0]).to.eql(expected);
  });
});
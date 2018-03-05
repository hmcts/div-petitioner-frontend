const url = require('url');
const { expect, sinon } = require('test/util/chai');

const modulePath = 'app/core/utils/baseUrl';
const underTest = require(modulePath);

describe(modulePath, () => {
  beforeEach(() => {
    sinon.spy(url, 'format');
  });

  afterEach(() => {
    url.format.restore();
  });

  it('calls standard url function to produce its output', () => {
    // Act.
    underTest();
    // Assert.
    expect(url.format.calledOnce).to.equal(true);
  });

  it('produces a properly formatted url', () => {
    // Act.
    const output = url.parse(underTest());
    // Assert.
    expect(output).to.have.property('protocol', 'https:');
    expect(output).to.have.property('hostname', 'localhost');
    expect(output).to.have.property('port', '8080');
  });
});

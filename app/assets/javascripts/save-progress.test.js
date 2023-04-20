const { expect } = require('chai');
const nock = require('nock');
const { JSDOM } = require('jsdom');

const testHTML = `
<html>
  <body>
    <form action="test" id="form">
      <input name="foo" type="textarea" value="Some text with spaces..." />
    </form>
  </body>
</html>`;

describe(__filename, () => {
  let saveProgress;

  beforeEach(() => {
    const jsdom = new JSDOM(testHTML, {
      url: 'https://localhost',
    });

    const { window } = jsdom;
    const { document } = window;

    global.window = window;
    global.document = document;

    saveProgress = require('./save-progress');
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  it('posts serialized form data', async () => {
    const endPoint = nock('https://localhost')
      .post('/test', "foo=Some+text+with+spaces...")
      .reply(200)

    await saveProgress()

    expect(endPoint.isDone())
      .to.equal(true);

    endPoint.done();
  });

  it('does not re-post form data if it remains unchanged', async () => {
    const endPoint = nock('https://localhost')
      .post('/test', "foo=Some+text+with+spaces...")
      .times(1)
      .reply(200)

    await saveProgress();
    await saveProgress('foo=Some%20text%20with%20spaces...');

    expect(endPoint.isDone())
      .to.equal(true);

    endPoint.done();
  });
});

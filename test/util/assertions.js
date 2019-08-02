const CONF = require('config');
const { forEach, get, isArray, isObject, clone } = require('lodash');
const { expect } = require('test/util/chai');
const walkMap = require('app/core/utils/treeWalker');
const nunjucks = require('nunjucks');
const co = require('co');
const cheerio = require('cheerio');
const flatten = require('flat');
const Tokens = require('csrf');

const Interpolator = require('node_modules/i18next/dist/commonjs/Interpolator').default;

nunjucks.configure({ autoescape: false });
const interpolator = new Interpolator();

const createSession = (agent) => {
  return getSession(agent)
    .then((res) => {
      const tokens = new Tokens();

      agent.csrfToken = tokens.create(res.body.csrfSecret);

      return agent.post('/session')
        .set('X-CSRF-token', agent.csrfToken)
        .send({ expires: Date.now() + 10000 })
        .expect(200);
    });
};

const getSession = (agent) => {
  return agent.get('/session')
    .expect(200);
};

const postToUrl = (agent, url, data) => {

  return agent.post(url)
    .set('X-CSRF-token', agent.csrfToken)
    .type('form')
    .send(data);
};

const getUrl = (agent, url) => {
  return agent.get(url)
    .expect('Content-type', /html/);
};

exports.postData = (agent, url, data) => {
  const postForm = () => postToUrl(agent, url, data).expect(302);
  const returnUrl = (res) => res.headers.location;

  return createSession(agent)
    .then(postForm)
    .then(returnUrl);
};

exports.getSession = (agent) => {
  return getSession(agent)
    .then(res => res.body);
};

exports.expectSessionValue = (fieldName, value, agent, done) => {
  return () => {
    return this.getSession(agent)
      .then(responseSession => {
        expect(responseSession[fieldName]).to.eql(value);
      })
      .then(done, done)
      .catch(error => {
        done(error);
      });
  };
};

exports.testContent = (done, agent, underTest, content, session = {}, excludeKeys = [], dataContent = {}) => {
  const getPage = () => getUrl(agent, underTest.url);
  const checkContent = (res) => {
    const pageContent = Object.assign({}, session, CONF.commonProps, dataContent);
    const text = res.text.toLowerCase();
    const missingContent = [];

    walkMap(content.resources.en.translation.content, (path, content) => {
      if (!excludeKeys.includes(path)) {
        content = interpolator.interpolate(content, pageContent).toLowerCase();
        if (text.indexOf(content) === -1) {
          missingContent.push(path);
        }
      }
    });

    expect(missingContent, 'The following content was not found in template').to.eql([]);
  };

  return createSession(agent)
    .then(getPage)
    .then(checkContent)
    .then(done, done);
};

const getStepCtx = (underTest, data, session) => {
  return new Promise(resolve => {
    co(function*() {
      const ctx = yield underTest.checkYourAnswersInterceptor(data, session);
      resolve(ctx);
    });
  });
};

const getCYATemplate = (underTest, data = {}, session = {}) => {
  return new Promise((resolve) => {

    co(function*() {

      // get CheckYourAnswers content
      const checkYourAnswersContent = underTest.steps.CheckYourAnswers ? yield underTest.steps.CheckYourAnswers.generateContent(data, session) : {};

      const stepCtx = yield underTest.checkYourAnswersInterceptor(data, session);

      // generate content
      let content = yield underTest.generateContent(stepCtx, session);
      const checkYourAnswersSpecificContent = yield underTest.generateCheckYourAnswersContent(stepCtx, session);
      Object.assign(content, checkYourAnswersSpecificContent, checkYourAnswersContent, { url: underTest.url });

      // generate fields
      const fields = yield underTest.generateFields(stepCtx, session);

      // render check your answers templates
      const html = nunjucks.render(underTest.checkYourAnswersTemplate, { content, fields, data, session });

      resolve(html);

    });

  });

};

exports.testCYATemplate = (done, underTest, data, session) => {

  const checkTemplate = (html) => {
    expect(html.length).to.not.equal(0);
    return html;
  };

  const checkChangeLink = (html) => {
    expect(html).to.contain(underTest.url);
  };

  return getCYATemplate(underTest, data, session)
    .then(checkTemplate)
    .then(checkChangeLink)
    .then(done, done);
};

exports.testNoCYATemplate = (done, underTest) => {
  expect(underTest.checkYourAnswersTemplate).to.equal(undefined);
  done();
};

exports.testExistenceCYA = (done, underTest, content, contentToExist = [], valuesToExist = [], data = {}, session = {}) => {

  const checkContentExists = html => {
    const pageContent = Object.assign({}, data, CONF.commonProps, session);
    const text = html.toLowerCase();
    const contentToTest = Object.assign({}, underTest.content.resources.en.translation.checkYourAnswersContent, underTest.content.resources.en.translation.content);

    walkMap(contentToTest, (path, value) => {
      // get specific checkYourAnswersContent
      const checkYourAnswersContent = get(content.resources.en.translation.checkYourAnswersContent, path);
      value = checkYourAnswersContent ? checkYourAnswersContent : value;

      if (contentToExist.includes(path)) {
        contentToExist.splice(contentToExist.indexOf(path), 1);
        value = interpolator.interpolate(value, pageContent).toLowerCase();
        expect(text).to.contain(value);
      }
    });
    expect(contentToExist, 'Content has not been found and so was not tested').to.be.empty;
  };

  const checkValuesExists = html => {

    valuesToExist.forEach(value => {
      const dataToTest = data[value] ? data[value] : session[value];
      expect(dataToTest).to.not.be.undefined;
      if (isArray(dataToTest) || isObject(dataToTest)) {
        walkMap(dataToTest, (path, content) => {
          expect(html).to.contain(content);
        });
      } else {
        expect(html).to.contain(dataToTest);
      }
    });

  };

  const checkExists = (html) => {

    if (contentToExist.length) {
      checkContentExists(html);
    }

    if (valuesToExist.length) {
      checkValuesExists(html);
    }

  };

  return getCYATemplate(underTest, clone(data), session)
    .then(checkExists)
    .then(done, done);
};

exports.testNoneExistenceCYA = (done, underTest, content, contentToNotExist = [], valuesToNotExist = [], data = {}, session = {}) => {

  const checkContentExists = html => {
    const pageContent = Object.assign({}, data, CONF.commonProps, session);
    const text = html.toLowerCase();

    walkMap(content.resources.en.translation.checkYourAnswersContent, (path, content) => {
      if (contentToNotExist.includes(path)) {
        content = interpolator.interpolate(content, pageContent).toLowerCase();
        expect(text).to.not.contain(content);
      }
    });
  };

  const checkValuesExists = html => {

    return getStepCtx(underTest, data, session)
      .then(function(ctx) {
        valuesToNotExist.forEach(value => {
          expect(html).to.not.contain(ctx[value]);
        });
      }).catch(error => {
        done(error);
      });

  };

  const checkNotExists = (html) => {

    if (contentToNotExist.length) {
      checkContentExists(html);
    }

    if (valuesToNotExist.length) {
      checkValuesExists(html);
    }

  };

  return getCYATemplate(underTest, data, session)
    .then(checkNotExists)
    .then(done, done);
};

exports.testErrors = (done, agent, underTest, data, content, type, onlyKeys = [], session = {}) => {
  const triggerErrors = () => {
    return postToUrl(agent, underTest.url, data).expect(302);
  };
  const handleRedirect = () => {
    return getUrl(agent, underTest.url);
  };

  const checkErrors = (res) => {
    const pageContent = Object.assign({}, data, session, CONF.commonProps);

    forEach(content.resources.en.translation.errors, (v, k) => {
      if (!v[type]) {
        return;
      }
      v = interpolator.interpolate(v[type], pageContent);

      if (onlyKeys.length === 0) {
        expect(res.text).to.contain(v);
      } else if (onlyKeys.includes(k)) {
        expect(res.text).to.contain(v);
      }
    });
  };

  return createSession(agent)
    .then(triggerErrors)
    .then(handleRedirect)
    .then(checkErrors)
    .then(done, done);
};

exports.testValidation = (done, agent, underTest, data, content, expectedErrors = [], selector = 'ul.govuk-error-summary__list li a') => {
  const triggerErrors = () => {
    return postToUrl(agent, underTest.url, data).expect(302);
  };
  const handleRedirect = () => {
    return getUrl(agent, underTest.url);
  };

  const checkErrors = (res) => {

    const $ = cheerio.load(res.text);

    let errorMessages = [];

    $(selector).each(function() {
      errorMessages.push($(this).text());
    });

    let expectedErrorMessages = [];

    const flattenedMessages = flatten(content.resources.en.translation.errors);

    forEach(expectedErrors, (key) => {
      const message = flattenedMessages[key];

      // fail if key is not found in content file
      expect(message, `key (${key}) not found in content file`).to.not.be.undefined;

      expectedErrorMessages.push(message);
    });

    forEach(errorMessages, (error) => {
      expect(expectedErrorMessages).to.include(error);
      errorMessages = errorMessages.filter(e => e !== error);
      expectedErrorMessages = expectedErrorMessages.filter(e => e !== error);
    });

    // if expectedErrorMessages is not empty an expected error was not found
    expect(expectedErrorMessages, `messages not displayed: ${expectedErrorMessages}`).to.be.empty;

    // if errorMessages is not empty an unanticipated error message has been displayed
    expect(errorMessages, `extra messages displayed: ${errorMessages}`).to.be.empty;
  };

  return createSession(agent)
    .then(triggerErrors)
    .then(handleRedirect)
    .then(checkErrors)
    .then(done, done);
};

exports.testRedirect = (done, agent, underTest, data, redirect) => {
  const checkRedirect = () => {
    return postToUrl(agent, underTest.url, data)
      .expect(302)
      .expect('location', redirect.url);
  };

  return createSession(agent)
    .then(checkRedirect)
    .then(() => done(), done);
};

exports.testMultipleValuesExistence = (done, agent, underTest, textArray = [], data) => {
  const getPage = () => getUrl(agent, underTest.url);
  const checkExists = (res) => {
    textArray.forEach(text => {
      if (data) {
        text = interpolator.interpolate(text, data);
      }
      expect(res.text).to.contain(text);
    });
  };

  return createSession(agent)
    .then(getPage)
    .then(checkExists)
    .then(done, done);
};

exports.testExistence = (done, agent, underTest, text, data) => {
  const getPage = () => getUrl(agent, underTest.url);
  const checkExists = (res) => {
    if (data) {
      text = interpolator.interpolate(text, data);
    }

    expect(res.text).to.contain(text);
  };

  return createSession(agent)
    .then(getPage)
    .then(checkExists)
    .then(done, done);
};

exports.testNonExistence = (done, agent, underTest, text, data, selector) => {
  let stringsToTest = Array.isArray(text) ? text : [text];
  const getPage = () => getUrl(agent, underTest.url);
  const checkNotExists = (res) => {
    stringsToTest.forEach(string => {
      if (string) {
        text = interpolator.interpolate(string, data);
      }
      let content = res.text;
      if (selector) {
        const $ = cheerio.load(res.text);
        content = $(selector).html();
      }
      expect(content).not.to.contain(text);
    });
  };

  return createSession(agent)
    .then(getPage)
    .then(checkNotExists)
    .then(done, done);
};

exports.testHttpStatus = (done, agent, underTest, status, method = 'get') => {
  const checkHttpStatus = () => {
    let request = agent[method](underTest.url);

    if (method !== 'get') {
      request.set('X-CSRF-token', agent.csrfToken);
    }

    return request
      .expect(status);
  };

  return createSession(agent)
    .then(checkHttpStatus)
    .then(() => done(), done);
};

exports.testCustom = (done, agent, underTest, cookies = [], callback, method = 'get', createsNewSession = true, data) => {
  const runCallback = () => {
    let request = agent[method](underTest.url);

    if (method !== 'get') {
      request = request.set('X-CSRF-token', agent.csrfToken);
    }

    if (cookies.length) {
      request = request.set('cookie', [request.cookies, ...cookies].join(';'));
    }

    if (data){
      request = request
        .type('form')
        .send(data);
    }

    return request
      .expect(callback);
  };

  if (createsNewSession) {
    return createSession(agent)
      .then(runCallback)
      .then(() => done(), done);
  } else {
    return runCallback()
      .then(() => done(), done);
  }
};

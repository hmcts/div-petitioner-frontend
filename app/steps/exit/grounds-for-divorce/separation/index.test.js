const request = require('supertest');
const server = require('app');
const { expect } = require('test/util/chai');
const { testContent } = require('test/util/assertions');
const { withSession } = require('test/util/setup');

const modulePath = 'app/steps/exit/grounds-for-divorce/separation';

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};

describe(modulePath, () => {
  beforeEach(() => {
    s = server.init();
    agent = request.agent(s.app);
    underTest = s.steps.ExitSeparation;
  });

  describe('success', () => {
    let session = {};

    it('does not provide a next step', () => {
      expect(underTest.next()).to.eql(null);
    });

    context('Reason is 2 years separation', () => {
      beforeEach(done => {
        session = { reasonForDivorce: 'separation-2-years' };
        withSession(done, agent, session);
      });

      it('renders content', done => {
        const dataContent = { limitYears: '2' };
        testContent(done, agent, underTest, content, session, [], dataContent);
      });
    });

    context('Reason is 5 years separation', () => {
      beforeEach(done => {
        session = { reasonForDivorce: 'separation-5-years' };
        withSession(done, agent, session);
      });

      it('renders content', done => {
        const dataContent = { limitYears: '5' };
        testContent(done, agent, underTest, content, session, [], dataContent);
      });
    });

    context('Reason is not 2 or 5', () => {
      beforeEach(done => {
        session = { reasonForDivorce: 'invalid reason' };
        withSession(done, agent, session);
      });

      it('renders content', done => {
        const dataContent = { limitYears: '' };
        testContent(done, agent, underTest, content, session, [], dataContent);
      });
    });
  });
});

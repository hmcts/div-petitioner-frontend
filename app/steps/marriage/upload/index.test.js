/* eslint-disable max-nested-callbacks */
const supertest = require('supertest');
const {
  testContent,
  testExistence,
  testNonExistence,
  testErrors,
  testRedirect,
  testExistenceCYA
} = require('test/util/assertions');
const { withSession } = require('test/util/setup');
const server = require('app');
const idamMock = require('test/mocks/idam');
const clone = require('lodash').cloneDeep;
const { mockSession } = require('test/fixtures');

const modulePath = 'app/steps/marriage/upload';
const { sinon } = require('test/util/chai');
const sinonStubPromise = require('sinon-stub-promise');

sinonStubPromise(sinon);

const content = require(`${modulePath}/content`);

let s = {};
let agent = {};
let underTest = {};
let session = {};

describe(modulePath, () => {
  beforeEach(() => {
    idamMock.stub();
    s = server.init();
    agent = supertest.agent(s.app);
    underTest = s.steps.UploadMarriageCertificate;
  });

  afterEach(() => {
    idamMock.restore();
  });

  describe('content', () => {
    it('renders the content from the content file', done => {
      const ignoreContent = [
        'remove',
        'translationContent',
        'nameChangeContent'
      ];

      testContent(done, agent, underTest, content, session, ignoreContent);
    });

    context('User has translation', () => {
      beforeEach(done => {
        session = { certifiedTranslation: 'Yes' };
        withSession(done, agent, session);
      });
      it('renders the content from the content file', done => {
        const ignoreContent = [
          'remove',
          'nameChangeContent'
        ];
        testContent(done, agent, underTest, content, session, ignoreContent);
      });
    });

    context('User has changed name', () => {
      beforeEach(done => {
        session = {
          petitionerNameDifferentToMarriageCertificate: 'Yes',
          petitionerNameChangedHow: ['deedPoll']
        };
        withSession(done, agent, session);
      });
      it('renders the content from the content file', done => {
        const ignoreContent = [
          'remove',
          'translationContent'
        ];
        testContent(done, agent, underTest, content, session, ignoreContent);
      });
    });

    context('nameChangeContent is set to deedpoll', () => {
      beforeEach(done => {
        session = {
          petitionerNameDifferentToMarriageCertificate: 'Yes',
          petitionerNameChangedHow: ['deedPoll']
        };
        withSession(done, agent, session);
      });
      it('renders the content from the content file', done => {
        testExistence(done, agent, underTest,
          content.resources.en.translation.content.nameChangeContent);
      });
    });
    context('nameChangeContent is set to other', () => {
      beforeEach(done => {
        session = {
          petitionerNameDifferentToMarriageCertificate: 'Yes',
          petitionerNameChangedHow: ['other']
        };
        withSession(done, agent, session);
      });
      it('renders the content from the content file', done => {
        testExistence(done, agent, underTest,
          content.resources.en.translation.content.nameChangeContent);
      });
    });
    context('nameChangeContent is set to deedpoll and other', () => {
      beforeEach(done => {
        session = {
          petitionerNameDifferentToMarriageCertificate: 'Yes',
          petitionerNameChangedHow: ['other', 'deedPoll']
        };
        withSession(done, agent, session);
      });
      it('renders the content from the content file', done => {
        testExistence(done, agent, underTest,
          content.resources.en.translation.content.nameChangeContent);
      });
    });
    context('nameChangeContent is NOT set to deedpoll or other', () => {
      beforeEach(done => {
        session = {
          petitionerNameDifferentToMarriageCertificate: 'Yes',
          petitionerNameChangedHow: ['marriageCertificate']
        };
        withSession(done, agent, session);
      });
      it('renders the content from the content file', done => {
        testNonExistence(done, agent, underTest,
          content.resources.en.translation.content.nameChangeContent);
      });
    });

    it('renders the remove button', done => {
      const ignoreContent = [
        'noFiles',
        'translationContent',
        'nameChangeContent',
        'howToContinue'

      ];
      testContent(done, agent, underTest, content, session, ignoreContent);
    });

    it('renders the content from the content file', done => {
      const ignoreContent = [
        'noFiles',
        'translationContent',
        'nameChangeContent'
      ];
      testContent(done, agent, underTest, content, session, ignoreContent);
    });

    describe('if user has previously uploaded files', () => {
      const file1 = 'file uploaded 1';
      const file2 = 'file uploaded 2';

      beforeEach(done => {
        session = {
          marriageCertificateFiles: [
            { fileName: file1 },
            { fileName: file2 }
          ]
        };

        withSession(done, agent, session);
      });

      it('renders the remove button', done => {
        const ignoreContent = [
          'noFiles',
          'translationContent',
          'nameChangeContent'
        ];
        testContent(done, agent, underTest, content, session, ignoreContent);
      });

      it('shows previously uploaded file 1', done => {
        testExistence(done, agent, underTest, file1);
      });

      it('shows previously uploaded file 2', done => {
        testExistence(done, agent, underTest, file2);
      });
    });

    describe('errors', () => {
      it('renders errors for errorUnknown', done => {
        const d = { errorUnknown: 'invalid', submit: true };
        testErrors(done, agent, underTest, d, content, 'required');
      });

      it('renders errors for errorFileSizeTooLarge', done => {
        const d = { errorFileSizeTooLarge: 'invalid', submit: true };
        testErrors(done, agent, underTest, d, content, 'required');
      });

      it('renders errors for errorFileTypeInvalid', done => {
        const d = { errorFileTypeInvalid: 'invalid', submit: true };
        testErrors(done, agent, underTest, d, content, 'required');
      });

      it('renders errors for errorMaximumFilesExceeded', done => {
        const d = { errorMaximumFilesExceeded: 'invalid', submit: true };
        testErrors(done, agent, underTest, d, content, 'required');
      });
    });
  });

  describe('success', () => {
    beforeEach(done => {
      const _session = clone(mockSession);

      withSession(done, agent, _session);
    });

    it('redirects to the equality and diversity page', done => {
      testRedirect(done, agent, underTest, { submit: true },
        s.steps.Equality);
    });
  });

  describe('Check Your Answers', () => {
    it('renders files that have been uploaded', done => {
      const contentToExist = ['question'];
      const valuesToExist = ['marriageCertificateFiles'];
      const context = {
        marriageCertificateFiles: [
          { fileName: 'file 1' },
          { fileName: 'file 2' }
        ]
      };

      testExistenceCYA(done, underTest, content,
        contentToExist, valuesToExist, context);
    });
  });

  describe('success', () => {
    beforeEach(done => {
      const _session = clone(mockSession);
      _session.helpWithFeesNeedHelp = 'Yes';

      withSession(done, agent, _session);
    });

    it('redirects to the equality and diversity page when need help with fees', done => {
      testRedirect(done, agent, underTest,
        { submit: true }, s.steps.Equality);
    });
  });
});

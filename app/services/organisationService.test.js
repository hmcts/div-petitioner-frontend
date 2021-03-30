const { expect, sinon } = require('test/util/chai');
const { OrganisationClient } = require('@hmcts/prd-client');
const CONF = require('config');

const modulePath = 'app/services/organisationService';
const underTest = require(modulePath);
const mockedClient = require('app/services/mocks/organisationServiceClient');

describe(modulePath, () => {
  const getOrganisationByNameSuccess = [
    {
      contactInformation: [
        {
          addressLine1: '177 Edward St',
          addressLine2: 'Kemptown',
          addressLine3: '',
          country: 'United Kingdom',
          county: 'Brighton',
          postCode: 'BN2 0JB',
          townCity: 'Brighton and Hove'
        }
      ],
      name: 'Walker McDonald Solicitors',
      organisationIdentifier: '08-444'
    }
  ];

  describe('module', () => {
    context('Production environment:', () => {
      let getOrganisationByNameStub = null;

      beforeEach(() => {
        CONF.deployment_env = 'aat';
        getOrganisationByNameStub = sinon.stub(OrganisationClient.prototype, 'getOrganisationByName')
          .returns(Promise.resolve(getOrganisationByNameSuccess));
      });

      afterEach(() => {
        getOrganisationByNameStub.restore();
      });

      it('uses the client', done => {
        const status = 'active',
          organisationName = 'org name',
          userToken = '12456',
          serviceToken = 'serviceToken';

        const client = underTest.setup(userToken, serviceToken);

        // Assert.
        const assertion = reallyDone => {
          expect(getOrganisationByNameStub.called).to.equal(true);
          expect(getOrganisationByNameStub.calledWith(status, organisationName)).to.equal(true);
          reallyDone();
        };
        // Act.
        client.getOrganisationByName(status, organisationName)
          .then(assertion(done))
          .catch(error => {
            done(error);
          });
      });
    });

    context('Local environment:', () => {
      beforeEach(() => {
        CONF.deployment_env = 'local';
        sinon.spy(mockedClient, 'getOrganisationByName');
      });

      afterEach(() => {
        mockedClient.getOrganisationByName.restore();
      });

      it('falls back to the mock', done => {
        // Arrange.
        const client = underTest.setup(null, null);
        // Act.
        client.getOrganisationByName()
          .then(() => {
            // Assert.
            expect(mockedClient.getOrganisationByName.called).to.equal(true);
            done();
          })
          .catch(done);
      });
    });
  });

  describe('#getOrganisationByName', () => {
    let client = null;
    CONF.deployment_env = 'local';

    beforeEach(() => {
      sinon.stub(mockedClient, 'getOrganisationByName').resolves(getOrganisationByNameSuccess);
      client = underTest.setup();
    });

    afterEach(() => {
      mockedClient.getOrganisationByName.restore();
    });

    it('forwards the call to the client', done => {
      // Act.
      client.getOrganisationByName()
        .then(() => {
          // Assert.
          expect(mockedClient.getOrganisationByName.calledOnce).to.equal(true);
          done();
        })
        .catch(error => {
          done(error);
        });
    });

    it('resolves sending required data of the response', done => {
      client.getOrganisationByName()
        .then(output => {
          // Assert.
          expect(output).to.eql(getOrganisationByNameSuccess);
          done();
        })
        .catch(error => {
          done(error);
        });
    });

    it('rejects if something goes wrong', done => {
      // Arrange.
      const error = new Error('Something went wrong');
      mockedClient.getOrganisationByName.rejects(error);
      client = underTest.setup();
      // Act.
      client.getOrganisationByName()
        .then(() => {
          done(new Error('Promise not expected to resolve'));
        })
        .catch(output => {
          // Assert.
          expect(output).to.equal(error);
          done();
        });
    });
  });
});

const Tokens = require('csrf');

exports.withSession = (done, agent, data = {}) => {

  agent.get('/session')
    .expect(200)
    .then(function (res) {

      const tokens = new Tokens();
      const csrfToken = tokens.create(res.body.csrfSecret);

      agent.post('/session')
        .set('X-CSRF-token', csrfToken)
        .send(data)
        .expect(200)
        .end(() => {
          agent.csrfToken = csrfToken;
          done();
        });
    });
};

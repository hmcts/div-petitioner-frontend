const Tokens = require('csrf');

exports.withSession = (done, agent, data = {}) => {

  agent.get('/session')
    .expect(200)
    .then(function (res) {

      const tokens = new Tokens();
      data['_csrf'] = tokens.create(res.body.csrfSecret);

      agent.post('/session')
        .send(data)
        .expect(200)
        .end(done);
    });
};
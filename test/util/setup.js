exports.withSession = (done, agent, data) => {

  agent.post('/session')
    .send(data)
    .expect(200)
    .end(done);

};
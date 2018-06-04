const ioRedis = () => {
  const client = {};

  const func = () => {
    return new Promise(resolve => {
      resolve();
    });
  };
  client.on = func;
  client.set = func;
  client.expire = func;
  client.get = func;

  return client;
};

module.exports = ioRedis;

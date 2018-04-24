const url = require('url');

module.exports = (protocol = 'https', hostname = 'localhost', port = '8080') => {
  return url.format({ protocol, hostname, port });
};

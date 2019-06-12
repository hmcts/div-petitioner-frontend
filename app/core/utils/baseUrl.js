const url = require('url');

module.exports = (protocol = 'https', hostname = 'localhost', port = '3000') => {
  return url.format({ protocol, hostname, port });
};

const url = require('url');

const DEFAULT_PORT = 8080;
const protocol = process.env.PUBLIC_PROTOCOL || 'https:';
const hostname = process.env.PUBLIC_HOSTNAME || 'localhost';
const port = process.env.PUBLIC_PORT || DEFAULT_PORT;

module.exports = () => {
  return url.format({ protocol, hostname, port });
};

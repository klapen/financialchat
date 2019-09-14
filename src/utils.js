const jwt = require('jsonwebtoken');
const config = require('./config');

module.exports = {
  validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  },
  decodeToken(token, cb) {
    try {
      const decoded = jwt.verify(token, config.privatekey);
      return cb(null, decoded);
    } catch (ex) {
      return cb('Invalid token');
    }
  },
};

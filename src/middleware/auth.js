const utils = require('../utils');

function auth(req, res, next) {
  let token;
  if (req.headers.authorization) {
    token = req.headers.authorization;
  } else {
    token = req.session.token;
  }

  if (!token) return res.status(401).send('Access denied. No token provided.');

  return utils.decodeToken(token, (err, decoded) => {
    if (err) {
      res.status(400).send(err);
      return;
    }
    req.user = decoded;
    req.user.token = token;
    next();
  });
}

module.exports = auth;

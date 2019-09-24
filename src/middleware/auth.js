const utils = require('../utils');

function auth(req, res, next) {
  let token;
  if (req.headers.authorization) {
    token = req.headers.authorization;
  } else {
    token = req.session.token;
  }

  if (!token) {
    res.status(401).send('Access denied. No token provided.');
    return;
  }

  utils.decodeToken(token, (err, decoded) => {
    if (err) {
      res.status(400).send(err);
      return;
    }
    req.user = decoded;
    req.user.token = token;
    next();
  });
}

function isAdmin(req, res, next) {
  console.log(req.user);
  if (req.user.role !== 'admin') {
    res.status(401).send('Access denied. User is not admin');
    return;
  }

  next();
}

module.exports = {
  auth,
  isAdmin,
};

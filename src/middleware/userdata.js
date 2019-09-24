const utils = require('../utils');

function userdata(req, res, next) {
  const {
    email, pass,
  } = req.body;

  if (!email && !pass) {
    res.status(400).send({ error: 'Email and password are required' });
    return;
  }

  if (!utils.validateEmail(email)) {
    res.status(400).send({ error: 'Invalid email' });
    return;
  }

  next();
}

module.exports = userdata;

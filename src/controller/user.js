const bcrypt = require('bcrypt');
const { User } = require('../models/user');

function getLoginUser(email, pass, cb) {
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        cb('User not found');
        return;
      }

      bcrypt.compare(pass, user.password)
        .then((isMatch) => {
          if (!isMatch) {
            cb('Incorrect password');
            return;
          }

          cb(null, user);
        }).catch((err) => {
          console.log(`Error -> Bcrypt compare: ${err}`);
          cb('Error comparing the passwords');
        });
    }).catch((err) => {
      console.log(`Error -> User find: ${err}`);
      cb('Error on the database');
    });
}

module.exports = {
  getLoginUser,
};

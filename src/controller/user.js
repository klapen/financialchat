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

function createUser(usr) {
  const newUser = new User({
    name: usr.name,
    password: usr.pass,
    email: usr.email,
    role: usr.role,
  });

  bcrypt.hash(newUser.password, 10)
    .then((password) => {
      newUser.password = password;
      newUser.save().then(() => {
        console.log(`User ${usr.email} registered successfully.`);
      });
    }).catch((err) => {
      console.log(`Error -> Bcrypt: ${err}`);
    });
}

module.exports = {
  getLoginUser,
  createUser,
};

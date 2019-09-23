/* eslint array-callback-return: 0 */
const bcrypt = require('bcrypt');
const { User, validate } = require('./models/user');

const connect = require('./dbconn');

const users = [
  {
    email: 'admin@admin.com',
    name: 'Admin',
    password: '12345',
  },
  {
    email: 'user@user.com',
    name: 'User',
    password: '54321',
  },
];

function populate() {
  users.reduce((acc, usr) => {
    const { error } = validate(usr);
    if (error) {
      console.log(`Error -> Validating user ${usr.email}: ${error}`);
      return;
    }

    User.findOne({ email: usr.email })
      .then((user) => {
        if (user) {
          console.log(`User ${usr.email} skipped, already registered.`);
          return;
        }

        const newUser = new User({
          name: usr.name,
          password: usr.password,
          email: usr.email,
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
      }).catch((err) => {
        console.log(`Error -> Mongo finding user ${usr.email}: ${err}`);
      }).finally(() => acc);
  }, users.length);
}

console.log('---> Please press ctrl+c when the process ends');
connect.then(() => {
  populate();
});

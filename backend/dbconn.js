const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const dbname = process.env.MONGO_DB_NAME || 'finchat';
const url = process.env.MONGO_URL || 'mongodb://localhost:27017';

const connect = mongoose.connect(`${url}/${dbname}`, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = connect;

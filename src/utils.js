const jwt = require('jsonwebtoken');
const config = require('./config');

module.exports = {
    validateEmail: function(email) {
	var re = /\S+@\S+\.\S+/;
	return re.test(email);
    },
    decodeToken: function(token, cb){
	try {
	    const decoded = jwt.verify(token, config.privatekey);
	    return cb(null, decoded);
	} catch (ex) {
	    return cb('Invalid token');
	}
    }
}

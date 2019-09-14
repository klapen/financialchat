const utils = require('../utils');

module.exports = function(req, res, next) {
    const token = req.session.token;
    if (!token) return res.status(401).send('Access denied. No token provided.');

    return utils.decodeToken(token, (err, decoded) =>{
	if(err) {
	    res.status(400).send(err);
	    return;
	}
	req.user = decoded;
	next();
    });
};

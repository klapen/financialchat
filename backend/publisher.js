const config = require('./config')
const amqp   = require('amqplib/callback_api');

const addToQueue = function(msg, room){
    amqp.connect(`amqp://${config.amqp.server}`, function (err, conn) {
	conn.createChannel(function (err, channel) {
	    channel.assertQueue(config.amqp.queue, { durable: true });

	    const payload = JSON.stringify({ msg, room });
	    channel.sendToQueue(config.amqp.queue, Buffer.from(payload));
	    console.log(` [x] Sent ${msg} on room ${room}`);
	});
    });
}

module.exports = {
    addToQueue
}

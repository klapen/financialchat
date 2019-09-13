const amqp = require('amqplib/callback_api');

const amqpServer = process.env.AMQP_SERVER || 'localhost';
const amqpQueue = process.env.AMQP_QUEUE || 'finchat-task';

const addToQueue = function(msg, room){
    amqp.connect(`amqp://${amqpServer}`, function (err, conn) {
	conn.createChannel(function (err, channel) {
	    channel.assertQueue(amqpQueue, { durable: true });

	    const payload = JSON.stringify({ msg, room });
	    channel.sendToQueue(amqpQueue, Buffer.from(payload));
	    console.log(` [x] Sent ${msg} on room ${room}`);
	});
    });
}

module.exports = {
    addToQueue
}

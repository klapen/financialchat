const amqp = require('amqplib/callback_api');
const config = require('./config');

function addToQueue(msg, room) {
  amqp.connect(`amqp://${config.amqp.server}`, (err, conn) => {
    if (err) {
      console.log(`Error -> AMQP connection: ${err}`);
      throw err;
    }
    conn.createChannel((error, channel) => {
      if (error) {
        console.log(`Error -> AMQP create channel: ${error}`);
        throw error;
      }
      channel.assertQueue(config.amqp.queue, { durable: true });

      const payload = JSON.stringify({ msg, room });
      channel.sendToQueue(config.amqp.queue, Buffer.from(payload));
      console.log(` [x] Sent ${msg} on room ${room}`);
    });
  });
}

module.exports = {
  addToQueue,
};

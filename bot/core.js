const amqp = require('amqplib/callback_api');
const async = require('async');
const config = require('./config');

const registered = [];

function start() {
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
      channel.prefetch(1);

      console.log('Waiting tasks...');

      channel.consume(config.amqp.queue, async (message) => {
        const content = message.content.toString();
        const task = JSON.parse(content);
        async.each(registered, (bot, acb) => {
          bot.handle(task, acb);
        }, () => {
          channel.ack(message);
        });
      });
    });
  });
}

function register(bot) {
  // TODO: Validate interface
  registered.push(bot);
}
function stop(next) {
  amqp.connect(`amqp://${config.amqp.server}`, (err, conn) => {
    conn.createChannel((error, channel) => {
      channel.close();
      conn.close();
      next();
    });
  });
}

module.exports = {
  start,
  register,
  stop,
};

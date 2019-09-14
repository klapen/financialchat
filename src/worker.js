const amqp = require('amqplib/callback_api');
const getCSV = require('get-csv');
const config = require('./config');

function start(next) {
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
        getCSV(`https://stooq.com/q/l/?s=${task.msg.toLowerCase()}&f=sd2t2ohlcv&h&e=csv`)
          .then((rows) => {
            if (rows.length > 1) {
              console.log('Warning -> Stock API: Returned more than 1 row; it will take only the first data');
            }

            const data = rows[0];
            const msg = data.Close !== 'N/D'
              ? `StockBot: ${data.Symbol} quote is $ ${data.Close} per share`
              : `StockBot: No information for ${data.Symbol}. Please check the stock code.`;

            return msg;
          }).then((msg) => {
            next(task.room, msg);
          }).catch((e) => {
            console.log(`Error -> Stock API request: ${e}`);
            if (e.errno === -2) next(task.room, 'StockBot: Bad formation of Stock Code');
            else next(task.room, 'StockBot: Unknow error on Stock API');
          })
          .finally(() => {
            channel.ack(message);
            console.log(` [x] Recieved ${task.msg} for room ${task.room}`);
          });
      });
    });
  });
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
  stop,
};

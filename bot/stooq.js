const getCSV = require('get-csv');
const config = require('./config');
const api = require('./api')(config.apiKey);

module.exports = {
  handle: (task, cb) => getCSV(`https://stooq.com/q/l/?s=${task.msg.toLowerCase()}&f=sd2t2ohlcv&h&e=csv`)
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
      api.message.create(task.room, msg);
    }).catch((e) => {
      console.log(`Error -> Stock API request: ${e}`);
      if (e.errno === -2) {
        api.message.create(task.room, 'StockBot: Bad formation of Stock Code');
      }
      api.message.create(task.room, 'StockBot: Unknow error on Stock API');
    })
    .finally(() => {
      console.log(` [x] Recieved ${task.msg} for room ${task.room}`);
      cb();
    }),
};

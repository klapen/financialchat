const amqp = require('amqplib/callback_api');
const getCSV = require('get-csv');

const amqpServer = process.env.AMQP_SERVER || 'localhost';
const amqpQueue = process.env.AMQP_QUEUE || 'finchat-task';

const start = function(next){
    amqp.connect(`amqp://${amqpServer}`, function (err, conn) {
	conn.createChannel(function (err, channel) {
	    channel.assertQueue(amqpQueue, { durable: true });
	    channel.prefetch(1);
    
	    console.log('Waiting tasks...');

	    channel.consume(amqpQueue, async (message) => {
		const content = message.content.toString();
		const task = JSON.parse(content);
		getCSV(`https://stooq.com/q/l/?s=${task.msg.toLowerCase()}&f=sd2t2ohlcv&h&e=csv`)
		    .then(rows => {
			if(rows.length > 1){
			    console.log(`Warning -> Stock API: Returned more than 1 row; it will take only the first data`);
			}
			
			const data = rows[0];
			const msg = data.Close !== 'N/D' ?
			      `StockBot: ${data.Symbol} quote is $ ${data.Close} per share` :
			      `StockBot: No information for ${data.Symbol}. Please check the stock code.`;
			
			return msg;
		    }).then( msg => {
			next(task.room, msg);
		    }).catch(err =>{
			console.log(`Error -> Stock API request: ${err}`);
			if(err.errno === -2) next(task.room,'StockBot: Bad formation of Stock Code');
			else next(task.room, 'StockBot: Unknow error on Stock API');
		    }).finally(() =>{
			channel.ack(message);
			console.log(` [x] Recieved ${task.msg} for room ${task.room}`);
		    });
	    });
	});
    });
}

module.exports = {
    start
};

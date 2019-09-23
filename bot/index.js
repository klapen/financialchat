const core = require('./core');
const stooq = require('./stooq');

core.start();
core.register(stooq);
process.on('exit', () => {
  core.stop(() => {
    console.log('Closing rabbitmq channel and connection');
  });
});

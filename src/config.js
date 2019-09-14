module.exports = {
  port: process.env.PORT || '3000',
  secret: process.env.SECRET || 'aSu8TL/~I?T3PMg7OJ;i9FUiaep2BS1&SaJ83rGP#3J7&T#?ftf,5,9|YJ64',
  privatekey: 'qEk!EcZ2Y1.r34$5ZUTSN-*,DC&=.SHo2y3uM5e#=~bMjhAZrwFGJYp|c/a*;3Ve',
  redis: {
    host: process.env.REDIS_SERVER || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    ttl: process.env.REDIS_TTL || 260,
  },
  amqp: {
    server: process.env.AMQP_SERVER || 'localhost',
    queue: process.env.AMQP_QUEUE || 'finchat-task',
  },
};

# Financial Chat

Simple chat using NodeJS with [Socket.io](https://socket.io/), [Mongo](https://www.mongodb.com/), [Redis](https://redis.io/) and [RabbitMQ](https://www.rabbitmq.com/).

# Before you start

You need to start a MongoDB and RabbitMQ server. You can use a docker image:

```
$ docker run -it --name mongo --rm -p 27017:27017 mongo
$ docker run -it --name redis --rm -p 6379:6379 redis
$ docker run -it --name rabbitmq --rm -p 5672:5672 rabbitmq
```

Or use the included compose file

```
$ docker-compose up
```

The default values are:
- Mongo
-- *MONGO_URL*: mongodb://localhost:27017/
-- *MONGO_DB_NAME*: finchat
- RabbitMQ
-- *AMQP_SERVER*: localhost
-- *AMQP_QUEUE*: finchat-task
- Redis
-- *REDIS_SERVER*: localhost
-- *REDIS_PORT*: 6379
-- *REDIS_TTL*: 260

If you don't want to use the default values, just set the enviroment variable as you wish.

```
$ export ENVIRONMENT_VAR = your_value
```

For login, it uses *express-sessions* that uses a SECRET string for configuration. For production environments, it should use a private one:

```
$ export SECRET = your_secret_value
```

For testing, you can populate the database with some seed users. The users can be modified on the file *src/seed.js*. To populate the DB run the following command:

```
$ npm run initdb
```

This command,by default, will load 2 users to test:

| Username  | Password | Email           |
|-----------|----------|-----------------|
| admin     | 12345    | admin@admin.com |
| user      | 54321    | user@user.com   |
| bot       | 98765    | bot@bot.com     |



# Start server

First, get the repository and install the dependencies:

```
$ git clone https://github.com/klapen/financialchat.git
$ cd financialchat
$ cd src
$ npm install
```

To start the server, follow the next commands:

```
$ cd src
$ npm start
```

By default, the use port is **3000**. If you want another port, just set the enviroment variable *PORT*:

```
$ export PORT = XXXX
```

# Start bot

Go to the bot folder and start the bot:

```
$ cd financialchat
$ cd bot
$ npm install
$ npm start
```

By default it has configured the test data. If you want to use another data, please review the file */bot/config.js* and configure the environment variables as you wish.

# How to use

Open on a web browser a [login page](http://localhost:3000/) and enter a valid username, password and room to join; and start to chat.

If you want to use the stock quote bot, send a the command __/stock=*stock_code*__. The stock code must be a valid stock code for [Stooq webpage](https://stooq.com/). It will return the followin message:

> StockBot: [stock_code] quote is ${value} per share

Where **stock_code** is the requested code and the **value** is the closing value.

# Release note

- v0.0.1 Beta version
- v0.1.1 Decouple bot version

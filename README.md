# Financial Chat

Simple chat using NodeJS with [Socket.io](https://socket.io/), [Mongo](https://www.mongodb.com/) and [RabbitMQ](https://www.rabbitmq.com/).

# Before you start

You need to start a MongoDB and RabbitMQ server. You can use a docker image:

```
$ docker run -it --name mongo --rm -p 27017:27017 mongo
$ docker run -it --name rabbitmq --rm -p 5672:5672 rabbitmq
```

The default values are:
- Mongo
-- *MONGO_URL*: mongodb://localhost:27017/
-- *MONGO_DB_NAME*: finchat
- RabbitMQ
-- *AMQP_SERVER*: localhost
-- *AMQP_QUEUE*: finchat-task

If you don't want to use the default values, just set the enviroment variable as you wish.

```
$ export MONGO_URL = your_url
$ export MONGO_DB_NAME = your_db_database
$ export AMQP_SERVER = your_amqp_server
$ export AMQP_QUEUE = your_amqp_queue
```

# Start server

First, get the repository and install the dependencies:

```
$ git clone https://github.com/klapen/financialchat.git
$ cd financialchat
$ cd backend
$ npm install
```

To start the server, follow the next commands:

```
$ cd backend
$ npm start
```

By default, the use port is **3000**. If you want another port, just set the enviroment variable *PORT*:

```
$ export PORT = XXXX
```

# How to use

ToDo

# Release note

- v0.0.1 Beta version

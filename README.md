# Financial Chat

Simple chat using NodeJS with [Socket.io](https://socket.io/) and [Mongo](https://www.mongodb.com/)

# Before you start

You need to start a MongoDB server. You can use a docker image:

```
$ docker run -it -name mongo -rm -p 27017:27017 mongo
```

With this one, you can use the default connection string *mongodb://localhost:27017/*. If not, you can set your own mongo url setting the enviroment variable *MONGO_URL*. Also, the default database name is *finchat* but it can be changed using the enviroment variable *MONGO_DB_NAME*.

```
$ export MONGO_URL = your_url
$ export MONGO_DB_NAME = your_db_database
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

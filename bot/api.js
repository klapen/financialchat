const request = require('request');
const config = require('./config');

module.exports = (apiKey) => ({
  message: {
    create: (room, message) => {
      const headers = {
        'content-type': 'application/json',
        authorization: `${apiKey}`,
      };

      const options = {
        uri: `${config.chatApi}/message`,
        method: 'POST',
        headers,
        json: {
          room,
          message,
        },
      };

      request(options, (error, res) => {
        // ToDo: Retry send message logic
        if (error) {
          console.log(`Error -> Bot post message on chat room ${room}: ${error}`);
          return;
        }

        if (res.statusCode !== 200) {
          console.log(`Error -> Bot post status code: ${res.statusCode}: ${res.body}`);
          return;
        }

        console.log(`Message post on chat room ${room}: ${message}`);
      });
    },
  },
});

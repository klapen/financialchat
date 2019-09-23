module.exports = {
  apiKey: process.env.BOT_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZDg5NDlkYWM5MTdmZTdmNmUxM2Y2MTUiLCJuYW1lIjoiQm90Iiwicm9sZSI6ImJvdCIsImlhdCI6MTU2OTI3OTE5Mn0.ud3-7d-P1M7MX1ZHhIRlxLAXCLNO0XgWk94a1tbf9l4',
  chatApi: process.env.CHAT_API || 'http://localhost:3000',
  amqp: {
    server: process.env.AMQP_SERVER || 'localhost',
    queue: process.env.AMQP_QUEUE || 'finchat-task',
  },
};

const io = require('socket.io');
let chat;
let guestNumber = 1;

const chatServer = {

  // takes in an http server
  listen (server) {
    // create socket server
    chat = io(server);

    chat.on('connection', (socket) => {
      console.log("connected");
      socket.emit('message', { text: 'this is the text' });
    });
  }
};

module.exports = chatServer;

const io = require('socket.io');
let chat;
let guestNumber = 1;
const nickNames = {};

let namesUsed = [];
const currentRoom = {};

const chatServer = {

  // takes in an http server
  listen (server) {
    // create socket server
    chat = io(server);

    chat.on('connection', (socket) => {
      console.log("connected");
      socket.emit('message', { text: 'this is the text' });
    });
  },
  // track number of guests and nicknames
  assignGuestName (socket, guestNumber, nickNames, namesUsed) {
    const name = `Guest_${guestNumber}`;
    nickNames[socket.id] = name;
    socket.emit('nameResult', {
      success: true,
      name
    });
    namesUsed.push(name);
    return guestNumber + 1;
  },
  // remove nickname and announce departure to room
  handleClientDisconnection (socket) {
    socket.on('disconnect', () => {
      const nameIdx = namesUsed.indexOf(nickNames[socket.id]);
      delete nickNames[socket.id];
      namesUsed = [
        ...namesUsed.slice(0, nameIdx),
        ...namesUsed.slice(nameIdx + 1)
      ];
    });
  },
  // listen for a nickanmeChangeRequest event
  handleNameChangeAttempts (socket, nickNames, namesUsed) {
    socket.on('nameAttempt', (name) => {
      if (name.toLowerCase().startsWith('guest')) {
        socket.emit('nameResult', {
          success: false,
          message: 'Names cannot begin with "Guest"'
        });
      } else {
        if (!namesUsed.includes(name)) {
          const prevName = nickNames[socket.id];
          const prevNameIdx = namesUsed.indexOf(prevName);
          nickNames[socket.id] = name;
          namesUsed = [
            ...namesUsed.slice(0, prevNameIdx),
            ...namesUsed.slice(prevNameIdx + 1),
            name
          ];
          socket.emit('nameResult', {
            success: true,
            name
          });
          socket.broadcast.to(currentRoom[socket.id]).emit('message', {
            text: `${prevName} is now known as ${name}.`
          });
        } else {
          socket.emit('nameResult', {
            success: false,
            message: 'That name is already in use.'
          });
        }
      }
    });
  },

};

module.exports = chatServer;

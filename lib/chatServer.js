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
      guestNumber = this.assignGuestName(
        socket, guestNumber, nickNames, namesUsed
      );
      this.joinRoom(socket, 'lobby');
      this.handleMessageBroadcast(socket, nickNames);
      this.handleNameChangeAttempts(socket, nickNames, namesUsed);
      this.handleRoomJoining(socket);
      socket.on('rooms', () => {
        let rooms = [];
      	for (let s in chat.sockets.sockets) {
      	  rooms = rooms.concat(this.listRooms(chat.sockets.sockets[s]));
      	}
        rooms = Array.from(new Set(rooms));
        socket.emit('rooms', rooms);
      });

        this.handleClientDisconnection(socket);
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
  listRooms (socket) {
    const rooms = Object.keys(socket.rooms);
    return rooms.filter(r => r !== socket.id);
  },
  // chat broadcasts to emit to room
  handleMessageBroadcast (socket) {
    socket.on('message', (message) => {
      socket.broadcast.to(message.room).emit('message', {
        text: `${nickNames[socket.id]}: ${message.text}`
      });
    });
  },
  handleRoomJoining (socket) {
    socket.on('join', (room) => {
      socket.leave(currentRoom[socket.id]);
      this.joinRoom(socket, room.newRoom);
    });
  },
  joinRoom (socket, room) {
    socket.join(room);
    currentRoom[socket.id] = room;
    socket.emit('joinResult', {room});
    socket.broadcast.to(room).emit('message', {
      text: `${nickNames[socket.id]} has joined ${room}.`
    });

    chat.of('/').in(`${room}`).clients((err, sockets) => {
      if (err) return console.error(err);
      const usersInRoom = sockets.map(sId => nickNames[sId]).join(', ');
      const usersInRoomSummary = `Users currently in ${room}: ${usersInRoom}`;
      socket.emit('message', {text: usersInRoomSummary});
    });
  }

};

module.exports = chatServer;

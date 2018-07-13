class Chat {
  constructor(socket) {
    this.socket;
  }

  sendMessage(room, msg) {
    this.socket.emit('message', {text: msg, room});
  }
}

export default Chat;

const Chat = require('./chat');

class ChatUI {
  constructor(socket) {
    this.chat = new Chat(socket);
    this.form = document.querySelector('form');
    this.msgList = document.querySelector('ul#msg-list');
    this.roomList = document.querySelector('ul#room-list');
    this.input = document.querySelector('input');
    this.room = document.querySelector('#room');
    this.handleSubmit();
  }

  // receive user input
  getInput() {
    return this.input.value;
  }

  setRoom(room) {
    this.room.textContent = room;
  }

  // emit messages submitted by user
  sendMsg(room) {
    this.chat.sendMessage(room, this.getInput());
  }

  // add message
  addMsg(msg) {
    let newMsg = document.createElement('li');
    newMsg.textContent = msg;
    this.msgList.appendChild(newMsg);
  }

  // add room
  addRoom(room) {
    let newRoom = document.createElement('li');
    newRoom.textContent = room;
    this.roomList.appendChild(newRoom);
  }

  // handle submit
  handleSubmit() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log("click here");
      this.processInput();
      this.input.value = "";
    });
  }

  // process user input
  processInput() {
    let msg = this.getInput();
    let response;
    if (msg[0] === '/') {
      response = this.chat.processCommand(msg);
      if (response) {
        this.addMsg(response);
      }
    } else {
      this.sendMsg(this.room.textContent);
      this.addMsg(msg);
    }
  }
}

export default ChatUI;

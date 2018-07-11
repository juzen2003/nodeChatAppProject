const express = require('express');
const path = require('path');

// const io = require('socket.io');
// const socket = io();

const app = express();
const port = 8000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`you'll visit the url => localhost:${port}`);
  // console.log(io);
  // console.log(socket);
});

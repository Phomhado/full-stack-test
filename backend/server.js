const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`New user connected: ${socket.id}`);

  socket.on('sendMessage', (message) => {
    console.log('Message received:', message);
    
    io.emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send("Server is set!");
});

server.listen(5000, () => {
  console.log('Server running on port 5000');
});

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { handleSendMessage } = require('./controllers/messageController');
const messageRoutes = require('./routes/messageRoutes');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: corsOptions });

io.on('connection', (socket) => {
  console.log('New client connected');
  handleSendMessage(socket, io);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.use(cors());
app.use(express.json());
app.use(authMiddleware);
app.use('/api', messageRoutes);

app.get('/', (req, res) => {
  res.send("Server is set!");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
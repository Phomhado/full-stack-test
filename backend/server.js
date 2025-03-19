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
  console.log(`New user connected: ${socket.id}`);
  handleSendMessage(socket);
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.use(cors());
app.use(express.json());
app.use(authMiddleware);
app.use('/api', messageRoutes);

app.get('/', (req, res) => {
  res.send("Server is set!");
});

server.listen(5000, () => {
  console.log('Server running on port 5000');
});

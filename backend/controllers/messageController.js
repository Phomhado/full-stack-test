const fs = require('fs-extra');
const path = require('path');
const messagesFilePath = path.join(__dirname, '../messages.json');
const maxFileSize = 5 * 1024 * 1024; // 5 MB

const handleSendMessage = (socket) => {
  socket.on('sendMessage', (message) => {
    console.log('Message received:', message);

    // Read existing messages
    const messages = JSON.parse(fs.readFileSync(messagesFilePath, 'utf8'));

    // Add new message
    const newMessage = {
      content: message.content,
      sender: message.sender,
      timestamp: new Date().toISOString()
    };
    messages.push(newMessage);

    // Write updated messages to file
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2));

    // Check file size and rotate if necessary
    const stats = fs.statSync(messagesFilePath);
    if (stats.size > maxFileSize) {
      rotateLogFile();
    }

    socket.broadcast.emit('receiveMessage', newMessage);
  });
};

const rotateLogFile = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archiveFilePath = path.join(__dirname, `../messages-${timestamp}.json`);
  fs.moveSync(messagesFilePath, archiveFilePath);
  fs.writeFileSync(messagesFilePath, '[]'); // Create a new empty log file
  console.log(`Log file rotated: ${archiveFilePath}`);
};

const getMessages = (req, res) => {
  try {
    const messages = JSON.parse(fs.readFileSync(messagesFilePath, 'utf8'));
    res.send(messages);
  } catch (error) {
    res.status(500).send(error);
  }
};

const createMessage = (req, res) => {
  try {
    const messages = JSON.parse(fs.readFileSync(messagesFilePath, 'utf8'));

    const newMessage = {
      content: req.body.content,
      sender: req.body.sender,
      timestamp: new Date().toISOString()
    };

    messages.push(newMessage);
    fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2));

    // Check file size and rotate if necessary
    const stats = fs.statSync(messagesFilePath);
    if (stats.size > maxFileSize) {
      rotateLogFile();
    }

    res.status(201).send(newMessage);
  } catch (error) {
    res.status(400).send(error);
  }
};

module.exports = { handleSendMessage, getMessages, createMessage };
const fs = require('fs-extra');
const path = require('path');
const { getMessages, createMessage, handleSendMessage } = require('./messageController');

jest.mock('fs-extra');

const messagesFilePath = path.join(__dirname, '../messages.json');

describe('messageController', () => {
  describe('getMessages', () => {
    it('should return messages', async () => {
      const req = {};
      const res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      const messages = [{ content: 'Hello', sender: 'User1', timestamp: '2025-03-19T12:00:00Z' }];
      fs.readFileSync.mockReturnValue(JSON.stringify(messages));

      await getMessages(req, res);

      expect(res.send).toHaveBeenCalledWith(messages);
    });

    it('should handle errors', async () => {
      const req = {};
      const res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      await getMessages(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('createMessage', () => {
    it('should create a new message', async () => {
      const req = {
        body: { content: 'Hello', sender: 'User1' },
      };
      const res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      const messages = [];
      fs.readFileSync.mockReturnValue(JSON.stringify(messages));
      fs.statSync.mockReturnValue({ size: 1024 });

      await createMessage(req, res);

      const expectedMessage = {
        content: 'Hello',
        sender: 'User1',
        timestamp: expect.any(String),
      };

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        messagesFilePath,
        expect.stringContaining('"timestamp":')
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining(expectedMessage));
    });

    it('should handle errors', async () => {
      const req = {
        body: { content: 'Hello', sender: 'User1' },
      };
      const res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      await createMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('handleSendMessage', () => {
    it('should handle sendMessage event', () => {
      const socket = {
        on: jest.fn((event, callback) => {
          if (event === 'sendMessage') {
            callback({ content: 'Hello', sender: 'User1' });
          }
        }),
      };
      const io = {
        emit: jest.fn(),
      };
      const messages = [];
      fs.readFileSync.mockReturnValue(JSON.stringify(messages));
      fs.statSync.mockReturnValue({ size: 1024 });

      handleSendMessage(socket, io);

      const expectedMessage = {
        content: 'Hello',
        sender: 'User1',
        timestamp: expect.any(String),
      };

      expect(socket.on).toHaveBeenCalledWith('sendMessage', expect.any(Function));
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        messagesFilePath,
        expect.stringContaining('"timestamp":')
      );
      expect(io.emit).toHaveBeenCalledWith('receiveMessage', expect.objectContaining(expectedMessage));
    });
  });
});
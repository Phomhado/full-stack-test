const request = require('supertest');
const express = require('express');
const messageRoutes = require('./messageRoutes');
const { getMessages, createMessage } = require('../controllers/messageController');

jest.mock('../controllers/messageController');

const app = express();
app.use(express.json());
app.use('/api', messageRoutes);

describe('messageRoutes', () => {
  it('should call getMessages on GET /api/messages', async () => {
    getMessages.mockImplementation((req, res) => res.status(200).send('getMessages called'));

    const response = await request(app).get('/api/messages');

    expect(response.status).toBe(200);
    expect(response.text).toBe('getMessages called');
    expect(getMessages).toHaveBeenCalled();
  });

  it('should call createMessage on POST /api/messages', async () => {
    createMessage.mockImplementation((req, res) => res.status(201).send('createMessage called'));

    const response = await request(app)
      .post('/api/messages')
      .send({ content: 'Hello', sender: 'User1' });

    expect(response.status).toBe(201);
    expect(response.text).toBe('createMessage called');
    expect(createMessage).toHaveBeenCalled();
  });
});
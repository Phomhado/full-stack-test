const request = require('supertest');
const http = require('http');
const app = require('./server');

jest.mock('socket.io', () => {
  return function() {
    return {
      on: jest.fn(),
      emit: jest.fn(),
    };
  };
});

jest.mock('./middleware/authMiddleware', () => {
  return (req, res, next) => {
    req.user = { id: 'testUserId' }; 
    next();
  };
});

describe('server', () => {
  let server;

  beforeAll((done) => {
    server = http.createServer(app);
    server.listen(done);
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should respond with "Server is set!" on GET /', async () => {
    const response = await request(server).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Server is set!');
  });

  it('should call getMessages on GET /api/messages', async () => {
    const response = await request(server).get('/api/messages');
    expect(response.status).toBe(200);
  });

  it('should call createMessage on POST /api/messages', async () => {
    const response = await request(server)
      .post('/api/messages')
      .send({ content: 'Hello', sender: 'User1' });
    expect(response.status).toBe(201);
  });
}, 10000);
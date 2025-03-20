const jwt = require('jsonwebtoken');
const authMiddleware = require('./authMiddleware');

jest.mock('jsonwebtoken');

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn().mockReturnValue('Bearer validToken')
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    next = jest.fn();
  });

  it('should call next if token is valid', () => {
    const decoded = { id: 'userId' };
    jwt.verify.mockReturnValue(decoded);

    authMiddleware(req, res, next);

    expect(req.user).toEqual(decoded);
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if no token is provided', () => {
    req.header.mockReturnValue(null);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({ error: 'Access denied. No token provided.' });
  });

  it('should return 400 if token is invalid', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ error: 'Invalid token.' });
  });
});
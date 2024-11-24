const request = require('supertest');
const express = require('express');
const { searchValidation, validate } = require('../middleware/validation');
const { searchOpenAI } = require('../controllers/searchController');

// Mock Redis client
jest.mock('../middleware/cache', () => ({
  cacheMiddleware: (req, res, next) => next(),
  initializeRedis: jest.fn()
}));

// Mock logger
jest.mock('../middleware/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  },
  httpLogger: (req, res, next) => next()
}));

describe('Search API', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post('/api/search',
      searchValidation,
      validate,
      searchOpenAI
    );
  });

  it('should validate search query', async () => {
    const response = await request(app)
      .post('/api/search')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Validation error');
  });

  it('should validate query length', async () => {
    const response = await request(app)
      .post('/api/search')
      .send({ query: 'a' });

    expect(response.status).toBe(400);
    expect(response.body.details[0].msg).toContain('between 2 and 500 characters');
  });

  it('should accept valid query', async () => {
    const mockQuery = 'What is artificial intelligence?';
    
    // Mock the fetch function
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          choices: [{
            message: {
              content: 'Mocked AI response'
            }
          }]
        })
      })
    );

    const response = await request(app)
      .post('/api/search')
      .send({ query: mockQuery });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('result');
  });

  it('should handle API errors', async () => {
    // Mock fetch to simulate an error
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          error: { message: 'API Error' }
        })
      })
    );

    const response = await request(app)
      .post('/api/search')
      .send({ query: 'test query' });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
  });
});

describe('Rate Limiting', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    const rateLimit = require('express-rate-limit');
    const limiter = rateLimit({
      windowMs: 1000, // 1 second for testing
      max: 2 // limit each IP to 2 requests per second
    });
    
    app.use(limiter);
    app.post('/api/search', (req, res) => res.json({ status: 'ok' }));
  });

  it('should limit requests', async () => {
    // Make 3 requests in quick succession
    await request(app).post('/api/search');
    await request(app).post('/api/search');
    const response = await request(app).post('/api/search');

    expect(response.status).toBe(429);
  });
});

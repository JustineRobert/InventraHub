process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://inventra:inventra123@localhost:5432/inventra';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-01234567890123456789012345678901';
process.env.CORS_ORIGINS = process.env.CORS_ORIGINS || 'http://localhost:5173';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

const mockedPrisma = {
  user: {
    findUnique: jest.fn()
  }
};

jest.mock('../src/utils/prisma', () => mockedPrisma);

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../src/app').default;

type PrismaMock = {
  user: {
    findUnique: jest.Mock;
    create?: jest.Mock;
  };
};

describe('Auth routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns OK for health check', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({ status: 'ok' }));
  });

  it('returns 401 for profile without auth token', async () => {
    const response = await request(app).get('/api/auth/profile');
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Authentication token is required' });
  });

  it('allows login with valid credentials', async () => {
    const password = 'Password123!';
    const hashed = await bcrypt.hash(password, 12);

    mockedPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'test-user-id',
      email: 'alice@example.com',
      password: hashed,
      role: 'SALES',
      businessId: 'test-business'
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@example.com', password });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toMatchObject({ email: 'alice@example.com', role: 'SALES' });
  });
});

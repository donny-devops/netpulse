import request from 'supertest';
import app from '../src/app';

describe('authenticate middleware', () => {
  it('rejects requests with no x-api-key header', async () => {
    const res = await request(app)
      .post('/webhook/test')
      .send({ data: 'payload' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Unauthorized/);
  });

  it('rejects requests with empty x-api-key header', async () => {
    const res = await request(app)
      .post('/webhook/test')
      .set('x-api-key', '')
      .send({ data: 'payload' });

    expect(res.status).toBe(401);
  });

  it('rejects requests with incorrect x-api-key', async () => {
    const res = await request(app)
      .post('/webhook/test')
      .set('x-api-key', 'definitely-wrong')
      .send({ data: 'payload' });

    expect(res.status).toBe(401);
  });

  it('allows requests with correct x-api-key', async () => {
    const res = await request(app)
      .post('/webhook/test')
      .set('x-api-key', 'test-api-key')
      .send({ data: 'payload' });

    expect(res.status).toBe(202);
  });
});

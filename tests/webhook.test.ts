import request from 'supertest';
import app from '../src/app';

const VALID_API_KEY = 'test-api-key';

describe('POST /webhook/:source', () => {
  it('returns 401 when API key is missing', async () => {
    const res = await request(app)
      .post('/webhook/make')
      .send({ event: 'test' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toMatch(/Unauthorized/);
  });

  it('returns 401 when API key is invalid', async () => {
    const res = await request(app)
      .post('/webhook/zapier')
      .set('x-api-key', 'wrong-key')
      .send({ event: 'test' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 202 with valid API key and payload', async () => {
    const res = await request(app)
      .post('/webhook/make')
      .set('x-api-key', VALID_API_KEY)
      .send({ event: 'new_lead', data: { name: 'Alice' } });

    expect(res.status).toBe(202);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Webhook accepted');
    expect(res.body.eventId).toBeDefined();
    expect(res.body.source).toBe('make');
    expect(res.body.receivedAt).toBeDefined();
  });

  it('returns 202 for different sources', async () => {
    const sources = ['zapier', 'custom-app', 'github'];

    for (const source of sources) {
      const res = await request(app)
        .post(`/webhook/${source}`)
        .set('x-api-key', VALID_API_KEY)
        .send({ event: 'ping' });

      expect(res.status).toBe(202);
      expect(res.body.source).toBe(source);
    }
  });

  it('assigns a unique eventId per request', async () => {
    const [res1, res2] = await Promise.all([
      request(app)
        .post('/webhook/make')
        .set('x-api-key', VALID_API_KEY)
        .send({ event: 'a' }),
      request(app)
        .post('/webhook/make')
        .set('x-api-key', VALID_API_KEY)
        .send({ event: 'b' }),
    ]);

    expect(res1.body.eventId).not.toBe(res2.body.eventId);
  });
});

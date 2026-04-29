import { test, expect } from '@playwright/test';

test.describe('Verify Login API', () => {
  test('POST with invalid credentials returns 404 user not found', async ({ request }) => {
    const response = await request.post('/api/verifyLogin', {
      form: { email: 'nosuchuser@notreal.com', password: 'wrongpassword' },
    });
    const body = await response.json();

    expect(body.responseCode).toBe(404);
    expect(body.message).toBe('User not found!');
  });

  test('POST without email parameter returns 400 bad request', async ({ request }) => {
    const response = await request.post('/api/verifyLogin', {
      form: { password: 'somepassword' },
    });
    const body = await response.json();

    expect(body.responseCode).toBe(400);
    expect(body.message).toContain('email or password parameter is missing');
  });

  test('POST without password parameter returns 400 bad request', async ({ request }) => {
    const response = await request.post('/api/verifyLogin', {
      form: { email: 'someone@example.com' },
    });
    const body = await response.json();

    expect(body.responseCode).toBe(400);
    expect(body.message).toContain('email or password parameter is missing');
  });

  test('DELETE /api/verifyLogin returns 405 method not supported', async ({ request }) => {
    const response = await request.delete('/api/verifyLogin');
    const body = await response.json();

    expect(body.responseCode).toBe(405);
    expect(body.message).toBe('This request method is not supported.');
  });

  test('POST with valid credentials returns 200 user exists', async ({ request }) => {
    // Create a known account, verify login, then clean up
    const email = `authtest_${Date.now()}@example.com`;
    const password = 'AuthTest123!';

    await request.post('/api/createAccount', {
      form: {
        name: 'Auth Test',
        email,
        password,
        title: 'Mr',
        birth_date: '1',
        birth_month: '1',
        birth_year: '1990',
        firstname: 'Auth',
        lastname: 'Test',
        company: '',
        address1: '1 Test St',
        address2: '',
        country: 'Canada',
        zipcode: '12345',
        state: 'Ontario',
        city: 'Toronto',
        mobile_number: '5550000000',
      },
    });

    try {
      const response = await request.post('/api/verifyLogin', {
        form: { email, password },
      });
      const body = await response.json();

      expect(body.responseCode).toBe(200);
      expect(body.message).toBe('User exists!');
    } finally {
      await request.delete('/api/deleteAccount', {
        form: { email, password },
      });
    }
  });
});

import { test, expect } from '@playwright/test';

const BASE_USER = {
  title: 'Mr' as const,
  birth_date: '15',
  birth_month: '6',
  birth_year: '1990',
  firstname: 'API',
  lastname: 'Tester',
  company: 'TestCo',
  address1: '123 Test Street',
  address2: '',
  country: 'Canada',
  zipcode: 'M1A1A1',
  state: 'Ontario',
  city: 'Toronto',
  mobile_number: '5551234567',
};

test.describe.configure({ mode: 'serial' });

test.describe('User Account API', { tag: ['@api', '@regression'] }, () => {
  let testEmail: string;
  const testPassword = 'ApiTest123!';

  test.beforeAll(async ({ request }) => {
    testEmail = `apitest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;
    const response = await request.post('/api/createAccount', {
      form: { name: 'API Tester', email: testEmail, password: testPassword, ...BASE_USER },
    });
    const body = await response.json();
    expect(body.responseCode).toBe(201);
  });

  test.afterAll(async ({ request }) => {
    await request.delete('/api/deleteAccount', {
      form: { email: testEmail, password: testPassword },
    });
  });

  test('POST /api/createAccount with existing email returns 400', async ({ request }) => {
    const response = await request.post('/api/createAccount', {
      form: { name: 'Duplicate', email: testEmail, password: testPassword, ...BASE_USER },
    });
    const body = await response.json();

    expect(body.responseCode).toBe(400);
    expect(body.message).toContain('Email already exist');
  });

  test('GET /api/getUserDetailByEmail returns user data', { tag: '@smoke' }, async ({ request }) => {
    const response = await request.get('/api/getUserDetailByEmail', {
      params: { email: testEmail },
    });
    const body = await response.json();

    expect(body.responseCode).toBe(200);
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(testEmail);
    expect(body.user.first_name).toBe('API');
    expect(body.user.last_name).toBe('Tester');
  });

  test('GET /api/getUserDetailByEmail with unknown email returns 404', async ({ request }) => {
    const response = await request.get('/api/getUserDetailByEmail', {
      params: { email: 'doesnotexist@nowhere.com' },
    });
    const body = await response.json();

    expect(body.responseCode).toBe(404);
  });

  test('PUT /api/updateAccount updates user details', async ({ request }) => {
    const response = await request.put('/api/updateAccount', {
      form: {
        name: 'Updated Tester',
        email: testEmail,
        password: testPassword,
        ...BASE_USER,
        firstname: 'Updated',
        lastname: 'Name',
        city: 'Vancouver',
      },
    });
    const body = await response.json();

    expect(body.responseCode).toBe(200);
    expect(body.message).toBe('User updated!');
  });

  test('updated user detail reflects changes', async ({ request }) => {
    const response = await request.get('/api/getUserDetailByEmail', {
      params: { email: testEmail },
    });
    const { user } = await response.json();

    expect(user.first_name).toBe('Updated');
    expect(user.last_name).toBe('Name');
    expect(user.city).toBe('Vancouver');
  });
});

test.describe('Delete Account API', { tag: ['@api', '@regression'] }, () => {
  test('DELETE /api/deleteAccount removes the user', async ({ request }) => {
    const email = `delete_test_${Date.now()}@example.com`;
    const password = 'Delete123!';

    await request.post('/api/createAccount', {
      form: { name: 'Delete Test', email, password, ...BASE_USER },
    });

    const deleteResponse = await request.delete('/api/deleteAccount', {
      form: { email, password },
    });
    const body = await deleteResponse.json();

    expect(body.responseCode).toBe(200);
    expect(body.message).toBe('Account deleted!');
  });

  test('GET /api/getUserDetailByEmail returns 404 after deletion', async ({ request }) => {
    const email = `deleted_check_${Date.now()}@example.com`;
    const password = 'Delete123!';

    await request.post('/api/createAccount', {
      form: { name: 'Delete Check', email, password, ...BASE_USER },
    });
    await request.delete('/api/deleteAccount', {
      form: { email, password },
    });

    const response = await request.get('/api/getUserDetailByEmail', {
      params: { email },
    });
    const body = await response.json();

    expect(body.responseCode).toBe(404);
  });
});

import { test, expect } from '@playwright/test';

test.describe('Products API', () => {
  test('GET /api/productsList returns 200 with products array', async ({ request }) => {
    const response = await request.get('/api/productsList');
    const body = await response.json();

    expect(body.responseCode).toBe(200);
    expect(body.products).toBeInstanceOf(Array);
    expect(body.products.length).toBeGreaterThan(0);
  });

  test('each product has required fields', async ({ request }) => {
    const response = await request.get('/api/productsList');
    const { products } = await response.json();

    for (const product of products) {
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('brand');
      expect(product).toHaveProperty('category');
      expect(product.category).toHaveProperty('usertype');
      expect(product.category).toHaveProperty('category');
    }
  });

  test('POST /api/productsList returns 405 method not supported', async ({ request }) => {
    const response = await request.post('/api/productsList');
    const body = await response.json();

    expect(body.responseCode).toBe(405);
    expect(body.message).toBe('This request method is not supported.');
  });
});

test.describe('Brands API', () => {
  test('GET /api/brandsList returns 200 with brands array', async ({ request }) => {
    const response = await request.get('/api/brandsList');
    const body = await response.json();

    expect(body.responseCode).toBe(200);
    expect(body.brands).toBeInstanceOf(Array);
    expect(body.brands.length).toBeGreaterThan(0);
  });

  test('each brand has id and brand name fields', async ({ request }) => {
    const response = await request.get('/api/brandsList');
    const { brands } = await response.json();

    for (const brand of brands) {
      expect(brand).toHaveProperty('id');
      expect(brand).toHaveProperty('brand');
      expect(typeof brand.brand).toBe('string');
    }
  });

  test('PUT /api/brandsList returns 405 method not supported', async ({ request }) => {
    const response = await request.put('/api/brandsList');
    const body = await response.json();

    expect(body.responseCode).toBe(405);
    expect(body.message).toBe('This request method is not supported.');
  });
});

test.describe('Search Product API', () => {
  test('POST /api/searchProduct with search term returns matching products', async ({ request }) => {
    const response = await request.post('/api/searchProduct', {
      form: { search_product: 'top' },
    });
    const body = await response.json();

    expect(body.responseCode).toBe(200);
    expect(body.products).toBeInstanceOf(Array);
    expect(body.products.length).toBeGreaterThan(0);
    // API searches across name, category, and other fields — not name-only
    expect(body.products.some((p: { name: string }) => p.name.toLowerCase().includes('top'))).toBe(true);
  });

  test('POST /api/searchProduct without search_product param returns 400', async ({ request }) => {
    const response = await request.post('/api/searchProduct');
    const body = await response.json();

    expect(body.responseCode).toBe(400);
    expect(body.message).toContain('search_product parameter is missing');
  });
});

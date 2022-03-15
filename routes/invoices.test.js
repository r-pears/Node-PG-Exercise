// Tests for invoices
const request = require('supertest');
const app = require('../app');
const { createData } = require('../test_data');
const db = require('../db');

// Before each test
beforeEach(createData);

// After tests, stop the database
afterAll(async () => {
  await db.end();
});

// Get all invoices
describe("GET /", function () {
  test("It should respond with an array of all invoices", async function () {
    const response = await request(app).get('/invoices');

    expect(response.body).toEqual({
      "invoices": [
        { id: 1, comp_code: "apple" },
        { id: 2, comp_code: "apple" },
        { id: 3, comp_code: 'ibm' },
      ]
    });
  });
});

// Get a specific invoice
describe("GET /1", function () {
  test("It returns invoice info", async function () {
    const response = await request(app).get('/invoices/1');

    expect(response.body).toEqual(
      {
        "invoice": {
          id: 1,
          amt: 100,
          add_date: '2018-01-01T08:00:00.000Z',
          paid: false,
          paid_date: null,
          company: {
            code: 'apple',
            name: 'Apple',
            description: 'Maker of IOS',
          }
        }
      }
    );
  });

  test("It should return 404 if invoice doesn't exist", async function () {
    const response = await request(app).get('/invoices/0');

    expect(response.status).toEqual(404);
  });
});

// Add an invoice
describe("POST /", function () {
  test("It should add a new invoice", async function () {
    const response = await request(app)
      .post('/invoices')
      .send({ amt: 400, comp_code: 'ibm' });
    
    expect(response.body).toEqual(
      {
        "invoice:": {
          id: 4,
          comp_code: 'ibm',
          amt: 400,
          add_date: expect.any(String),
          paid: false,
          paid_date: null,
        }
      }
    );
  });
});

// Update an invoice
describe("PUT /", function () {
  test("It should update an invoice", async function () {
    const response = await request(app)
      .put('/invoices/1')
      .send({ amt: 1000, paid: false });
    
    expect(response.body).toEqual(
      {
        "invoice": {
          id: 1,
          comp_code: 'apple',
          paid: false,
          amt: 1000,
          add_date: expect.any(String),
          paid_date: null
        }
      }
    );
  });

  test("It should return a 404 if invoice doesn't exist", async function () {
    const response = await request(app)
      .put('/invoices/0')
      .send({ amt: 1000 });
    
    expect(response.status).toEqual(404);
  });

  test("It should return 500 for missing data", async function () {
    const response = await request(app)
      .put('/invoices/1')
      .send({});
    
    expect(response.status).toEqual(500);
  });
});

// Delete an invoice
describe("DELETE /", function () {
  test("It should delete an invoice", async function () {
    const response = await request(app)
      .delete('/invoices/1');
    
    expect(response.body).toEqual({ "status": "Deleted" });
  });

  test("It should return a 404 if invoice doesn't exist", async function () {
    const response = await request(app)
      .delete('/invoices/0');
    
    expect(response.status).toEqual(404);
  });
});
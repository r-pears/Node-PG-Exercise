// Tests for companies
const request = require('supertest');
const app = require('../app');
const { createData } = require('../test_data');
const db = require('../db');

// Before each test, clean out data
beforeEach(createData);

// After all tests, stop the database
afterAll(async () => {
  await db.end();
});

// Should return all companies
describe('GET /', function () {
  test('It should respond with an array of all companies', async function () {
    const response = await db.request(app).get('/companies');

    expect(response.body).toEqual({
      "companies": [
        { code: "apple", name: "Apple" },
        { code: "ibm", name: "IBM" },
      ]
    });
  });
});

// Should return details about a specific company
describe('GET /apple', function () {
  test("It return company info", async function () {
    const response = await request(app).get('/companies/apple');
    
    expect(response.body).toEqual(
      {
        "company": {
          code: "apple",
          name: "Apple",
          description: "Maker of IOS",
          invoices: [1, 2],
        }
      }
    );
  });

  test("It should return a 404 if company doesn't exist", async function () {
    const response = await request(app).get('/companies/ghost');
    expect(response.status).toEqual(404);
  });
});

// Should add a new company
describe("POST /", function () {
  test("It should add a company", async function () {
    const response = await request(app)
      .post('/companies')
      .send({ name: 'Microsoft', description: 'Maker of Windows' });
    
    expect(response.body).toEqual(
      {
        "company": {
          code: "microsoft",
          name: "Microsoft",
          description: "Maker of Windows",
        }
      }
    );
  });

  test("It should return a 500 for conflict", async function () {
    const response = await request(app)
      .post('/companies')
      .send({ name: 'Apple', description: 'Another Apple' });
    
    expect(response.status).toEqual(500);
  });
});

// Update a company
describe("PUT /", function () {
  test("It should update an existing company", async function () {
    const response = await request(app)
      .put('/companies/apple')
      .send({ name: 'AppleUpdate', description: "New Apple description" });
  
    expect(response.body).toEqual(
      {
        "company": {
          code: "apple",
          name: "AppleUpdate",
          description: "New Apple description",
        }
      }
    );
  });

  test("It should return a 404 if company doesn't exist", async function () {
    const response = await request(app)
      .put('/companies/ghost')
      .send({ name: "Ghost" });
    
    expect(response.status).toEqual(404);
  });

  test("It should return 500 for missing data", async function () {
    const response = await request(app)
      .put('/companies/ibm')
      .send({});
    
    expect(response.status).toEqual(500);
  });
});

// Delete a company
describe("DELETE /", function () {
  test("It should delete a company", async function () {
    const response = await request(app)
      .delete('/companies/ibm');
    
    expect(response.body).toEqual({ "status": "Deleted" });
  });

  test("It should return a 404 if company doesn't exist", async function () {
    const response = await request(app)
      .delete('/companies/ghost');
    
    expect(response.body).toEqual(404);
  });
});
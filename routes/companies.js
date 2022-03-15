// Rotues for companies.
const express = require('express');
const ExpressError = require('../expressError');
const db = require('../db');
const slugify = require('slugify');

let router = new express.Router();

// List all companies
router.get('/', async function (req, res, next) {
  try {
    const result = await db.query(
      `SELECT code, name
      FROM companies
      ORDER BY name`
    );

    return res.json({ 'companies': result.rows });
  } catch (error) {
    return next(error);
  }
});

// Get details about a specific company based on id
router.get('/:code', async function (req, res, next) {
  try {
    let code = req.params.code;

    const companyResult = await db.query(
      `SELECT code, name, description
      FROM companies
      WHERE code = $1`,
      [code]
    );

    const invoiceResult = await db.query(
      `SELECT id
      FROM invoices
      WHERE comp_code = $1`,
      [code]
    );

    if (companyResult.rows.length === 0) {
      throw new ExpressError(`No company exist with id: ${code}`, 404)
    }

    const company = companyResult.rows[0];
    const invoices = invoiceResult.rows;

    company.invoices = invoices.map(invoice => invoice.id);

    return res.json({ 'company': company });
  } catch (error) {
    return next(error);
  }
});

// Add a new company
router.post('/', async function (req, res, next) {
  try {
    let { name, description } = req.body;
    let code = slugify(name, { lower: true });

    const result = await db.query(
      `INSERT INTO companies (code, name, description)
      VALUES ($1, $2, $3)
      RETURNING code, name, description`,
      [code, name, description]
    );

    return res.status(201).json({ 'company': result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

// Update an existing company
router.put('/:code', async function (req, res, next) {
  try {
    let { name, description } = req.body;
    let code = req.params.code;

    const result = await db.query(
      `UPDATE companies
      SET name=$1, description=$2
      WHERE code = $3
      RETURNING code, name, description`,
      [name, description, code]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`No company with id: ${code}`, 404)
    } else {
      return res.json({ 'company': result.rows[0] });
    }
  } catch (error) {
    return next(error);
  }
});

// Delete an existing company
router.delete('/:code', async function (req, res, next) {
  try {
    let code = req.params.code;
    
    const result = await db.query(
      `DELETE FROM companies
      WHERE code = $1
      RETURNING code`,
      [code]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`No company with id: ${code}`, 404)
    } else {
      return res.json({ 'status': 'Deleted' });
    }
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
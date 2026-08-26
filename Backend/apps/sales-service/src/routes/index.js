const express = require('express');
const saleController = require('../controllers/sale.controller');
const { trustGateway, authorize, validate } = require('../middlewares');
const saleValidation = require('../validations/sale.validation');

const router = express.Router();

// All routes trust the gateway for auth
router.use(trustGateway);

// POST /sales — create a new sale
router.post(
  '/',
  authorize('admin', 'superadmin', 'user'),
  validate(saleValidation.createSale),
  saleController.createSale
);

// GET /sales — list sales with filtering/pagination
router.get(
  '/',
  authorize('admin', 'superadmin', 'user'),
  validate(saleValidation.listSalesQuery, 'query'),
  saleController.listSales
);

// GET /sales/summary — sales summary (admin/superadmin only)
// MUST be before /:saleId to avoid route collision
router.get(
  '/summary',
  authorize('admin', 'superadmin'),
  validate(saleValidation.summaryQuery, 'query'),
  saleController.getSalesSummary
);

// GET /sales/:saleId — get a specific sale
router.get(
  '/:saleId',
  authorize('admin', 'superadmin', 'user'),
  saleController.getSaleById
);

module.exports = router;

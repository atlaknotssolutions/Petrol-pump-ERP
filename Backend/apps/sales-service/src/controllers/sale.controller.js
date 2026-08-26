const saleService = require('../services/sale.service');
const { catchAsync, sendResponse } = require('../utils/helpers');

const createSale = catchAsync(async (req, res) => {
  const sale = await saleService.createSale(req.body, req.user.id);
  sendResponse(res, 201, { sale }, 'Sale recorded successfully');
});

const listSales = catchAsync(async (req, res) => {
  const result = await saleService.listSales(req.query);
  sendResponse(res, 200, result);
});

const getSaleById = catchAsync(async (req, res) => {
  const sale = await saleService.getSaleById(req.params.saleId);
  sendResponse(res, 200, { sale });
});

const getSalesSummary = catchAsync(async (req, res) => {
  const summary = await saleService.getSalesSummary(req.query);
  sendResponse(res, 200, { summary });
});

module.exports = {
  createSale,
  listSales,
  getSaleById,
  getSalesSummary,
};

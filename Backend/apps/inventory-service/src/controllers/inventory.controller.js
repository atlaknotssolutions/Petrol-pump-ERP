const { catchAsync, sendResponse } = require('../utils/helpers');
const tankService = require('../services/tank.service');
const pumpService = require('../services/pump.service');
const nozzleService = require('../services/nozzle.service');
const stockService = require('../services/stock.service');

const createTank = catchAsync(async (req, res) => {
  const tank = await tankService.createTank(req.body, req.user.id);
  sendResponse(res, 201, { tank }, 'Tank created successfully');
});

const listTanks = catchAsync(async (req, res) => {
  const result = await tankService.listTanks(req.query, req.allowedBranchIds);
  sendResponse(res, 200, result);
});

const getTankById = catchAsync(async (req, res) => {
  const tank = await tankService.getTankById(req.params.tankId);
  sendResponse(res, 200, { tank });
});

const updateTank = catchAsync(async (req, res) => {
  const tank = await tankService.updateTank(req.params.tankId, req.body, req.user.id);
  sendResponse(res, 200, { tank }, 'Tank updated successfully');
});

const deleteTank = catchAsync(async (req, res) => {
  await tankService.deleteTank(req.params.tankId);
  sendResponse(res, 200, null, 'Tank deleted successfully');
});

const createPump = catchAsync(async (req, res) => {
  const pump = await pumpService.createPump(req.body, req.user.id);
  sendResponse(res, 201, { pump }, 'Pump created successfully');
});

const listPumps = catchAsync(async (req, res) => {
  const result = await pumpService.listPumps(req.query, req.allowedBranchIds);
  sendResponse(res, 200, result);
});

const getPumpById = catchAsync(async (req, res) => {
  const pump = await pumpService.getPumpById(req.params.pumpId);
  sendResponse(res, 200, { pump });
});

const updatePump = catchAsync(async (req, res) => {
  const pump = await pumpService.updatePump(req.params.pumpId, req.body, req.user.id);
  sendResponse(res, 200, { pump }, 'Pump updated successfully');
});

const deletePump = catchAsync(async (req, res) => {
  await pumpService.deletePump(req.params.pumpId);
  sendResponse(res, 200, null, 'Pump deleted successfully');
});

const createNozzle = catchAsync(async (req, res) => {
  const nozzle = await nozzleService.createNozzle(req.body, req.user.id);
  sendResponse(res, 201, { nozzle }, 'Nozzle created successfully');
});

const listNozzles = catchAsync(async (req, res) => {
  const result = await nozzleService.listNozzles(req.query, req.allowedBranchIds);
  sendResponse(res, 200, result);
});

const getNozzleById = catchAsync(async (req, res) => {
  const nozzle = await nozzleService.getNozzleById(req.params.nozzleId);
  sendResponse(res, 200, { nozzle });
});

const updateNozzle = catchAsync(async (req, res) => {
  const nozzle = await nozzleService.updateNozzle(req.params.nozzleId, req.body, req.user.id);
  sendResponse(res, 200, { nozzle }, 'Nozzle updated successfully');
});

const deleteNozzle = catchAsync(async (req, res) => {
  await nozzleService.deleteNozzle(req.params.nozzleId);
  sendResponse(res, 200, null, 'Nozzle deleted successfully');
});

const getStockLevels = catchAsync(async (req, res) => {
  const result = await stockService.getStockLevels(req.query, req.allowedBranchIds);
  sendResponse(res, 200, result);
});

const adjustStock = catchAsync(async (req, res) => {
  const result = await stockService.adjustStock(req.body, req.user.id);
  sendResponse(res, 200, result, 'Stock adjusted successfully');
});

const listMovements = catchAsync(async (req, res) => {
  const result = await stockService.listMovements(req.query, req.allowedBranchIds);
  sendResponse(res, 200, result);
});

const getSummary = catchAsync(async (req, res) => {
  const result = await stockService.getSummary(req.query, req.allowedBranchIds);
  sendResponse(res, 200, result);
});

module.exports = {
  createTank,
  listTanks,
  getTankById,
  updateTank,
  deleteTank,
  createPump,
  listPumps,
  getPumpById,
  updatePump,
  deletePump,
  createNozzle,
  listNozzles,
  getNozzleById,
  updateNozzle,
  deleteNozzle,
  getStockLevels,
  adjustStock,
  listMovements,
  getSummary,
};

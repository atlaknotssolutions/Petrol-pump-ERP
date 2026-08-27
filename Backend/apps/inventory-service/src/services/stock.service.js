const FuelStock = require('../models/fuelStock.model');
const StockMovement = require('../models/stockMovement.model');
const Tank = require('../models/tank.model');
const ApiError = require('../utils/ApiError');

const getStockLevels = async (query, allowedBranchIds) => {
  const { branchId, fuelType } = query;

  const filter = {};
  if (allowedBranchIds) {
    filter.branchId = { $in: allowedBranchIds };
  } else if (branchId) {
    filter.branchId = branchId;
  }
  if (fuelType) filter.fuelType = fuelType;

  const stocks = await FuelStock.find(filter)
    .sort({ branchId: 1, fuelType: 1 })
    .lean();

  return { stocks };
};

const adjustStock = async (payload, userId) => {
  const { branchId, fuelType, tankId, quantity, notes } = payload;

  const tank = await Tank.findById(tankId);
  if (!tank) {
    throw new ApiError(404, 'Tank not found');
  }

  if (tank.fuelType !== fuelType) {
    throw new ApiError(400, `Fuel type (${fuelType}) does not match tank fuel type (${tank.fuelType})`);
  }

  if (tank.branchId !== branchId) {
    throw new ApiError(400, 'Tank does not belong to this branch');
  }

  if (quantity === 0) {
    throw new ApiError(400, 'Quantity cannot be zero');
  }

  const fuelStock = await FuelStock.findOne({ branchId, fuelType });
  const currentQuantity = fuelStock ? fuelStock.quantity : 0;
  const newQuantity = currentQuantity + quantity;

  if (newQuantity < 0) {
    throw new ApiError(400, `Insufficient stock. Current: ${currentQuantity}, Requested deduction: ${Math.abs(quantity)}`);
  }

  if (fuelStock) {
    fuelStock.quantity = newQuantity;
    fuelStock.lastUpdated = new Date();
    await fuelStock.save();
  } else {
    await FuelStock.create({
      branchId,
      fuelType,
      quantity: newQuantity,
      lastUpdated: new Date(),
    });
  }

  const movement = await StockMovement.create({
    branchId,
    fuelType,
    tankId,
    type: 'adjustment',
    quantity,
    referenceType: 'manual',
    notes: notes || `Manual adjustment: ${quantity > 0 ? '+' : ''}${quantity}L`,
    performedBy: userId,
    runningBalance: newQuantity,
  });

  return {
    movement: movement.toJSON(),
    newStockLevel: newQuantity,
  };
};

const deductStock = async (branchId, fuelType, tankId, quantity, referenceId, userId) => {
  if (quantity <= 0) {
    throw new ApiError(400, 'Deduction quantity must be positive');
  }

  const tank = await Tank.findById(tankId);
  if (!tank) {
    throw new ApiError(404, 'Tank not found');
  }

  const fuelStock = await FuelStock.findOne({ branchId, fuelType });
  const currentQuantity = fuelStock ? fuelStock.quantity : 0;

  if (currentQuantity < quantity) {
    throw new ApiError(400, `Insufficient stock. Available: ${currentQuantity}, Requested: ${quantity}`);
  }

  const newQuantity = currentQuantity - quantity;

  if (fuelStock) {
    fuelStock.quantity = newQuantity;
    fuelStock.lastUpdated = new Date();
    await fuelStock.save();
  } else {
    await FuelStock.create({
      branchId,
      fuelType,
      quantity: newQuantity,
      lastUpdated: new Date(),
    });
  }

  const movement = await StockMovement.create({
    branchId,
    fuelType,
    tankId,
    type: 'sale',
    quantity: -quantity,
    referenceId,
    referenceType: 'sale',
    performedBy: userId,
    runningBalance: newQuantity,
  });

  return {
    movement: movement.toJSON(),
    newStockLevel: newQuantity,
  };
};

const addStock = async (branchId, fuelType, tankId, quantity, referenceId, userId) => {
  if (quantity <= 0) {
    throw new ApiError(400, 'Addition quantity must be positive');
  }

  const tank = await Tank.findById(tankId);
  if (!tank) {
    throw new ApiError(404, 'Tank not found');
  }

  const fuelStock = await FuelStock.findOne({ branchId, fuelType });
  const currentQuantity = fuelStock ? fuelStock.quantity : 0;
  const newQuantity = currentQuantity + quantity;

  if (fuelStock) {
    fuelStock.quantity = newQuantity;
    fuelStock.lastUpdated = new Date();
    await fuelStock.save();
  } else {
    await FuelStock.create({
      branchId,
      fuelType,
      quantity: newQuantity,
      lastUpdated: new Date(),
    });
  }

  const movement = await StockMovement.create({
    branchId,
    fuelType,
    tankId,
    type: 'purchase',
    quantity,
    referenceId,
    referenceType: 'purchase',
    performedBy: userId,
    runningBalance: newQuantity,
  });

  return {
    movement: movement.toJSON(),
    newStockLevel: newQuantity,
  };
};

const listMovements = async (query, allowedBranchIds) => {
  const { page = 1, limit = 20, branchId, fuelType, tankId, type, startDate, endDate } = query;

  const filter = {};
  if (allowedBranchIds) {
    filter.branchId = { $in: allowedBranchIds };
  } else if (branchId) {
    filter.branchId = branchId;
  }
  if (fuelType) filter.fuelType = fuelType;
  if (tankId) filter.tankId = tankId;
  if (type) filter.type = type;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const [movements, total] = await Promise.all([
    StockMovement.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    StockMovement.countDocuments(filter),
  ]);

  return {
    movements,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

const getSummary = async (query, allowedBranchIds) => {
  const { branchId, fuelType } = query;

  const filter = {};
  if (allowedBranchIds) {
    filter.branchId = { $in: allowedBranchIds };
  } else if (branchId) {
    filter.branchId = branchId;
  }
  if (fuelType) filter.fuelType = fuelType;

  const stocks = await FuelStock.find(filter).lean();

  const totalQuantity = stocks.reduce((sum, s) => sum + s.quantity, 0);
  const lowStockCount = stocks.filter((s) => s.minAlertLevel && s.quantity <= s.minAlertLevel).length;

  const byBranch = {};
  stocks.forEach((s) => {
    if (!byBranch[s.branchId]) {
      byBranch[s.branchId] = { branchId: s.branchId, fuels: [], totalQuantity: 0 };
    }
    byBranch[s.branchId].fuels.push({ fuelType: s.fuelType, quantity: s.quantity });
    byBranch[s.branchId].totalQuantity += s.quantity;
  });

  const byFuelType = {};
  stocks.forEach((s) => {
    if (!byFuelType[s.fuelType]) {
      byFuelType[s.fuelType] = { fuelType: s.fuelType, quantity: 0, branchCount: 0 };
    }
    byFuelType[s.fuelType].quantity += s.quantity;
    byFuelType[s.fuelType].branchCount += 1;
  });

  return {
    summary: {
      totalStock: totalQuantity,
      lowStockCount,
      branchCount: Object.keys(byBranch).length,
      fuelTypeCount: Object.keys(byFuelType).length,
      byBranch: Object.values(byBranch),
      byFuelType: Object.values(byFuelType),
    },
  };
};

module.exports = {
  getStockLevels,
  adjustStock,
  deductStock,
  addStock,
  listMovements,
  getSummary,
};

const Tank = require('../models/tank.model');
const FuelStock = require('../models/fuelStock.model');
const StockMovement = require('../models/stockMovement.model');
const ApiError = require('../utils/ApiError');

const createTank = async (payload, userId) => {
  const existing = await Tank.findOne({
    branchId: payload.branchId,
    fuelType: payload.fuelType,
  });

  if (existing) {
    throw new ApiError(409, `A tank for ${payload.fuelType} already exists in this branch`);
  }

  const tank = await Tank.create({
    ...payload,
    createdBy: userId,
  });

  if (payload.currentStock && payload.currentStock > 0) {
    const fuelStock = await FuelStock.findOne({ branchId: payload.branchId, fuelType: payload.fuelType });
    if (fuelStock) {
      fuelStock.quantity += payload.currentStock;
      fuelStock.lastUpdated = new Date();
      await fuelStock.save();
    } else {
      await FuelStock.create({
        branchId: payload.branchId,
        fuelType: payload.fuelType,
        quantity: payload.currentStock,
        lastUpdated: new Date(),
      });
    }

    await StockMovement.create({
      branchId: payload.branchId,
      fuelType: payload.fuelType,
      tankId: tank._id.toString(),
      type: 'opening',
      quantity: payload.currentStock,
      referenceType: 'system',
      notes: 'Initial stock from tank creation',
      performedBy: userId,
      runningBalance: payload.currentStock,
    });
  }

  return tank.toJSON();
};

const listTanks = async (query, allowedBranchIds) => {
  const { page = 1, limit = 20, branchId, fuelType, status } = query;

  const filter = {};
  if (allowedBranchIds) {
    filter.branchId = { $in: allowedBranchIds };
  } else if (branchId) {
    filter.branchId = branchId;
  }
  if (fuelType) filter.fuelType = fuelType;
  if (status) filter.status = status;

  const [tanks, total] = await Promise.all([
    Tank.find(filter)
      .sort({ branchId: 1, fuelType: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Tank.countDocuments(filter),
  ]);

  return {
    tanks,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

const getTankById = async (tankId) => {
  const tank = await Tank.findById(tankId).lean();
  if (!tank) {
    throw new ApiError(404, 'Tank not found');
  }
  return tank;
};

const updateTank = async (tankId, payload, userId) => {
  const tank = await Tank.findByIdAndUpdate(
    tankId,
    { ...payload, updatedBy: userId },
    { new: true, runValidators: true }
  );

  if (!tank) {
    throw new ApiError(404, 'Tank not found');
  }

  return tank.toJSON();
};

const deleteTank = async (tankId) => {
  const tank = await Tank.findById(tankId);
  if (!tank) {
    throw new ApiError(404, 'Tank not found');
  }

  const fuelStock = await FuelStock.findOne({ branchId: tank.branchId, fuelType: tank.fuelType });
  if (fuelStock && fuelStock.quantity > 0) {
    throw new ApiError(400, 'Cannot delete tank with stock greater than 0');
  }

  await Tank.findByIdAndDelete(tankId);
  if (fuelStock) {
    await FuelStock.deleteOne({ _id: fuelStock._id });
  }
  return { message: 'Tank deleted successfully' };
};

module.exports = {
  createTank,
  listTanks,
  getTankById,
  updateTank,
  deleteTank,
};

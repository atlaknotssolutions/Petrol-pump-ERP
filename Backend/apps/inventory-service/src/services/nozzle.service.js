const Nozzle = require('../models/nozzle.model');
const Pump = require('../models/pump.model');
const Tank = require('../models/tank.model');
const ApiError = require('../utils/ApiError');

const createNozzle = async (payload, userId) => {
  const pump = await Pump.findById(payload.pumpId);
  if (!pump) {
    throw new ApiError(404, 'Pump not found');
  }

  const tank = await Tank.findById(payload.tankId);
  if (!tank) {
    throw new ApiError(404, 'Tank not found');
  }

  if (tank.fuelType !== payload.fuelType) {
    throw new ApiError(400, `Nozzle fuel type (${payload.fuelType}) must match tank fuel type (${tank.fuelType})`);
  }

  const existing = await Nozzle.findOne({
    branchId: payload.branchId,
    pumpId: payload.pumpId,
    nozzleNumber: payload.nozzleNumber,
  });

  if (existing) {
    throw new ApiError(409, `Nozzle number ${payload.nozzleNumber} already exists for this pump`);
  }

  const nozzle = await Nozzle.create({
    ...payload,
    createdBy: userId,
  });

  return nozzle.toJSON();
};

const listNozzles = async (query, allowedBranchIds) => {
  const { page = 1, limit = 20, branchId, pumpId, fuelType, status } = query;

  const filter = {};
  if (allowedBranchIds) {
    filter.branchId = { $in: allowedBranchIds };
  } else if (branchId) {
    filter.branchId = branchId;
  }
  if (pumpId) filter.pumpId = pumpId;
  if (fuelType) filter.fuelType = fuelType;
  if (status) filter.status = status;

  const [nozzles, total] = await Promise.all([
    Nozzle.find(filter)
      .sort({ branchId: 1, pumpId: 1, nozzleNumber: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Nozzle.countDocuments(filter),
  ]);

  return {
    nozzles,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

const getNozzleById = async (nozzleId) => {
  const nozzle = await Nozzle.findById(nozzleId).lean();
  if (!nozzle) {
    throw new ApiError(404, 'Nozzle not found');
  }
  return nozzle;
};

const updateNozzle = async (nozzleId, payload, userId) => {
  if (payload.tankId || payload.fuelType) {
    const nozzle = await Nozzle.findById(nozzleId);
    if (!nozzle) {
      throw new ApiError(404, 'Nozzle not found');
    }

    const tankId = payload.tankId || nozzle.tankId;
    const fuelType = payload.fuelType || nozzle.fuelType;

    const tank = await Tank.findById(tankId);
    if (!tank) {
      throw new ApiError(404, 'Tank not found');
    }

    if (tank.fuelType !== fuelType) {
      throw new ApiError(400, `Nozzle fuel type (${fuelType}) must match tank fuel type (${tank.fuelType})`);
    }
  }

  const updatedNozzle = await Nozzle.findByIdAndUpdate(
    nozzleId,
    { ...payload, updatedBy: userId },
    { new: true, runValidators: true }
  );

  if (!updatedNozzle) {
    throw new ApiError(404, 'Nozzle not found');
  }

  return updatedNozzle.toJSON();
};

const deleteNozzle = async (nozzleId) => {
  const nozzle = await Nozzle.findById(nozzleId);
  if (!nozzle) {
    throw new ApiError(404, 'Nozzle not found');
  }

  await Nozzle.findByIdAndDelete(nozzleId);
  return { message: 'Nozzle deleted successfully' };
};

module.exports = {
  createNozzle,
  listNozzles,
  getNozzleById,
  updateNozzle,
  deleteNozzle,
};

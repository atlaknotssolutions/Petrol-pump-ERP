const Pump = require('../models/pump.model');
const Nozzle = require('../models/nozzle.model');
const ApiError = require('../utils/ApiError');

const createPump = async (payload, userId) => {
  const existing = await Pump.findOne({
    branchId: payload.branchId,
    pumpNumber: payload.pumpNumber,
  });

  if (existing) {
    throw new ApiError(409, `Pump number ${payload.pumpNumber} already exists in this branch`);
  }

  const pump = await Pump.create({
    ...payload,
    createdBy: userId,
  });

  return pump.toJSON();
};

const listPumps = async (query, allowedBranchIds) => {
  const { page = 1, limit = 20, branchId, status } = query;

  const filter = {};
  if (allowedBranchIds) {
    filter.branchId = { $in: allowedBranchIds };
  } else if (branchId) {
    filter.branchId = branchId;
  }
  if (status) filter.status = status;

  const [pumps, total] = await Promise.all([
    Pump.find(filter)
      .sort({ branchId: 1, pumpNumber: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Pump.countDocuments(filter),
  ]);

  return {
    pumps,
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
};

const getPumpById = async (pumpId) => {
  const pump = await Pump.findById(pumpId).lean();
  if (!pump) {
    throw new ApiError(404, 'Pump not found');
  }
  return pump;
};

const updatePump = async (pumpId, payload, userId) => {
  const pump = await Pump.findByIdAndUpdate(
    pumpId,
    { ...payload, updatedBy: userId },
    { new: true, runValidators: true }
  );

  if (!pump) {
    throw new ApiError(404, 'Pump not found');
  }

  return pump.toJSON();
};

const deletePump = async (pumpId) => {
  const pump = await Pump.findById(pumpId);
  if (!pump) {
    throw new ApiError(404, 'Pump not found');
  }

  const nozzleCount = await Nozzle.countDocuments({ pumpId });
  if (nozzleCount > 0) {
    throw new ApiError(400, 'Cannot delete pump with active nozzles');
  }

  await Pump.findByIdAndDelete(pumpId);
  return { message: 'Pump deleted successfully' };
};

module.exports = {
  createPump,
  listPumps,
  getPumpById,
  updatePump,
  deletePump,
};

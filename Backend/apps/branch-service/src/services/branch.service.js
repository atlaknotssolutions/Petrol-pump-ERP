const Branch = require('../models/branch.model');
const ApiError = require('../utils/ApiError');

async function createBranch(payload, userId) {
  const existing = await Branch.findOne({ code: payload.code.toUpperCase() });
  if (existing) {
    throw new ApiError(409, `Branch code "${payload.code}" is already in use`);
  }

  const branch = await Branch.create({ ...payload, createdBy: userId });
  return branch;
}

async function listBranches(query) {
  const { page, limit, status, city, state, search } = query;

  const filter = {};
  if (status) filter.status = status;
  if (city) filter['address.city'] = new RegExp(`^${city}$`, 'i');
  if (state) filter['address.state'] = new RegExp(`^${state}$`, 'i');
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { code: new RegExp(search, 'i') },
    ];
  }

  const [branches, total] = await Promise.all([
    Branch.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Branch.countDocuments(filter),
  ]);

  return {
    branches,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
}

async function getBranchById(branchId) {
  const branch = await Branch.findById(branchId);
  if (!branch) {
    throw new ApiError(404, 'Branch not found');
  }
  return branch;
}

async function updateBranch(branchId, payload, userId) {
  const branch = await Branch.findById(branchId);
  if (!branch) {
    throw new ApiError(404, 'Branch not found');
  }

  Object.assign(branch, payload, { updatedBy: userId });
  await branch.save();
  return branch;
}

async function assignManager(branchId, managerId, userId) {
  const branch = await Branch.findByIdAndUpdate(
    branchId,
    { managerId, updatedBy: userId },
    { new: true, runValidators: true }
  );
  if (!branch) {
    throw new ApiError(404, 'Branch not found');
  }
  return branch;
}

async function updateStatus(branchId, status, userId) {
  const branch = await Branch.findByIdAndUpdate(
    branchId,
    { status, updatedBy: userId },
    { new: true, runValidators: true }
  );
  if (!branch) {
    throw new ApiError(404, 'Branch not found');
  }
  return branch;
}

async function deleteBranch(branchId) {
  const branch = await Branch.findByIdAndDelete(branchId);
  if (!branch) {
    throw new ApiError(404, 'Branch not found');
  }
  return branch;
}

async function getBranchesByManager(managerId) {
  return Branch.find({ managerId, status: { $ne: 'inactive' } }).sort({ name: 1 });
}

module.exports = {
  createBranch,
  listBranches,
  getBranchById,
  updateBranch,
  assignManager,
  updateStatus,
  deleteBranch,
  getBranchesByManager,
};

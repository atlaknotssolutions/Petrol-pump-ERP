const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const { catchAsync } = require('../utils/helpers');
const config = require('../config');

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    managerId: { type: String, default: null, index: true },
    status: { type: String, default: 'active', index: true },
  },
  { timestamps: true, collection: 'branches', strict: false }
);

let branchConn = null;
let BranchModel = null;

async function getBranchConnection() {
  if (branchConn && branchConn.readyState === 1) {
    return BranchModel;
  }

  const uri = config.branchMongoUri;
  if (!uri) {
    throw new ApiError(500, 'BRANCH_MONGO_URI is required when BRANCH_ISOLATION_ENABLED=true');
  }

  branchConn = mongoose.createConnection(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  await branchConn.asPromise();

  BranchModel = branchConn.model('Branch', branchSchema);
  return BranchModel;
}

async function getPermittedBranchIds(userId, role) {
  if (role === 'superadmin' || role === 'admin') {
    return null;
  }
  const Model = await getBranchConnection();
  const docs = await Model.find({ managerId: userId, status: { $ne: 'inactive' } })
    .select('_id')
    .lean();
  return docs.map((d) => d._id.toString());
}

function branchScope() {
  return catchAsync(async (req, _res, next) => {
    if (!config.branchIsolationEnabled) {
      return next();
    }

    const userRole = req.user.role;

    if (userRole === 'superadmin' || userRole === 'admin') {
      req.allowedBranchIds = null;
      return next();
    }

    const permittedIds = await getPermittedBranchIds(req.user.id, userRole);

    if (!permittedIds || permittedIds.length === 0) {
      req.allowedBranchIds = [];
      return next();
    }

    req.allowedBranchIds = permittedIds;

    const branchId = req.body.branchId || req.query.branchId;
    if (branchId && !permittedIds.includes(branchId)) {
      throw new ApiError(403, 'You do not have access to this branch');
    }

    next();
  });
}

function applyBranchFilter(filter, req) {
  if (config.branchIsolationEnabled && req.allowedBranchIds) {
    filter.branchId = { $in: req.allowedBranchIds };
  }
  return filter;
}

module.exports = { branchScope, applyBranchFilter };

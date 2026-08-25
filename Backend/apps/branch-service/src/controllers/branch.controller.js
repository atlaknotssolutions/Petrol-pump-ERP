const branchService = require('../services/branch.service');
const { catchAsync, sendResponse } = require('../utils/helpers');

const createBranch = catchAsync(async (req, res) => {
  const branch = await branchService.createBranch(req.body, req.user.id);
  sendResponse(res, 201, { branch }, 'Branch created successfully');
});

const listBranches = catchAsync(async (req, res) => {
  const result = await branchService.listBranches(req.query);
  sendResponse(res, 200, result);
});

const getBranch = catchAsync(async (req, res) => {
  const branch = await branchService.getBranchById(req.params.branchId);
  sendResponse(res, 200, { branch });
});

const updateBranch = catchAsync(async (req, res) => {
  const branch = await branchService.updateBranch(req.params.branchId, req.body, req.user.id);
  sendResponse(res, 200, { branch }, 'Branch updated successfully');
});

const assignManager = catchAsync(async (req, res) => {
  const branch = await branchService.assignManager(
    req.params.branchId,
    req.body.managerId,
    req.user.id
  );
  sendResponse(res, 200, { branch }, 'Manager assigned successfully');
});

const updateStatus = catchAsync(async (req, res) => {
  const branch = await branchService.updateStatus(req.params.branchId, req.body.status, req.user.id);
  sendResponse(res, 200, { branch }, 'Branch status updated successfully');
});

const deleteBranch = catchAsync(async (req, res) => {
  await branchService.deleteBranch(req.params.branchId);
  sendResponse(res, 200, null, 'Branch deleted successfully');
});

const getMyBranches = catchAsync(async (req, res) => {
  const branches = await branchService.getBranchesByManager(req.user.id);
  sendResponse(res, 200, { branches });
});

module.exports = {
  createBranch,
  listBranches,
  getBranch,
  updateBranch,
  assignManager,
  updateStatus,
  deleteBranch,
  getMyBranches,
};

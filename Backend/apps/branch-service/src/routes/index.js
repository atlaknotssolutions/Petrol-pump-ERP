const express = require('express');
const branchController = require('../controllers/branch.controller');
const branchValidation = require('../validations/branch.validation');
const { trustGateway, authorize, validate } = require('../middlewares');

const router = express.Router();


router.use(trustGateway);

router.get(
  '/',
  validate(branchValidation.listQuery, 'query'),
  branchController.listBranches
);

router.get('/my', authorize('branch_manager', 'admin', 'superadmin'), branchController.getMyBranches);

router.post(
  '/',
  authorize('admin', 'superadmin'),
  validate(branchValidation.createBranch),
  branchController.createBranch
);

router.get('/:branchId', branchController.getBranch);

router.patch(
  '/:branchId',
  authorize('admin', 'superadmin'),
  validate(branchValidation.updateBranch),
  branchController.updateBranch
);

router.patch(
  '/:branchId/assign-manager',
  authorize('admin', 'superadmin'),
  validate(branchValidation.assignManager),
  branchController.assignManager
);

router.patch(
  '/:branchId/status',
  authorize('admin', 'superadmin'),
  validate(branchValidation.updateStatus),
  branchController.updateStatus
);

router.delete(
  '/:branchId',
  authorize('superadmin'),
  branchController.deleteBranch
);

module.exports = router;

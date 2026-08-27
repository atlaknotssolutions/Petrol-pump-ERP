const express = require('express');
const { trustGateway, authorize, validate, branchScope } = require('../middlewares');
const inventoryValidation = require('../validations/inventory.validation');
const inventoryController = require('../controllers/inventory.controller');

const router = express.Router();

router.use(trustGateway);
router.use(branchScope());

// Summary (before /:param routes)
router.get(
  '/summary',
  authorize('admin', 'superadmin'),
  validate(inventoryValidation.summaryQuery, 'query'),
  inventoryController.getSummary
);

// Stock movements (before /stock)
router.get(
  '/stock/movements',
  validate(inventoryValidation.stockMovementsQuery, 'query'),
  inventoryController.listMovements
);

// Stock adjust
router.post(
  '/stock/adjust',
  authorize('admin', 'superadmin'),
  validate(inventoryValidation.adjustStock),
  inventoryController.adjustStock
);

// Stock levels
router.get(
  '/stock',
  validate(inventoryValidation.stockQuery, 'query'),
  inventoryController.getStockLevels
);

// Tanks
router.post(
  '/tanks',
  authorize('admin', 'superadmin'),
  validate(inventoryValidation.createTank),
  inventoryController.createTank
);

router.get(
  '/tanks',
  validate(inventoryValidation.listTanksQuery, 'query'),
  inventoryController.listTanks
);

router.get(
  '/tanks/:tankId',
  inventoryController.getTankById
);

router.patch(
  '/tanks/:tankId',
  authorize('admin', 'superadmin'),
  validate(inventoryValidation.updateTank),
  inventoryController.updateTank
);

router.delete(
  '/tanks/:tankId',
  authorize('superadmin'),
  inventoryController.deleteTank
);

// Pumps
router.post(
  '/pumps',
  authorize('admin', 'superadmin'),
  validate(inventoryValidation.createPump),
  inventoryController.createPump
);

router.get(
  '/pumps',
  validate(inventoryValidation.listPumpsQuery, 'query'),
  inventoryController.listPumps
);

router.get(
  '/pumps/:pumpId',
  inventoryController.getPumpById
);

router.patch(
  '/pumps/:pumpId',
  authorize('admin', 'superadmin'),
  validate(inventoryValidation.updatePump),
  inventoryController.updatePump
);

router.delete(
  '/pumps/:pumpId',
  authorize('superadmin'),
  inventoryController.deletePump
);

// Nozzles
router.post(
  '/nozzles',
  authorize('admin', 'superadmin'),
  validate(inventoryValidation.createNozzle),
  inventoryController.createNozzle
);

router.get(
  '/nozzles',
  validate(inventoryValidation.listNozzlesQuery, 'query'),
  inventoryController.listNozzles
);

router.get(
  '/nozzles/:nozzleId',
  inventoryController.getNozzleById
);

router.patch(
  '/nozzles/:nozzleId',
  authorize('admin', 'superadmin'),
  validate(inventoryValidation.updateNozzle),
  inventoryController.updateNozzle
);

router.delete(
  '/nozzles/:nozzleId',
  authorize('superadmin'),
  inventoryController.deleteNozzle
);

module.exports = router;

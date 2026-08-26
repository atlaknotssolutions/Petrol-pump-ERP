const Sale = require('../models/sale.model');
const ApiError = require('../utils/ApiError');

/**
 * Calculate sale values server-side.
 * Quantity sold = closing - opening
 * Fuel amount   = quantity × rate (rounded to 2 decimal places)
 * Total amount  = fuel amount (Phase 1: no taxes)
 */
function calculateSale(payload) {
  const quantitySold = Number((payload.closingReading - payload.openingReading).toFixed(2));
  const fuelAmount = Math.round(quantitySold * payload.fuelRatePerLitre * 100) / 100;
  const totalAmount = fuelAmount;

  return { quantitySold, fuelAmount, totalAmount };
}

async function createSale(payload, userId) {
  const { quantitySold, fuelAmount, totalAmount } = calculateSale(payload);

  if (quantitySold <= 0) {
    throw new ApiError(400, 'Quantity sold must be greater than 0. Closing reading must be greater than opening reading.');
  }

  const sale = await Sale.create({
    branchId: payload.branchId,
    fuelType: payload.fuelType,
    nozzleId: payload.nozzleId,
    openingReading: payload.openingReading,
    closingReading: payload.closingReading,
    quantitySold,
    fuelRatePerLitre: payload.fuelRatePerLitre,
    fuelAmount,
    paymentMethod: payload.paymentMethod,
    totalAmount,
    paymentReference: payload.paymentReference || null,
    notes: payload.notes || null,
    operatorId: userId,
    operatorName: null,
    saleDate: payload.saleDate || new Date(),
    createdBy: userId,
  });

  return sale;
}

async function listSales(query) {
  const {
    page,
    limit,
    branchId,
    fuelType,
    paymentMethod,
    operatorId,
    nozzleId,
    startDate,
    endDate,
  } = query;

  const filter = {};

  if (branchId) filter.branchId = branchId;
  if (fuelType) filter.fuelType = fuelType;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (operatorId) filter.operatorId = operatorId;
  if (nozzleId) filter.nozzleId = nozzleId;

  if (startDate || endDate) {
    filter.saleDate = {};
    if (startDate) filter.saleDate.$gte = new Date(startDate);
    if (endDate) filter.saleDate.$lte = new Date(endDate);
  }

  const [sales, total] = await Promise.all([
    Sale.find(filter)
      .sort({ saleDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Sale.countDocuments(filter),
  ]);

  return {
    sales,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
}

async function getSaleById(saleId) {
  const sale = await Sale.findById(saleId);
  if (!sale) {
    throw new ApiError(404, 'Sale not found');
  }
  return sale;
}

async function getSalesSummary(query) {
  const { branchId, fuelType, startDate, endDate } = query;

  const matchStage = {};

  if (branchId) matchStage.branchId = branchId;
  if (fuelType) matchStage.fuelType = fuelType;
  if (startDate || endDate) {
    matchStage.saleDate = {};
    if (startDate) matchStage.saleDate.$gte = new Date(startDate);
    if (endDate) matchStage.saleDate.$lte = new Date(endDate);
  }

  const [overall, byFuelType, byPaymentMethod] = await Promise.all([
    // Overall totals
    Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalQuantitySold: { $sum: '$quantitySold' },
          totalFuelAmount: { $sum: '$fuelAmount' },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]),
    // Breakdown by fuel type
    Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$fuelType',
          count: { $sum: 1 },
          quantity: { $sum: '$quantitySold' },
          amount: { $sum: '$fuelAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    // Breakdown by payment method
    Sale.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          amount: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const totals = overall[0] || {
    totalSales: 0,
    totalQuantitySold: 0,
    totalFuelAmount: 0,
    totalAmount: 0,
  };

  return {
    totalSales: totals.totalSales,
    totalQuantitySold: Math.round(totals.totalQuantitySold * 100) / 100,
    totalFuelAmount: Math.round(totals.totalFuelAmount * 100) / 100,
    totalAmount: Math.round(totals.totalAmount * 100) / 100,
    byFuelType: byFuelType.map((item) => ({
      fuelType: item._id,
      count: item.count,
      quantity: Math.round(item.quantity * 100) / 100,
      amount: Math.round(item.amount * 100) / 100,
    })),
    byPaymentMethod: byPaymentMethod.map((item) => ({
      paymentMethod: item._id,
      count: item.count,
      amount: Math.round(item.amount * 100) / 100,
    })),
  };
}

module.exports = {
  createSale,
  listSales,
  getSaleById,
  getSalesSummary,
};

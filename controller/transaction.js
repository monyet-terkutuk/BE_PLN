const express = require('express');
const router = express.Router();
const Transaction = require('../model/Transaction');
const TransactionType = require('../model/TransactionType');
const { isAuthenticated } = require('../middleware/auth');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');
const Validator = require('fastest-validator');
const v = new Validator();

// Create transaction
router.post(
  '/',
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const transactionSchema = {
      mid: { type: 'string', empty: false },
      tid: { type: 'string', optional: true },
      transaction_type: { type: 'string', empty: false },
      batch: { type: 'string', optional: true },
      amount: { type: 'number', min: 0 },
      net_amount: { type: 'number', min: 0 },
      mdr: { type: 'number', min: 0, optional: true },
      status: { type: 'string', empty: false },
      date: { type: 'date', optional: true },
      difference: { type: 'number', optional: true },
    };

    const { body } = req;
    const validationResponse = v.validate(body, transactionSchema);

    if (validationResponse !== true) {
      return res.status(400).json({
        code: 400,
        status: 'error',
        data: {
          error: 'Validation failed',
          details: validationResponse,
        },
      });
    }

    try {
      const transactionType = await TransactionType.findById(body.transaction_type);
      if (!transactionType) {
        return res.status(404).json({
          code: 404,
          status: 'error',
          data: { error: 'Transaction type not found' },
        });
      }

      const transaction = await Transaction.create(body);
      res.status(201).json({
        code: 201,
        status: 'success',
        data: transaction,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get all transactions
router.get(
  '/list',
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const transactions = await Transaction.find()
        .populate('transaction_type')
        .sort({ createdAt: -1 });

      res.status(200).json({
        meta: {
          message: 'Transactions retrieved successfully',
          code: 200,
          status: 'success',
        },
        data: transactions,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get transaction by ID
router.get(
  '/:id',
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const transaction = await Transaction.findById(req.params.id).populate('transaction_type');
      if (!transaction) {
        return res.status(404).json({
          code: 404,
          message: 'Transaction not found',
          data: null,
        });
      }
      res.status(200).json({
        code: 200,
        message: 'Transaction retrieved successfully',
        data: transaction,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Delete transaction
router.delete(
  '/delete/:id',
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const transaction = await Transaction.findByIdAndDelete(req.params.id);
      if (!transaction) {
        return res.status(404).json({
          code: 404,
          message: 'Transaction not found',
          data: null,
        });
      }
      res.status(200).json({
        code: 200,
        message: 'Transaction deleted successfully',
        data: null,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;

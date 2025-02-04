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
      date: { type: 'string', optional: true },
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

// Update transaction
router.put(
  '/:id',
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const transactionSchema = {
      mid: { type: 'string', empty: false, optional: true },
      tid: { type: 'string', optional: true },
      transaction_type: { type: 'string', empty: false, optional: true },
      batch: { type: 'string', optional: true },
      amount: { type: 'number', min: 0, optional: true },
      net_amount: { type: 'number', min: 0, optional: true },
      mdr: { type: 'number', min: 0, optional: true },
      status: { type: 'string', empty: false, optional: true },
      date: { type: 'string', optional: true },
      difference: { type: 'number', optional: true },
    };

    const { body } = req;
    const transactionId = req.params.id;

    // Validasi input
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
      // Cari transaksi berdasarkan ID
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        return res.status(404).json({
          code: 404,
          status: 'error',
          data: { error: 'Transaction not found' },
        });
      }

      // Jika transaction_type diubah, pastikan valid
      if (body.transaction_type) {
        const transactionType = await TransactionType.findById(body.transaction_type);
        if (!transactionType) {
          return res.status(404).json({
            code: 404,
            status: 'error',
            data: { error: 'Transaction type not found' },
          });
        }
      }

      // Update transaksi
      const updatedTransaction = await Transaction.findByIdAndUpdate(transactionId, body, {
        new: true, // Mengembalikan data yang telah diperbarui
        runValidators: true, // Pastikan validasi tetap dijalankan
      });

      res.status(200).json({
        code: 200,
        status: 'success',
        data: updatedTransaction,
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

      const formattedTransactions = transactions.map((transaction) => ({
        ...transaction.toObject(),
        transaction_type: transaction.transaction_type
          ? {
            id: transaction.transaction_type._id,
            name: `${transaction.transaction_type.name} (${transaction.transaction_type.type1} & ${transaction.transaction_type.type2})`,
            bank: transaction.transaction_type.name,
          }
          : null,
      }));

      res.status(200).json({
        meta: {
          message: 'Transactions retrieved successfully',
          code: 200,
          status: 'success',
        },
        data: formattedTransactions,
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

      const formattedTransaction = {
        ...transaction.toObject(),
        transaction_type: transaction.transaction_type
          ? {
            id: transaction.transaction_type._id,
            name: `${transaction.transaction_type.name} (${transaction.transaction_type.type1} & ${transaction.transaction_type.type2})`,
            bank: transaction.transaction_type.name,
          }
          : null,
      };

      res.status(200).json({
        code: 200,
        message: 'Transaction retrieved successfully',
        data: formattedTransaction,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Delete transaction
router.delete(
  '/:id',
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

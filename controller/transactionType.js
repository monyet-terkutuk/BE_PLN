const express = require('express');
const router = express.Router();
const TransactionType = require('../model/TransactionType'); // Sesuaikan path sesuai struktur proyek
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');
const Validator = require('fastest-validator');
const v = new Validator();

// Create Transaction Type
router.post(
  '',
  catchAsyncErrors(async (req, res, next) => {
    const transactionTypeSchema = {
      name: { type: 'string', min: 3, empty: false },
      type1: { type: 'string', optional: true },
      type2: { type: 'string', optional: true },
    };

    const { body } = req;

    // Validate input data
    const validationResponse = v.validate(body, transactionTypeSchema);

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
      // Create new transaction type
      const transactionType = await TransactionType.create(body);
      return res.status(201).json({
        code: 201,
        status: 'success',
        data: transactionType,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get All Transaction Types
router.get(
  '/list',
  catchAsyncErrors(async (req, res, next) => {
    try {
      const transactionTypes = await TransactionType.find().sort({ createdAt: -1 });

      const formattedData = transactionTypes.map((type) => {
        let formattedName = type.name;
        if (type.type1 && type.type2) {
          formattedName += ` (${type.type1} & ${type.type2})`;
        } else if (type.type1) {
          formattedName += ` (${type.type1})`;
        } else if (type.type2) {
          formattedName += ` (${type.type2})`;
        }

        return {
          id: type._id,
          name: formattedName,
          bank: type.name,
        };
      });

      return res.status(200).json({
        code: 200,
        status: 'success',
        data: formattedData,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


// Get Transaction Type by ID
router.get(
  '/:id',
  catchAsyncErrors(async (req, res, next) => {
    const transactionTypeId = req.params.id;

    try {
      const transactionType = await TransactionType.findById(transactionTypeId);

      if (!transactionType) {
        return res.status(404).json({
          code: 404,
          status: 'error',
          message: 'Transaction Type not found',
        });
      }

      return res.status(200).json({
        code: 200,
        status: 'success',
        data: transactionType,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Update Transaction Type
router.put(
  '/:id',
  catchAsyncErrors(async (req, res, next) => {
    const transactionTypeId = req.params.id;
    const transactionTypeSchema = {
      name: { type: 'string', min: 3, empty: false },
      type1: { type: 'string', optional: true },
      type2: { type: 'string', optional: true },
    };

    const { body } = req;

    // Validate input data
    const validationResponse = v.validate(body, transactionTypeSchema);

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
      const transactionType = await TransactionType.findByIdAndUpdate(transactionTypeId, body, { new: true, runValidators: true });

      if (!transactionType) {
        return res.status(404).json({
          code: 404,
          status: 'error',
          message: 'Transaction Type not found',
        });
      }

      return res.status(200).json({
        code: 200,
        status: 'success',
        data: transactionType,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Delete Transaction Type
router.delete(
  '/:id',
  catchAsyncErrors(async (req, res, next) => {
    const transactionTypeId = req.params.id;

    try {
      const transactionType = await TransactionType.findById(transactionTypeId);

      if (!transactionType) {
        return res.status(404).json({
          code: 404,
          status: 'error',
          message: 'Transaction Type not found',
        });
      }

      // Delete transaction type
      await TransactionType.findByIdAndDelete(transactionTypeId);

      return res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Transaction Type deleted successfully',
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;

const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const TransactionSchema = new Schema(
  {
    mid: {
      type: String,
      required: true,
    },
    tid: {
      type: String,
    },
    transaction_type: {
      type: Schema.Types.ObjectId,
      ref: 'TransactionType',
    },
    batch: {
      type: String,
    },
    amount: {
      type: Number,
    },
    net_amount: {
      type: Number,
    },
    mdr: {
      type: Number,
    },
    status: {
      type: String,
    },
    date: {
      type: Date,
    },
    difference: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = model('Transaction', TransactionSchema);

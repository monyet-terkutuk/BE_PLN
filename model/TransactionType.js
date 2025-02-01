const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const transactionType = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type1: {
      type: String,
      required: false,
    },
    type2: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);


module.exports = model('TransactionType', transactionType);

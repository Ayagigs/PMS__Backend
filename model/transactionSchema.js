import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  // receiver: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Employee",
  //   required: true,
  // },
  amount: {
    type: Number,
    required: true,
  },
  senderAddress: {
    type: String,
  },
  receiverAddress: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;

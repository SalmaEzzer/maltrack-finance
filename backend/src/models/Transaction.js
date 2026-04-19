const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet", required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },

    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    date: { type: Date, default: Date.now },

    description: { type: String, trim: true },
    kind: {
      type: String,
      enum: ["manual", "transfer", "goal_funding"],
      default: "manual",
      index: true,
    },
    transferId: { type: String, index: true },
    relatedGoalId: { type: mongoose.Schema.Types.ObjectId, ref: "Goal" },
    isAnomaly: { type: Boolean, default: false },
    attachmentUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);

const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["cash", "bank", "card"], default: "bank" },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: "MAD" },
    color: { type: String, default: "#6D28D9" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wallet", walletSchema);

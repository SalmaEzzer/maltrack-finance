const mongoose = require("mongoose");

const GoalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet", default: null },

    name: { type: String, required: true, trim: true },
    targetAmount: { type: Number, required: true, min: 0 },
    currentAmount: { type: Number, default: 0, min: 0 },

    color: { type: String, default: "#A855F7" }, // violet
    icon: { type: String, default: "target" },  // optionnel (lucide name)
    dueDate: { type: Date, default: null },     // optionnel

    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Goal", GoalSchema);

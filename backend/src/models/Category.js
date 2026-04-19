const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    systemKey: {
      type: String,
      enum: [
        "transfer_expense",
        "transfer_income",
        "goal_funding",
        null,
      ],
      default: null,
    },
    icon: { type: String },
    color: { type: String, default: "#9333EA" },
    budgetLimit: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);

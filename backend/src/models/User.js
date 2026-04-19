const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String },
    currency: { type: String, default: "MAD" },
    language: { type: String, default: "fr" },
    notificationPreferences: {
      transactions: { type: Boolean, default: true },
      anomalies: { type: Boolean, default: true },
      goals: { type: Boolean, default: true },
      monthly: { type: Boolean, default: false },
    },
    securityPreferences: {
      twoFactorEnabled: { type: Boolean, default: false },
    },
    appearancePreferences: {
      darkTheme: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

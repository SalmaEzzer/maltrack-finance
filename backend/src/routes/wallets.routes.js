const express = require("express");
const auth = require("../middlewares/auth");
const Goal = require("../models/Goal");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");

const router = express.Router();

// GET /api/wallets
router.get("/", auth, async (req, res) => {
  const wallets = await Wallet.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ wallets });
});

// GET /api/wallets/:id
router.get("/:id", auth, async (req, res) => {
  const wallet = await Wallet.findOne({ _id: req.params.id, userId: req.userId });
  if (!wallet) return res.status(404).json({ message: "Wallet introuvable" });

  res.json({ wallet });
});

// POST /api/wallets
router.post("/", auth, async (req, res) => {
  const { name, type, balance, currency, color, isDefault } = req.body;
  if (!name) return res.status(400).json({ message: "name est requis" });

  if (isDefault === true) {
    await Wallet.updateMany({ userId: req.userId }, { $set: { isDefault: false } });
  }

  const wallet = await Wallet.create({
    userId: req.userId,
    name,
    type,
    balance: Number(balance || 0),
    currency: currency || "MAD",
    color: color || "#6D28D9",
    isDefault: isDefault ?? false,
  });

  res.status(201).json({ wallet });
});

// PUT /api/wallets/:id
router.put("/:id", auth, async (req, res) => {
  const { id } = req.params;

  const wallet = await Wallet.findOne({ _id: id, userId: req.userId });
  if (!wallet) return res.status(404).json({ message: "Wallet introuvable" });

  if (req.body.isDefault === true) {
    await Wallet.updateMany({ userId: req.userId }, { $set: { isDefault: false } });
  }

  const allowed = ["name", "type", "currency", "color", "isDefault"];
  for (const key of allowed) {
    if (req.body[key] !== undefined) wallet[key] = req.body[key];
  }
  await wallet.save();

  res.json({ wallet });
});

// DELETE /api/wallets/:id
router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;

  const [transactionCount, goalCount] = await Promise.all([
    Transaction.countDocuments({ userId: req.userId, walletId: id }),
    Goal.countDocuments({ userId: req.userId, walletId: id, archived: false }),
  ]);

  if (transactionCount > 0 || goalCount > 0) {
    return res.status(409).json({
      message: "Impossible de supprimer ce wallet: il contient des transactions ou des objectifs liés",
    });
  }

  const deleted = await Wallet.findOneAndDelete({ _id: id, userId: req.userId });
  if (!deleted) return res.status(404).json({ message: "Wallet introuvable" });

  res.json({ message: "Wallet supprimé" });
});

module.exports = router;

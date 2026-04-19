const express = require("express");
const auth = require("../middlewares/auth");
const Transaction = require("../models/Transaction");
const { createManualTransaction, deleteTransaction } = require("../services/money.service");

const router = express.Router();

// GET /api/transactions?month=&year=&type=&walletId=&categoryId=
router.get("/", auth, async (req, res) => {
  const { month, year, type, walletId, categoryId } = req.query;

  const filter = { userId: req.userId };
  if (type) filter.type = type;
  if (walletId) filter.walletId = walletId;
  if (categoryId) filter.categoryId = categoryId;

  if (month && year) {
    const m = Number(month) - 1;
    const y = Number(year);
    const start = new Date(Date.UTC(y, m, 1, 0, 0, 0));
    const end = new Date(Date.UTC(y, m + 1, 1, 0, 0, 0));
    filter.date = { $gte: start, $lt: end };
  }

  const transactions = await Transaction.find(filter)
    .populate("walletId", "name type currency")
    .populate("categoryId", "name type icon color systemKey")
    .populate("relatedGoalId", "name")
    .sort({ date: -1, createdAt: -1 });

  res.json({ transactions });
});

// POST /api/transactions
router.post("/", auth, async (req, res) => {
  try {
    const result = await createManualTransaction(req.userId, req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Erreur serveur" });
  }
});

// DELETE /api/transactions/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const result = await deleteTransaction(req.userId, req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Erreur serveur" });
  }
});

module.exports = router;

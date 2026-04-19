const express = require("express");
const auth = require("../middlewares/auth");
const Goal = require("../models/Goal");
const Wallet = require("../models/Wallet");
const { fundGoal } = require("../services/money.service");

const router = express.Router();

// GET /api/goals
router.get("/", auth, async (req, res) => {
  const goals = await Goal.find({ userId: req.userId, archived: false })
    .populate("walletId", "name type balance currency color")
    .sort({ createdAt: -1 });
  res.json({ goals });
});

// POST /api/goals
router.post("/", auth, async (req, res) => {
  const { name, targetAmount, walletId, color, icon, dueDate } = req.body;

  if (!name || Number(targetAmount) <= 0 || !walletId) {
    return res.status(400).json({ message: "name, targetAmount et walletId sont requis" });
  }

  const wallet = await Wallet.findOne({ _id: walletId, userId: req.userId });
  if (!wallet) return res.status(404).json({ message: "Wallet introuvable" });

  const goal = await Goal.create({
    userId: req.userId,
    walletId,
    name,
    targetAmount: Number(targetAmount),
    currentAmount: 0,
    color: color || "#A855F7",
    icon: icon || "target",
    dueDate: dueDate ? new Date(dueDate) : null,
  });

  res.status(201).json({ goal });
});

// PATCH /api/goals/:id/fund  (ajouter des fonds)
router.patch("/:id/fund", auth, async (req, res) => {
  try {
    const result = await fundGoal(req.userId, req.params.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Erreur serveur" });
  }
});

// DELETE /api/goals/:id
router.delete("/:id", auth, async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
  if (!goal) return res.status(404).json({ message: "Objectif introuvable" });

  if (Number(goal.currentAmount || 0) > 0) {
    return res.status(409).json({
      message: "Impossible de supprimer un objectif déjà financé sans retirer ses fonds",
    });
  }

  await goal.deleteOne();
  res.json({ message: "Objectif supprimé" });
});

module.exports = router;


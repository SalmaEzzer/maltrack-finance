const express = require("express");
const auth = require("../middlewares/auth");
const { createTransfer } = require("../services/money.service");

const router = express.Router();

// POST /api/transfers
router.post("/", auth, async (req, res) => {
  try {
    const result = await createTransfer(req.userId, req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Erreur serveur" });
  }
});

module.exports = router;

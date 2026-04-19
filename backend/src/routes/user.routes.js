const express = require("express");
const bcrypt = require("bcryptjs");
const auth = require("../middlewares/auth");
const User = require("../models/User");

const router = express.Router();

// GET /api/me  (route protégée)
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.userId).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
  res.json({ user });
});

// PATCH /api/me
router.patch("/me", auth, async (req, res) => {
  const allowed = ["firstName", "lastName", "avatarUrl", "currency", "language"];
  const updates = {};

  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const user = await User.findByIdAndUpdate(req.userId, updates, {
    new: true,
    runValidators: true,
  }).select("-passwordHash");

  if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
  res.json({ user });
});

// PATCH /api/me/notifications
router.patch("/me/notifications", auth, async (req, res) => {
  const allowed = ["transactions", "anomalies", "goals", "monthly"];
  const updates = {};

  for (const key of allowed) {
    if (typeof req.body[key] === "boolean") {
      updates[`notificationPreferences.${key}`] = req.body[key];
    }
  }

  const user = await User.findByIdAndUpdate(req.userId, { $set: updates }, {
    new: true,
    runValidators: true,
  }).select("-passwordHash");

  if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
  res.json({ notifications: user.notificationPreferences, user });
});

// PATCH /api/me/security
router.patch("/me/security", auth, async (req, res) => {
  const { twoFactorEnabled } = req.body;
  if (typeof twoFactorEnabled !== "boolean") {
    return res.status(400).json({ message: "Valeur twoFactorEnabled invalide" });
  }

  const user = await User.findByIdAndUpdate(
    req.userId,
    { $set: { "securityPreferences.twoFactorEnabled": twoFactorEnabled } },
    { new: true, runValidators: true }
  ).select("-passwordHash");

  if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
  res.json({ security: user.securityPreferences, user });
});

// PATCH /api/me/appearance
router.patch("/me/appearance", auth, async (req, res) => {
  const { darkTheme } = req.body;
  if (typeof darkTheme !== "boolean") {
    return res.status(400).json({ message: "Valeur darkTheme invalide" });
  }

  const user = await User.findByIdAndUpdate(
    req.userId,
    { $set: { "appearancePreferences.darkTheme": darkTheme } },
    { new: true, runValidators: true }
  ).select("-passwordHash");

  if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
  res.json({ appearance: user.appearancePreferences, user });
});

// PATCH /api/me/password
router.patch("/me/password", auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Mot de passe actuel et nouveau mot de passe requis" });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Mot de passe trop court (min 6)" });
  }

  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Mot de passe actuel incorrect" });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Mot de passe mis à jour" });
});

module.exports = router;

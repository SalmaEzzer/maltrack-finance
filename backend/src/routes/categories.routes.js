const express = require("express");
const auth = require("../middlewares/auth");
const Category = require("../models/Category");
const { seedDefaultCategories } = require("../utils/seedDefaultCategories");

const router = express.Router();

// GET /api/categories
router.get("/", auth, async (req, res) => {
  await seedDefaultCategories(req.userId);

  const categories = await Category.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ categories });
});

// POST /api/categories
router.post("/", auth, async (req, res) => {
  const { name, type, icon, color, budgetLimit } = req.body;

  if (!name || !["income", "expense"].includes(type)) {
    return res.status(400).json({ message: "name et type valide sont requis" });
  }

  const category = await Category.create({
    userId: req.userId,
    name,
    type,
    icon,
    color,
    budgetLimit,
  });

  res.status(201).json({ category });
});

// PUT /api/categories/:id
router.put("/:id", auth, async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, userId: req.userId });
  if (!category) return res.status(404).json({ message: "Catégorie introuvable" });
  if (category.systemKey) return res.status(403).json({ message: "Catégorie système non modifiable" });

  const allowed = ["name", "type", "icon", "color", "budgetLimit"];
  for (const key of allowed) {
    if (req.body[key] !== undefined) category[key] = req.body[key];
  }

  if (!category.name || !["income", "expense"].includes(category.type)) {
    return res.status(400).json({ message: "name et type valide sont requis" });
  }

  await category.save();
  res.json({ category });
});

// DELETE /api/categories/:id
router.delete("/:id", auth, async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, userId: req.userId });
  if (!category) return res.status(404).json({ message: "Catégorie introuvable" });
  if (category.systemKey) return res.status(403).json({ message: "Catégorie système non supprimable" });

  await category.deleteOne();
  res.json({ message: "Catégorie supprimée" });
});

module.exports = router;

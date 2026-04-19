const Category = require("../models/Category");

async function seedDefaultCategories(userId) {
  const defaults = [
    { name: "Alimentation", type: "expense", icon: "shopping-cart", color: "#22C55E" },
    { name: "Transport", type: "expense", icon: "bus", color: "#3B82F6" },
    { name: "Shopping", type: "expense", icon: "bag", color: "#F59E0B" },
    { name: "Loyer", type: "expense", icon: "home", color: "#A855F7" },
    { name: "Salaire", type: "income", icon: "briefcase", color: "#10B981" },
    { name: "Freelance", type: "income", icon: "laptop", color: "#06B6D4" },
    { name: "Transfert dépense", type: "expense", icon: "arrow-right-left", color: "#94A3B8", systemKey: "transfer_expense" },
    { name: "Transfert revenu", type: "income", icon: "arrow-right-left", color: "#94A3B8", systemKey: "transfer_income" },
    { name: "Objectif / Épargne", type: "expense", icon: "target", color: "#A855F7", systemKey: "goal_funding" },
  ];

  await Promise.all(
    defaults
      .filter((item) => item.systemKey)
      .map((item) =>
        Category.updateOne(
          { userId, type: item.type, name: item.name, systemKey: { $in: [null, undefined] } },
          { $set: { systemKey: item.systemKey } }
        )
      )
  );

  const existing = await Category.find({ userId }).select("name type systemKey");
  const existingSet = new Set(
    existing.map((category) =>
      category.systemKey ? `system::${category.systemKey}` : `${category.type}::${category.name}`
    )
  );

  const missing = defaults.filter((item) => {
    const key = item.systemKey ? `system::${item.systemKey}` : `${item.type}::${item.name}`;
    return !existingSet.has(key);
  });

  if (missing.length > 0) {
    await Category.insertMany(missing.map((category) => ({ ...category, userId })));
  }
}

module.exports = { seedDefaultCategories };

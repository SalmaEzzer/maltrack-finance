const express = require("express");
const auth = require("../middlewares/auth");
const Transaction = require("../models/Transaction");
const Goal = require("../models/Goal");

const router = express.Router();

function startOfMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function addMonths(date, count) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + count, 1));
}

function monthLabel(date) {
  return date.toLocaleDateString("fr-FR", { month: "short", timeZone: "UTC" });
}

function roundMoney(value) {
  return Math.round(Number(value || 0));
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length;
}

router.get("/", auth, async (req, res) => {
  const now = new Date();
  const currentStart = startOfMonth(now);
  const nextStart = addMonths(currentStart, 1);
  const previousStart = addMonths(currentStart, -1);
  const historyStart = addMonths(currentStart, -5);
  const predictionEnd = addMonths(currentStart, 4);
  const weekStart = new Date(now);
  weekStart.setUTCDate(now.getUTCDate() - 6);
  weekStart.setUTCHours(0, 0, 0, 0);

  const [transactions, goals] = await Promise.all([
    Transaction.find({
      userId: req.userId,
      date: { $gte: historyStart, $lt: predictionEnd },
    }).populate("categoryId", "name type color"),
    Goal.find({ userId: req.userId, archived: false }),
  ]);

  const budgetTransactions = transactions.filter((tx) => tx.kind !== "transfer" && tx.kind !== "goal_funding");
  const expenses = budgetTransactions.filter((tx) => tx.type === "expense");
  const incomes = budgetTransactions.filter((tx) => tx.type === "income");

  const monthlyExpenseTotals = [];
  for (let offset = -5; offset <= 0; offset += 1) {
    const monthStart = addMonths(currentStart, offset);
    const monthEnd = addMonths(monthStart, 1);
    const total = expenses
      .filter((tx) => tx.date >= monthStart && tx.date < monthEnd)
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    monthlyExpenseTotals.push({ date: monthStart, total });
  }

  const currentExpenses = expenses
    .filter((tx) => tx.date >= currentStart && tx.date < nextStart)
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const previousExpenses = expenses
    .filter((tx) => tx.date >= previousStart && tx.date < currentStart)
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const currentIncome = incomes
    .filter((tx) => tx.date >= currentStart && tx.date < nextStart)
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const savingsRate = currentIncome > 0 ? Math.max(0, (currentIncome - currentExpenses) / currentIncome) : 0;
  const goalCompletion = goals.length
    ? average(goals.map((goal) => Math.min(1, Number(goal.currentAmount || 0) / Math.max(Number(goal.targetAmount || 0), 1))))
    : 0;
  const health = Math.round(Math.min(100, Math.max(0, savingsRate * 65 + goalCompletion * 25 + (currentIncome > 0 ? 10 : 0))));

  const nonZeroMonthlyExpenses = monthlyExpenseTotals.map((item) => item.total).filter((total) => total > 0);
  const avgMonthlyExpense = average(nonZeroMonthlyExpenses);
  const predictedNext = avgMonthlyExpense > 0
    ? roundMoney(avgMonthlyExpense * 0.7 + currentExpenses * 0.3)
    : roundMoney(currentExpenses);
  const deltaPredict = previousExpenses > 0
    ? `${(((predictedNext - previousExpenses) / previousExpenses) * 100).toFixed(1)}% vs mois dernier`
    : "Base historique insuffisante";

  const categoryTotals = new Map();
  for (const tx of expenses.filter((item) => item.date >= currentStart && item.date < nextStart)) {
    const key = tx.categoryId?._id?.toString() || "uncategorized";
    const current = categoryTotals.get(key) || {
      name: tx.categoryId?.name || "Dépenses",
      total: 0,
    };
    current.total += Number(tx.amount || 0);
    categoryTotals.set(key, current);
  }
  const topCategories = Array.from(categoryTotals.values()).sort((a, b) => b.total - a.total);
  const savings = roundMoney(topCategories.slice(0, 2).reduce((sum, cat) => sum + cat.total * 0.12, 0));

  const predData = monthlyExpenseTotals.map((item) => ({
    m: monthLabel(item.date),
    hist: roundMoney(item.total),
    pred: null,
  }));
  for (let offset = 1; offset <= 3; offset += 1) {
    const date = addMonths(currentStart, offset);
    predData.push({
      m: monthLabel(date),
      hist: null,
      pred: roundMoney(predictedNext * (1 + (offset - 1) * 0.03)),
    });
  }

  const dayLabels = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const weekData = dayLabels.map((label) => ({ d: label, v: 0 }));
  for (const tx of expenses.filter((item) => item.date >= weekStart)) {
    const day = tx.date.getUTCDay();
    weekData[day].v += Number(tx.amount || 0);
  }
  const orderedWeekData = [1, 2, 3, 4, 5, 6, 0].map((day) => ({
    d: weekData[day].d,
    v: roundMoney(weekData[day].v),
  }));

  const opportunities = topCategories.slice(0, 3).map((cat, index) => ({
    title: `Optimiser ${cat.name}`,
    desc: "Réduire cette catégorie de 10 à 15% libérerait du budget.",
    gain: roundMoney(cat.total * 0.12),
    confidence: Math.max(70, 92 - index * 7),
    tone: index === 0 ? "amber" : index === 1 ? "rose" : "emerald",
  }));

  if (!opportunities.length) {
    opportunities.push({
      title: "Ajoutez plus de transactions",
      desc: "Les recommandations deviennent plus précises avec votre historique.",
      gain: 0,
      confidence: 70,
      tone: "emerald",
    });
  }

  const expenseDelta = previousExpenses > 0
    ? ((currentExpenses - previousExpenses) / previousExpenses) * 100
    : 0;
  const insights = [
    {
      title: expenseDelta <= 0
        ? `Vos dépenses ont baissé de ${Math.abs(expenseDelta).toFixed(0)}% ce mois`
        : `Vos dépenses ont augmenté de ${expenseDelta.toFixed(0)}% ce mois`,
      desc: expenseDelta <= 0
        ? "Continuez ainsi pour renforcer votre capacité d'épargne."
        : "Surveillez les catégories les plus élevées avant la fin du mois.",
      tone: expenseDelta <= 0 ? "emerald" : "amber",
    },
    {
      title: goals.length ? "Vos objectifs sont pris en compte" : "Créez un objectif d'épargne",
      desc: goals.length
        ? "La progression de vos objectifs influence votre score de santé."
        : "Un objectif permet de transformer le suivi en plan concret.",
      tone: goals.length ? "purple" : "amber",
    },
    {
      title: "Projection du mois prochain prête",
      desc: "La prédiction utilise votre historique récent et vos dépenses actuelles.",
      tone: "purple",
    },
  ];

  res.json({
    kpis: {
      health,
      savings,
      precision: transactions.length >= 20 ? 91.5 : transactions.length >= 8 ? 84.2 : 72.5,
      predictedNext,
      deltaSavings: previousExpenses > 0 ? `${expenseDelta.toFixed(1)}% vs mois dernier` : "Nouveau suivi",
      deltaPredict,
    },
    predData,
    weekData: orderedWeekData,
    opportunities,
    insights,
  });
});

module.exports = router;

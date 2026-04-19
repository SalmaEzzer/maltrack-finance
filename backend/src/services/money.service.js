const mongoose = require("mongoose");
const Category = require("../models/Category");
const Goal = require("../models/Goal");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");

async function runMoneyOperation(operation) {
  const session = await mongoose.startSession();

  try {
    let result;
    await session.withTransaction(async () => {
      result = await operation(session);
    });
    return result;
  } catch (err) {
    if (
      err.message?.includes("Transaction numbers are only allowed") ||
      err.message?.includes("replica set")
    ) {
      return operation(null);
    }
    throw err;
  } finally {
    await session.endSession();
  }
}

function withSession(query, session) {
  return session ? query.session(session) : query;
}

function assertPositiveAmount(amount) {
  const amountNum = Number(amount);
  if (!Number.isFinite(amountNum) || amountNum <= 0) {
    const err = new Error("Le montant doit être supérieur à 0");
    err.status = 400;
    throw err;
  }
  return amountNum;
}

async function getWallet(userId, walletId, session) {
  const wallet = await withSession(Wallet.findOne({ _id: walletId, userId }), session);
  if (!wallet) {
    const err = new Error("Wallet introuvable");
    err.status = 404;
    throw err;
  }
  return wallet;
}

async function getCategory(userId, categoryId, expectedType, session) {
  const category = await withSession(Category.findOne({ _id: categoryId, userId }), session);
  if (!category) {
    const err = new Error("Catégorie introuvable");
    err.status = 404;
    throw err;
  }
  if (expectedType && category.type !== expectedType) {
    const err = new Error("La catégorie ne correspond pas au type de transaction");
    err.status = 400;
    throw err;
  }
  return category;
}

async function getSystemCategory(userId, systemKey, fallback, session) {
  let category = await withSession(Category.findOne({ userId, systemKey }), session);
  if (category) return category;

  const existing = await withSession(
    Category.findOne({ userId, name: fallback.name, type: fallback.type }),
    session
  );

  if (existing) {
    existing.systemKey = systemKey;
    await existing.save({ session });
    return existing;
  }

  const createArgs = [{ userId, systemKey, ...fallback }];
  const created = session
    ? await Category.create(createArgs, { session })
    : await Category.create(createArgs);
  return created[0];
}

async function createTransaction(userId, payload, session) {
  const { walletId, categoryId, type, amount, date, description, attachmentUrl, kind, transferId, relatedGoalId } = payload;
  if (!walletId || !categoryId || !type) {
    const err = new Error("walletId, categoryId et type sont requis");
    err.status = 400;
    throw err;
  }
  if (!["income", "expense"].includes(type)) {
    const err = new Error("Type invalide");
    err.status = 400;
    throw err;
  }

  const amountNum = assertPositiveAmount(amount);
  const [wallet, category] = await Promise.all([
    getWallet(userId, walletId, session),
    getCategory(userId, categoryId, type, session),
  ]);
  const txKind = kind || "manual";

  if (txKind === "manual" && category.systemKey) {
    const err = new Error("Cette catégorie système est réservée aux opérations automatiques");
    err.status = 400;
    throw err;
  }

  const created = await Transaction.create(
    [{
      userId,
      walletId,
      categoryId,
      type,
      amount: amountNum,
      date: date ? new Date(date) : new Date(),
      description,
      attachmentUrl,
      kind: txKind,
      transferId,
      relatedGoalId,
    }],
    session ? { session } : undefined
  );

  wallet.balance = Number(wallet.balance || 0) + (type === "income" ? amountNum : -amountNum);
  await wallet.save({ session });

  return { transaction: created[0], walletBalance: wallet.balance };
}

async function createManualTransaction(userId, payload) {
  return runMoneyOperation((session) => createTransaction(userId, { ...payload, kind: "manual" }, session));
}

async function reverseTransactionDocument(tx, session) {
  const wallet = await withSession(Wallet.findOne({ _id: tx.walletId, userId: tx.userId }), session);
  if (wallet) {
    wallet.balance = Number(wallet.balance || 0) + (tx.type === "income" ? -Number(tx.amount) : Number(tx.amount));
    await wallet.save({ session });
  }

  if (tx.kind === "goal_funding" && tx.relatedGoalId) {
    const goal = await withSession(Goal.findOne({ _id: tx.relatedGoalId, userId: tx.userId }), session);
    if (goal) {
      goal.currentAmount = Math.max(0, Number(goal.currentAmount || 0) - Number(tx.amount || 0));
      await goal.save({ session });
    }
  }

  await tx.deleteOne({ session });
}

async function deleteTransaction(userId, transactionId) {
  return runMoneyOperation(async (session) => {
    const tx = await withSession(Transaction.findOne({ _id: transactionId, userId }), session);
    if (!tx) {
      const err = new Error("Transaction introuvable");
      err.status = 404;
      throw err;
    }

    const transactions = tx.kind === "transfer" && tx.transferId
      ? await withSession(Transaction.find({ userId, transferId: tx.transferId }), session)
      : [tx];

    for (const transaction of transactions) {
      await reverseTransactionDocument(transaction, session);
    }

    return { message: tx.kind === "transfer" ? "Transfert supprimé" : "Transaction supprimée" };
  });
}

async function createTransfer(userId, payload) {
  return runMoneyOperation(async (session) => {
    const { fromWalletId, toWalletId, amount, description } = payload;
    if (!fromWalletId || !toWalletId) {
      const err = new Error("fromWalletId et toWalletId sont requis");
      err.status = 400;
      throw err;
    }
    if (String(fromWalletId) === String(toWalletId)) {
      const err = new Error("Les portefeuilles source et destination doivent être différents");
      err.status = 400;
      throw err;
    }

    const amountNum = assertPositiveAmount(amount);
    const fromWallet = await getWallet(userId, fromWalletId, session);
    await getWallet(userId, toWalletId, session);

    if (Number(fromWallet.balance || 0) < amountNum) {
      const err = new Error("Solde insuffisant dans le portefeuille source");
      err.status = 400;
      throw err;
    }

    const [expenseCategory, incomeCategory] = await Promise.all([
      getSystemCategory(userId, "transfer_expense", {
        name: "Transfert dépense",
        type: "expense",
        icon: "arrow-right-left",
        color: "#94A3B8",
      }, session),
      getSystemCategory(userId, "transfer_income", {
        name: "Transfert revenu",
        type: "income",
        icon: "arrow-right-left",
        color: "#94A3B8",
      }, session),
    ]);

    const transferId = new mongoose.Types.ObjectId().toString();
    const label = description?.trim() || "Transfert";
    const expense = await createTransaction(userId, {
      walletId: fromWalletId,
      categoryId: expenseCategory._id,
      type: "expense",
      amount: amountNum,
      description: label,
      kind: "transfer",
      transferId,
    }, session);
    const income = await createTransaction(userId, {
      walletId: toWalletId,
      categoryId: incomeCategory._id,
      type: "income",
      amount: amountNum,
      description: label,
      kind: "transfer",
      transferId,
    }, session);

    return { transferId, transactions: [expense.transaction, income.transaction] };
  });
}

async function fundGoal(userId, goalId, payload) {
  return runMoneyOperation(async (session) => {
    const amountNum = assertPositiveAmount(payload.amount);
    const goal = await withSession(Goal.findOne({ _id: goalId, userId }), session);
    if (!goal) {
      const err = new Error("Objectif introuvable");
      err.status = 404;
      throw err;
    }

    const sourceWalletId = goal.walletId || payload.walletId;
    if (!sourceWalletId) {
      const err = new Error("walletId est requis pour financer cet objectif");
      err.status = 400;
      throw err;
    }

    const wallet = await getWallet(userId, sourceWalletId, session);
    const remaining = Number(goal.targetAmount || 0) - Number(goal.currentAmount || 0);
    if (remaining <= 0) {
      const err = new Error("Objectif déjà atteint");
      err.status = 400;
      throw err;
    }

    const amountToAdd = Math.min(amountNum, remaining);
    if (Number(wallet.balance || 0) < amountToAdd) {
      const err = new Error("Solde insuffisant dans ce portefeuille");
      err.status = 400;
      throw err;
    }

    const category = await getSystemCategory(userId, "goal_funding", {
      name: "Objectif / Épargne",
      type: "expense",
      icon: "target",
      color: "#A855F7",
    }, session);

    goal.walletId = sourceWalletId;
    goal.currentAmount = Number(goal.currentAmount || 0) + amountToAdd;
    await goal.save({ session });

    const txResult = await createTransaction(userId, {
      walletId: sourceWalletId,
      categoryId: category._id,
      type: "expense",
      amount: amountToAdd,
      description: `Objectif: ${goal.name}`,
      kind: "goal_funding",
      relatedGoalId: goal._id,
    }, session);

    const populatedGoal = await withSession(
      Goal.findById(goal._id).populate("walletId", "name type balance currency color"),
      session
    );

    return { goal: populatedGoal, transaction: txResult.transaction, walletBalance: txResult.walletBalance };
  });
}

module.exports = {
  createManualTransaction,
  createTransfer,
  deleteTransaction,
  fundGoal,
};

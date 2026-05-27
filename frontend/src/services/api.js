const API_URL = import.meta.env.VITE_API_URL;

const demoWallets = [
  { _id: "w1", name: "Compte principal", balance: 15420, currency: "DH", isDefault: true },
  { _id: "w2", name: "Épargne", balance: 7800, currency: "DH" },
  { _id: "w3", name: "Cash", balance: 1200, currency: "DH" },
];

const demoCategories = [
  { _id: "c1", name: "Shopping", color: "#a855f7" },
  { _id: "c2", name: "Food", color: "#10b981" },
  { _id: "c3", name: "Transport", color: "#38bdf8" },
  { _id: "c4", name: "Bills", color: "#f97316" },
];

const demoTransactions = [
  { _id: "t1", title: "Salaire", type: "income", amount: 9000, category: "Income", date: "2026-05-01" },
  { _id: "t2", title: "Freelance", type: "income", amount: 2500, category: "Income", date: "2026-05-08" },
  { _id: "t3", title: "Courses", type: "expense", amount: 420, category: "Food", date: "2026-05-10" },
  { _id: "t4", title: "Netflix", type: "expense", amount: 95, category: "Bills", date: "2026-05-12" },
  { _id: "t5", title: "Shopping", type: "expense", amount: 780, category: "Shopping", date: "2026-05-15" },
  { _id: "t6", title: "Taxi", type: "expense", amount: 65, category: "Transport", date: "2026-05-18" },
];

export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function isDemoMode() {
  return getToken() === "demo-token";
}

function getDemoResponse(path) {
  if (path.startsWith("/api/wallets")) {
    return { wallets: demoWallets };
  }

  if (path.startsWith("/api/transactions")) {
    return { transactions: demoTransactions };
  }

  if (path.startsWith("/api/categories")) {
    return { categories: demoCategories };
  }

  if (path.startsWith("/api/goals")) {
    return {
      goals: [
        { _id: "g1", title: "MacBook Pro", targetAmount: 20000, currentAmount: 13000 },
        { _id: "g2", title: "Voyage", targetAmount: 15000, currentAmount: 6000 },
      ],
    };
  }

  return {};
}

export async function apiFetch(path, options = {}) {
  const token = getToken();

  if (isDemoMode()) {
    return getDemoResponse(path);
  }

  if (!API_URL) {
    throw new Error("Erreur API");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data.message || "Erreur API";
    throw new Error(msg);
  }

  return data;
}
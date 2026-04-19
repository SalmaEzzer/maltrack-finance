import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../services/api";
import {
  Plus,
  Trash2,
  Search,
  Calendar,
  WalletCards,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Tag,
} from "lucide-react";
import CreateTransactionModal from "../components/CreateTransactionModal";
import CustomSelect from "../components/CustomSelect";

function formatMoney(n, currency = "DH") {
  const num = Number(n || 0);
  return `${num.toLocaleString("fr-FR")} ${currency}`;
}

function monthYearLabel(month, year) {
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export default function Transactions() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);

  const [walletId, setWalletId] = useState(""); // filtre
  const [type, setType] = useState(""); // "", income, expense

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openCreate, setOpenCreate] = useState(false);

  // UI only: search client-side (ne touche pas au backend)
  const [q, setQ] = useState("");

  const currency = useMemo(() => {
    const def = wallets.find((w) => w.isDefault);
    return def?.currency || wallets[0]?.currency || "DH";
  }, [wallets]);

  async function loadBase() {
    const [wRes, cRes] = await Promise.all([
      apiFetch("/api/wallets"),
      apiFetch("/api/categories"),
    ]);
    setWallets(wRes.wallets || []);
    setCategories(cRes.categories || []);
  }

  async function loadTransactions() {
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams();
      qs.set("month", String(month));
      qs.set("year", String(year));
      if (type) qs.set("type", type);
      if (walletId) qs.set("walletId", walletId);

      const res = await apiFetch(`/api/transactions?${qs.toString()}`);
      setTransactions(res.transactions || []);
    } catch (e) {
      setError(e.message);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteTx(id) {
    const ok = confirm("Supprimer cette transaction ");
    if (!ok) return;

    try {
      await apiFetch(`/api/transactions/${id}`, { method: "DELETE" });
      await loadTransactions();
      await loadBase(); // balances
    } catch (e) {
      alert(e.message);
    }
  }

  useEffect(() => {
    (async () => {
      await loadBase();
      await loadTransactions();
    })();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line
  }, [month, year, type, walletId]);

  // Stats (UI)
  const stats = useMemo(() => {
    const budgetTransactions = transactions.filter((t) => t.kind !== "transfer" && t.kind !== "goal_funding");
    const income = budgetTransactions.reduce((s, t) => s + (t.type === "income" ? Number(t.amount || 0) : 0), 0);
    const expense = budgetTransactions.reduce((s, t) => s + (t.type === "expense" ? Number(t.amount || 0) : 0), 0);
    const net = income - expense;
    return { income, expense, net };
  }, [transactions]);

  // Search (UI only)
  const filtered = useMemo(() => {
    const term = (q || "").trim().toLowerCase();
    if (!term) return transactions;

    return transactions.filter((t) => {
      const wName = (t.walletId?.name || "").toLowerCase();
      const cName = (t.categoryId?.name || "").toLowerCase();
      const desc = (t.description || "").toLowerCase();
      return wName.includes(term) || cName.includes(term) || desc.includes(term);
    });
  }, [transactions, q]);

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        value: i + 1,
        label: new Date(2000, i, 1).toLocaleDateString("fr-FR", { month: "long" }),
      })),
    []
  );

  const walletOptions = useMemo(
    () => [{ value: "", label: "Tous" }, ...wallets.map((w) => ({ value: w._id, label: w.name }))],
    [wallets]
  );

  const typeOptions = useMemo(
    () => [
      { value: "", label: "Tous" },
      { value: "income", label: "Revenu" },
      { value: "expense", label: "Depense" },
    ],
    []
  );

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Transactions</h1>
          <p className="mt-1 text-white/55 text-sm">
            {monthYearLabel(month, year)} • Suivi clair de tes mouvements
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpenCreate(true)}
          className="
            inline-flex items-center gap-2
            px-4 py-2 rounded-2xl
            bg-gradient-to-r from-purple-600/35 to-fuchsia-600/20
            hover:from-purple-600/45 hover:to-fuchsia-600/30
            border border-purple-500/20
            text-sm transition active:scale-[0.99]
            shadow-[0_12px_40px_rgba(168,85,247,0.18)]
          "
        >
          <Plus className="w-4 h-4 text-white/90" />
          Nouvelle transaction
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />
          </div>
          <div className="relative">
            <div className="text-xs text-white/50">Revenus</div>
            <div className="mt-2 text-2xl font-semibold text-emerald-200">
              {formatMoney(stats.income, currency)}
            </div>
            <div className="mt-1 text-xs text-white/45">Total filtré</div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-red-500/10 blur-3xl" />
          </div>
          <div className="relative">
            <div className="text-xs text-white/50">Dépenses</div>
            <div className="mt-2 text-2xl font-semibold text-red-200">
              {formatMoney(stats.expense, currency)}
            </div>
            <div className="mt-1 text-xs text-white/45">Total filtré</div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-purple-500/10 blur-3xl" />
          </div>
          <div className="relative">
            <div className="text-xs text-white/50">Net</div>
            <div className={stats.net < 0 ? "mt-2 text-2xl font-semibold text-red-200" : "mt-2 text-2xl font-semibold text-emerald-200"}>
              {formatMoney(stats.net, currency)}
            </div>
            <div className="mt-1 text-xs text-white/45">Revenus − Dépenses</div>
          </div>
        </div>
      </div>

      {/* Toolbar filtres */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
          <div>
            <div className="text-xs text-white/50 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Mois
            </div>
            <CustomSelect
              className="min-w-[160px]"
              value={month}
              onChange={(v) => setMonth(Number(v))}
              options={monthOptions}
            />
          </div>

          <div>
            <div className="text-xs text-white/50 mb-2">Année</div>
            <input
              type="number"
              className="w-32 rounded-2xl border border-white/10 bg-white/5 text-white px-3 py-2 outline-none"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>

          <div>
            <div className="text-xs text-white/50 mb-2 flex items-center gap-2">
              <WalletCards className="w-4 h-4" /> Portefeuille
            </div>
            <CustomSelect
              className="min-w-[220px]"
              value={walletId}
              onChange={(v) => setWalletId(String(v))}
              options={walletOptions}
            />
          </div>

          <div>
            <div className="text-xs text-white/50 mb-2 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Type
            </div>
            <CustomSelect
              className="min-w-[160px]"
              value={type}
              onChange={(v) => setType(String(v))}
              options={typeOptions}
            />
          </div>

          <div className="flex-1" />

          {/* Search (UI only) */}
          <div className="w-full lg:w-[320px]">
            <div className="text-xs text-white/50 mb-2">Recherche</div>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <Search className="w-4 h-4 text-white/60" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="bg-transparent outline-none text-sm w-full text-white/90 placeholder:text-white/40"
                placeholder="wallet, catégorie, description..."
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      )}

      {/* Liste */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] overflow-hidden">
        {/* Top bar */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="text-sm text-white/70">
            {loading ? "Chargement…" : `${filtered.length} transaction(s)`}
          </div>

          <button
            onClick={loadTransactions}
            className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            Rafraîchir
          </button>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto h-14 w-14 rounded-3xl bg-white/5 border border-white/10 grid place-items-center">
              <Tag className="w-6 h-6 text-white/60" />
            </div>
            <div className="mt-4 text-white/80 font-semibold">Aucune transaction</div>
            <div className="mt-1 text-sm text-white/50">
              Ajoute ta première transaction pour voir apparaître l’historique.
            </div>
            <button
              onClick={() => setOpenCreate(true)}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm"
            >
              <Plus className="w-4 h-4 text-white/70" />
              Ajouter une transaction
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-white/10">
            {filtered.map((t) => {
              const isIncome = t.type === "income";
              const wName = t.walletId?.name || "Wallet";
              const cName = t.categoryId?.name || "Catégorie";
              const cColor = t.categoryId?.color || "#94A3B8";
              const txCurrency = t.walletId?.currency || currency;

              return (
                <li
                  key={t._id}
                  className="p-5 flex items-start justify-between gap-4 hover:bg-white/[0.03] transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 grid place-items-center">
                      {isIncome ? (
                        <ArrowUpRight className="w-5 h-5 text-emerald-200/90" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-red-200/90" />
                      )}
                    </div>

                    <div>
                      <div className="font-semibold text-white/90">
                        {t.description || cName}
                      </div>

                      <div className="mt-1 text-sm text-white/55 flex flex-wrap gap-x-3 gap-y-1">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
                          <WalletCards className="w-3.5 h-3.5" />
                          {wName}
                        </span>

                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cColor }} />
                          {cName}
                        </span>

                        {t.date ? (
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(t.date).toLocaleDateString("fr-FR")}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={isIncome ? "text-emerald-200 font-semibold" : "text-red-200 font-semibold"}>
                      {isIncome ? "+" : "-"}
                      {formatMoney(t.amount, txCurrency)}
                    </div>

                    <button
                      className="mt-2 h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 grid place-items-center transition"
                      onClick={() => deleteTx(t._id)}
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-white/70" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <CreateTransactionModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        wallets={wallets}
        categories={categories}
        onCreated={async () => {
          setOpenCreate(false);
          await loadTransactions();
          await loadBase(); // balances
        }}
      />
    </div>
  );
}

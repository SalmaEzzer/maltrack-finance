import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../services/api";
import { ChevronDown, Calendar, Loader2 } from "lucide-react";

import StatCard from "../components/StatCard";
import LineChart from "../components/LineChart";
import DonutChart from "../components/DonutChart";
import WalletList from "../components/WalletList";
import AlertsPanel from "../components/AlertsPanel";
import RecentTransactions from "../components/RecentTransactions";
import CustomSelect from "../components/CustomSelect";

function getMonthYear(date = new Date()) {
  return { month: date.getMonth() + 1, year: date.getFullYear() };
}

function monthLabelFR(month, year) {
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

function formatMoney(n, currency = "DH") {
  const num = Number(n || 0);
  return `${num.toLocaleString("fr-FR")} ${currency}`;
}

function isBudgetTransaction(t) {
  return t.kind !== "transfer" && t.kind !== "goal_funding";
}

export default function Dashboard() {
  const now = new Date();
  const [{ month, year }, setDate] = useState(getMonthYear(now));

  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openPicker, setOpenPicker] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError("");

      try {
        const [w, t, c] = await Promise.all([
          apiFetch("/api/wallets"),
          apiFetch(`/api/transactions?month=${month}&year=${year}`),
          apiFetch("/api/categories"),
        ]);

        if (!mounted) return;
        setWallets(w.wallets || []);
        setTransactions(t.transactions || []);
        setCategories(c.categories || []);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || "Erreur lors du chargement");
        setWallets([]);
        setTransactions([]);
        setCategories([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [month, year]);

  const currency = useMemo(() => {
    const def = wallets.find((w) => w.isDefault);
    return def?.currency || wallets[0]?.currency || "DH";
  }, [wallets]);

  const totalBalance = useMemo(() => {
    return wallets.reduce((s, w) => s + Number(w.balance || 0), 0);
  }, [wallets]);

  const income = useMemo(() => {
    return transactions
      .filter((t) => t.type === "income" && isBudgetTransaction(t))
      .reduce((s, t) => s + Number(t.amount || 0), 0);
  }, [transactions]);

  const expense = useMemo(() => {
    return transactions
      .filter((t) => t.type === "expense" && isBudgetTransaction(t))
      .reduce((s, t) => s + Number(t.amount || 0), 0);
  }, [transactions]);

  const saving = income - expense;

  const monthTitle = monthLabelFR(month, year);
  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        value: i + 1,
        label: new Date(2000, i, 1).toLocaleDateString("fr-FR", {
          month: "long",
        }),
      })),
    []
  );

  return (
    <div className="space-y-6">
      {/* Premium header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Tableau de bord
          </h1>
          <p className="mt-1 text-sm text-white/55">
            Synthèse de votre activité{" "}
            <span className="text-white/75">{monthTitle}</span>
          </p>
        </div>

        {/* Month picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenPicker((v) => !v)}
            className="
              inline-flex items-center gap-2
              px-4 py-2 rounded-2xl
              bg-white/5 hover:bg-white/10
              border border-white/10
              text-sm text-white/85
              transition
              shadow-[0_10px_30px_rgba(0,0,0,0.25)]
            "
          >
            <Calendar className="w-4 h-4 text-white/65" />
            {monthTitle}
            <ChevronDown className="w-4 h-4 text-white/65" />
          </button>

          {openPicker && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setOpenPicker(false)}
              />
              <div
                className="
                  absolute right-0 mt-2 z-50 w-[320px]
                  rounded-3xl border border-white/10
                  bg-[#0b0b16]/95 backdrop-blur-xl
                  shadow-[0_25px_80px_rgba(0,0,0,0.55)]
                  overflow-visible
                "
              >
                <div className="p-4 border-b border-white/10">
                  <div className="text-sm font-semibold text-white/90">
                    Choisir une période
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    Dashboard mis à jour automatiquement
                  </div>
                </div>

                <div className="p-4 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-white/50 mb-2">Mois</div>
                    <CustomSelect
                      value={month}
                      onChange={(v) => setDate((d) => ({ ...d, month: Number(v) }))}
                      options={monthOptions}
                    />
                  </div>

                  <div>
                    <div className="text-xs text-white/50 mb-2">Année</div>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) =>
                        setDate((d) => ({ ...d, year: Number(e.target.value) }))
                      }
                      className="
                        w-full rounded-2xl px-3 py-2
                        bg-white/5 text-white
                        border border-white/10
                        outline-none
                        focus:border-purple-400/30
                        focus:ring-2 focus:ring-purple-500/10
                      "
                    />
                  </div>
                </div>

                <div className="p-4 pt-0 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setDate(getMonthYear(new Date()));
                      setOpenPicker(false);
                    }}
                    className="
                      px-3 py-2 rounded-2xl
                      bg-white/5 hover:bg-white/10
                      border border-white/10
                      text-sm text-white/80 transition
                    "
                  >
                    Ce mois
                  </button>

                  <button
                    onClick={() => setOpenPicker(false)}
                    className="
                      px-3 py-2 rounded-2xl
                      bg-gradient-to-r from-purple-600/35 to-fuchsia-600/20
                      hover:from-purple-600/45 hover:to-fuchsia-600/30
                      border border-purple-500/20
                      text-sm text-white/90 transition
                    "
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Loading / Error */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-white/70 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-white/70" />
          Chargement du dashboard...
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard title="Solde total" value={totalBalance} type="balance" currency={currency} />
            <StatCard title="Revenus" value={income} type="income" currency={currency} />
            <StatCard title="Dépenses" value={expense} type="expense" currency={currency} />
            <StatCard title="Épargne" value={saving} type="saving" currency={currency} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <LineChart transactions={transactions} />
            </div>
            <DonutChart transactions={transactions} categories={categories} />
          </div>

          {/* Bottom */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <WalletList wallets={wallets} currency={currency} />
            <AlertsPanel transactions={transactions} />
            <RecentTransactions transactions={transactions} currency={currency} />
          </div>
        </>
      )}
    </div>
  );
}


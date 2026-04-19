import { useMemo } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Sparkles,
  WalletCards,
  Tag,
} from "lucide-react";

function formatDH(v) {
  const n = Number(v || 0);
  return `${n.toLocaleString("fr-FR")} DH`;
}

function formatDate(d) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return "";
  }
}

// règle simple pour “alerte” (tu peux ajuster)
function isUnusualExpense(t) {
  if (t.type !== "expense") return false;
  return Number(t.amount || 0) >= 1000; // ex: dépense >= 1000 DH => badge "Anomalie"
}

function getTxTitle(t) {
  return (t.description || "").trim() || t.categoryId?.name || "Transaction";
}

function getWalletName(t) {
  return t.walletId?.name || "Wallet";
}

function getCategoryName(t) {
  return t.categoryId?.name || "Catégorie";
}

export default function RecentTransactions({ transactions = [] }) {
  const items = useMemo(() => {
    // si ton backend ne trie pas, on trie par date desc (safe)
    const arr = Array.isArray(transactions) ? [...transactions] : [];
    arr.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return arr.slice(0, 3);
  }, [transactions]);

  return (
    <div className="rounded-3xl p-6 bg-white/[0.04] border border-white/10 h-full relative overflow-hidden">
      {/* glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -right-24 h-60 w-60 rounded-full bg-fuchsia-600/10 blur-3xl" />
        <div className="absolute -bottom-24 left-10 h-60 w-60 rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-white/90">
              Transactions récentes
            </div>
            <div className="text-xs text-white/50">
              Dernières opérations (mois sélectionné)
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            <Sparkles className="w-3.5 h-3.5 text-purple-200" />
            Live
          </div>
        </div>

        {/* Content */}
        <div className="mt-5">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-white/60 text-sm">
              Aucune transaction pour le moment.
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((t) => {
                const income = t.type === "income";
                const unusual = isUnusualExpense(t);

                return (
                  <div
                    key={t._id}
                    className="
                      group flex items-center justify-between gap-4
                      rounded-2xl border border-white/10
                      bg-white/[0.03] hover:bg-white/[0.06]
                      transition p-3
                    "
                  >
                    {/* Left */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Icon bubble */}
                      <div
                        className={
                          income
                            ? "h-10 w-10 rounded-2xl grid place-items-center border border-emerald-400/20 bg-emerald-400/10"
                            : "h-10 w-10 rounded-2xl grid place-items-center border border-red-400/20 bg-red-400/10"
                        }
                      >
                        {income ? (
                          <ArrowUpRight className="w-5 h-5 text-emerald-200" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-200" />
                        )}
                      </div>

                      {/* Texts */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="text-sm text-white/90 font-medium truncate">
                            {getTxTitle(t)}
                          </div>

                          {/* Badges */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={
                                income
                                  ? "inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-200"
                                  : "inline-flex items-center gap-1 rounded-full border border-red-400/20 bg-red-400/10 px-2 py-0.5 text-[11px] text-red-200"
                              }
                            >
                              {income ? "Revenu" : "Dépense"}
                            </span>

                            {unusual && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[11px] text-amber-200">
                                Anomalie
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Sub line */}
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50">
                          <span className="inline-flex items-center gap-1">
                            <WalletCards className="w-3.5 h-3.5 text-white/35" />
                            {getWalletName(t)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-white/35" />
                            {getCategoryName(t)}
                          </span>
                          <span className="text-white/40">{formatDate(t.date)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="text-right shrink-0">
                      <div
                        className={
                          income
                            ? "text-sm font-semibold text-emerald-200"
                            : "text-sm font-semibold text-red-200"
                        }
                      >
                        {income ? "+" : "-"}
                        {formatDH(t.amount)}
                      </div>

                      {/* small hint on hover */}
                      <div className="mt-1 text-[11px] text-white/35 opacity-0 group-hover:opacity-100 transition">
                        Cliquer pour détails (à venir)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { X, ArrowDownLeft, ArrowUpRight, Star, Trash2 } from "lucide-react";
import { apiFetch } from "../services/api";
import ModalPortal from "./ModalPortal";

function formatMoney(n, currency = "DH") {
  const num = Number(n || 0);
  return `${num.toLocaleString("fr-FR")} ${currency}`;
}

function getMonthYear(date = new Date()) {
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  return { month: m, year: y };
}

export default function WalletDetailsModal({
  open,
  wallet,
  onClose,
  onSetDefault,
  onDelete,
}) {
  const [loading, setLoading] = useState(false);
  const [tx, setTx] = useState([]);
  const [error, setError] = useState("");

  const currency = wallet?.currency || "DH";

  const monthLabel = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  }, []);

  useEffect(() => {
    if (!open || !wallet?._id) return;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const { month, year } = getMonthYear(new Date());
        const res = await apiFetch(
          `/api/transactions?month=${month}&year=${year}&walletId=${wallet._id}`
        );
        setTx(res.transactions || []);
      } catch (e) {
        setError(e.message || "Erreur lors du chargement");
        setTx([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, wallet?._id]);

  if (!open || !wallet) return null;

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[9999]">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* modal */}
      <div className="absolute inset-0 overflow-y-auto flex items-start sm:items-center justify-center p-4 py-8">
        <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0b0b16]/95 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.65)] overflow-hidden">
          {/* top glow line */}
          <div
            className="h-[3px] w-full"
            style={{ backgroundColor: wallet?.color || "#8B5CF6" }}
          />

          <div className="p-6 relative">
            {/* close */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 grid place-items-center"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>

            {/* header */}
            <div className="pr-12">
              <div className="text-xs text-white/50">Détails du portefeuille</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">
                {wallet.name}
              </div>
              <div className="mt-1 text-sm text-white/55">
                {wallet?.isDefault ? "Compte principal" : "Portefeuille"} •{" "}
                {monthLabel}
              </div>
            </div>

            {/* summary */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-xs text-white/50">Solde</div>
                <div className="mt-2 text-xl font-semibold">
                  {formatMoney(wallet.balance, currency)}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-xs text-white/50">Type</div>
                <div className="mt-2 text-sm text-white/80 capitalize">
                  {wallet.type || "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <div className="text-xs text-white/50">Devise</div>
                <div className="mt-2 text-sm text-white/80">
                  {wallet.currency || "—"}
                </div>
              </div>
            </div>

            {/* actions */}
            <div className="mt-4 flex flex-wrap gap-3">
              {!wallet?.isDefault && (
                <button
                  onClick={() => onSetDefault?.(wallet._id)}
                  className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm flex items-center gap-2"
                >
                  <Star className="w-4 h-4 text-yellow-300/80" />
                  Définir comme principal
                </button>
              )}

              <button
                onClick={() => onDelete?.(wallet._id)}
                className="px-4 py-2 rounded-2xl bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-sm text-red-200 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>

            {/* transactions */}
            <div className="mt-6">
              <div className="text-sm font-semibold text-white/90">
                Dernières transactions
              </div>
              <div className="mt-2 rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
                {loading ? (
                  <div className="p-4 text-white/60">Chargement…</div>
                ) : error ? (
                  <div className="p-4 text-red-200">{error}</div>
                ) : tx.length === 0 ? (
                  <div className="p-4 text-white/60">
                    Aucune transaction ce mois-ci.
                  </div>
                ) : (
                  <ul className="divide-y divide-white/10">
                    {tx.slice(0, 8).map((t) => {
                      const isIncome = t.type === "income";
                      return (
                        <li key={t._id} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={
                                "h-10 w-10 rounded-2xl grid place-items-center border " +
                                (isIncome
                                  ? "border-emerald-400/20 bg-emerald-400/10"
                                  : "border-red-400/20 bg-red-400/10")
                              }
                            >
                              {isIncome ? (
                                <ArrowDownLeft className="w-4 h-4 text-emerald-200" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4 text-red-200" />
                              )}
                            </div>

                            <div>
                              <div className="text-sm text-white/85">
                                {t.label || t.category || "Transaction"}
                              </div>
                              <div className="text-xs text-white/45">
                                {t.date
                                  ? new Date(t.date).toLocaleDateString("fr-FR")
                                  : ""}
                              </div>
                            </div>
                          </div>

                          <div
                            className={
                              "text-sm font-semibold " +
                              (isIncome ? "text-emerald-200" : "text-red-200")
                            }
                          >
                            {isIncome ? "+" : "-"}
                            {formatMoney(t.amount, currency)}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>

            {/* footer */}
            <div className="mt-5 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}

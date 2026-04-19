import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { apiFetch } from "../services/api";
import ModalPortal from "./ModalPortal";
import CustomSelect from "./CustomSelect";

function formatMoney(n, currency = "DH") {
  const num = Number(n || 0);
  return `${num.toLocaleString("fr-FR")} ${currency}`;
}

function pct(current, target) {
  const c = Number(current || 0);
  const t = Number(target || 0);
  if (t <= 0) return 0;
  return Math.min(100, Math.max(0, (c / t) * 100));
}

export default function FundGoalModal({ open, onClose, goal, onFunded, wallets = [] }) {
  const [amount, setAmount] = useState("");
  const [walletId, setWalletId] = useState("");

  useEffect(() => {
    if (!open) return;
    setAmount("");
    setWalletId(goal?.walletId?._id || goal?.walletId || wallets.find((wallet) => wallet.isDefault)?._id || wallets[0]?._id || "");
  }, [open, goal, wallets]);

  const p = useMemo(() => pct(goal?.currentAmount, goal?.targetAmount), [goal]);

  if (!open || !goal) return null;

  const selectedWallet = wallets.find((wallet) => wallet._id === walletId) || goal.walletId;
  const isValid = Number(amount) > 0 && Boolean(walletId);
  const walletOptions = useMemo(
    () => [
      { value: "", label: "Choisir un portefeuille" },
      ...wallets.map((wallet) => ({
        value: wallet._id,
        label: `${wallet.name} - ${formatMoney(wallet.balance, wallet?.currency || "DH")}`,
      })),
    ],
    [wallets]
  );

  async function submit() {
    if (!isValid) return;
    try {
      await apiFetch(`/api/goals/${goal._id}/fund`, {
        method: "PATCH",
        body: JSON.stringify({ amount: Number(amount), walletId }),
      });
      onFunded?.();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 overflow-y-auto flex items-start sm:items-center justify-center p-4 py-8">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b0b16]/95 backdrop-blur-xl overflow-hidden relative">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-purple-600/12 blur-3xl" />
            <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-3xl" />
          </div>

          <div className="relative p-6">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 grid place-items-center"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>

            <div className="text-xs text-white/50">Ajouter</div>
            <div className="mt-1 text-2xl font-semibold text-white/90">Ajouter des fonds</div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="font-semibold text-white/90">{goal.name}</div>
              {goal.walletId ? (
                <div className="mt-1 text-xs text-white/45">
                  Portefeuille : {goal.walletId.name || selectedWallet?.name || "Wallet"}
                </div>
              ) : null}
              <div className="mt-2 text-xs text-white/50 flex justify-between">
                <span>{formatMoney(goal.currentAmount)}</span>
                <span>{Math.round(p)}%</span>
                <span>{formatMoney(goal.targetAmount)}</span>
              </div>
              <div className="mt-2 h-2.5 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${p}%`,
                    background: `linear-gradient(90deg, ${goal.color || "#A855F7"}CC, ${goal.color || "#A855F7"}66)`,
                  }}
                />
              </div>
            </div>

            {!goal.walletId ? (
              <div className="mt-5">
                <div className="text-xs text-white/50 mb-2">Portefeuille</div>
                <CustomSelect
                  value={walletId}
                  onChange={(v) => setWalletId(String(v))}
                  options={walletOptions}
                />
              </div>
            ) : null}

            <div className="mt-5">
              <div className="text-xs text-white/50 mb-2">Montant</div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 text-white px-3 py-2 outline-none"
                placeholder="ex: 250"
              />
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition"
              >
                Annuler
              </button>

              <button
                onClick={submit}
                disabled={!isValid}
                className="
                  px-4 py-2 rounded-2xl
                  bg-gradient-to-r from-purple-600/35 to-fuchsia-600/20
                  hover:from-purple-600/45 hover:to-fuchsia-600/30
                  border border-purple-500/20 text-sm transition
                  disabled:opacity-40 disabled:cursor-not-allowed
                "
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}

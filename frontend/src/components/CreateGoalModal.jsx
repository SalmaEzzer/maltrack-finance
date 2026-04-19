import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { apiFetch } from "../services/api";
import ModalPortal from "./ModalPortal";
import CustomSelect from "./CustomSelect";

const COLORS = ["#A855F7", "#10B981", "#F59E0B", "#3B82F6", "#F97316", "#EF4444"];

export default function CreateGoalModal({ open, onClose, onCreated, wallets = [] }) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [walletId, setWalletId] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setTargetAmount("");
    setWalletId(wallets.find((wallet) => wallet.isDefault)?._id || wallets[0]?._id || "");
    setColor(COLORS[0]);
    setDueDate("");
  }, [open, wallets]);

  const isValid = useMemo(() => {
    return name.trim().length > 1 && Number(targetAmount) > 0 && Boolean(walletId);
  }, [name, targetAmount, walletId]);

  const walletOptions = useMemo(
    () => [
      { value: "", label: "Choisir un portefeuille" },
      ...wallets.map((wallet) => ({
        value: wallet._id,
        label: `${wallet.name} - ${Number(wallet.balance || 0).toLocaleString("fr-FR")} ${wallet?.currency || "DH"}`,
      })),
    ],
    [wallets]
  );

  if (!open) return null;

  async function submit() {
    if (!isValid) return;

    try {
      await apiFetch("/api/goals", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          targetAmount: Number(targetAmount),
          walletId,
          color,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        }),
      });

      onCreated?.();
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

            <div className="text-xs text-white/50">Objectif</div>
            <div className="mt-1 text-2xl font-semibold text-white/90">Créer un objectif</div>

            <div className="mt-6 grid gap-4">
              <div>
                <div className="text-xs text-white/50 mb-2">Nom</div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 text-white px-3 py-2 outline-none"
                  placeholder="ex: Voyage, MacBook…"
                />
              </div>

              <div>
                <div className="text-xs text-white/50 mb-2">Portefeuille</div>
                <CustomSelect
                  value={walletId}
                  onChange={(v) => setWalletId(String(v))}
                  options={walletOptions}
                />
              </div>

              <div>
                <div className="text-xs text-white/50 mb-2">Objectif (montant)</div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 text-white px-3 py-2 outline-none"
                  placeholder="ex: 5000"
                />
              </div>

              <div>
                <div className="text-xs text-white/50 mb-2">Échéance (optionnel)</div>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 text-white px-3 py-2 outline-none"
                />
              </div>

              <div>
                <div className="text-xs text-white/50 mb-2">Couleur</div>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={
                        c === color
                          ? "h-9 w-9 rounded-2xl border-2 border-white/70"
                          : "h-9 w-9 rounded-2xl border border-white/15 hover:border-white/30"
                      }
                      style={{ backgroundColor: c }}
                      aria-label="Choisir couleur"
                    />
                  ))}
                </div>
              </div>
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
                Créer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}

import { useEffect, useState } from "react";
import { WalletCards, X, Plus } from "lucide-react";
import ModalPortal from "./ModalPortal";
import CustomSelect from "./CustomSelect";

export default function CreateWalletModal({ open, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("card");
  const [balance, setBalance] = useState("");

  // reset quand on ouvre
  useEffect(() => {
    if (open) {
      setName("");
      setType("card");
      setBalance("");
    }
  }, [open]);

  // ESC pour fermer
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();

    const initial = Number(balance);
    onSubmit?.({
      name: name.trim(),
      type,
      balance: Number.isNaN(initial) ? 0 : initial,
      currency: "MAD",
    });
  }

  const canSubmit = name.trim().length >= 2;
  const walletTypeOptions = [
    { value: "card", label: "Carte bancaire" },
    { value: "bank", label: "Compte bancaire" },
    { value: "cash", label: "Especes" },
  ];

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[9999]">
      {/* overlay blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative h-dvh overflow-y-auto grid place-items-center p-4 py-8">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0b16]/95 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* top glow line */}
          <div className="h-[3px] w-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400" />

          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="h-12 w-12 rounded-2xl bg-purple-600/15 border border-purple-500/25 grid place-items-center">
                <WalletCards className="w-5 h-5 text-purple-200" />
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 text-white/60 hover:text-white"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="mt-4 text-xl font-semibold">Nouveau portefeuille</h2>
            <p className="mt-1 text-sm text-white/55">
              Créez un nouveau portefeuille pour organiser vos finances
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs text-white/50">NOM DU PORTEFEUILLE</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Mon compte épargne"
                  className="mt-2 w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3 text-sm outline-none
                             focus:border-purple-400/40 focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              {/* Type */}
              <div>
                <label className="text-xs text-white/50">TYPE DE PORTEFEUILLE</label>
                <CustomSelect
                  className="mt-2"
                  value={type}
                  onChange={(v) => setType(String(v))}
                  options={walletTypeOptions}
                  buttonClassName="bg-black/20 px-4 py-3"
                />
              </div>

              {/* Balance */}
              <div>
                <label className="text-xs text-white/50">SOLDE INITIAL</label>
                <div className="mt-2 flex items-center gap-2 rounded-2xl bg-black/20 border border-white/10 px-4 py-3
                                focus-within:border-purple-400/40 focus-within:ring-2 focus-within:ring-purple-500/20">
                  <input
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="0.00"
                    inputMode="decimal"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                  <span className="text-xs text-white/45">DH</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-2xl text-sm text-white/70 hover:text-white hover:bg-white/5"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={`px-4 py-2 rounded-2xl text-sm flex items-center gap-2
                    ${
                      canSubmit
                        ? "bg-purple-500/80 hover:bg-purple-500 text-white shadow-[0_12px_40px_rgba(168,85,247,0.25)]"
                        : "bg-white/10 text-white/40 cursor-not-allowed"
                    }`}
                >
                  <Plus className="w-4 h-4" />
                  Créer le portefeuille
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}

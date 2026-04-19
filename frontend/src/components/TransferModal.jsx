import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import ModalPortal from "./ModalPortal";
import CustomSelect from "./CustomSelect";

export default function TransferModal({
  open,
  onClose,
  wallets = [],
  fromWallet,
  onSubmit,
}) {
  const [toId, setToId] = useState("");
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("Transfert");

  // wallets destination (sans le wallet source)
  const toWallets = useMemo(() => {
    const fromId = fromWallet?._id;
    return (wallets || []).filter((w) => w._id && w._id !== fromId);
  }, [wallets, fromWallet?._id]);
  const toWalletOptions = useMemo(
    () =>
      toWallets.length === 0
        ? [{ value: "", label: "Aucun portefeuille destination", disabled: true }]
        : toWallets.map((w) => ({ value: w._id, label: w.name })),
    [toWallets]
  );

  useEffect(() => {
    if (!open) return;
    // reset à l'ouverture
    setAmount("");
    setLabel("Transfert");
    setToId(toWallets[0]?._id || "");
  }, [open, toWallets]);

  if (!open) return null;

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[9999]">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute inset-0 overflow-y-auto flex items-start sm:items-center justify-center p-4 py-8">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b0b16]/95 backdrop-blur-xl overflow-hidden">
          <div className="p-6 relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 grid place-items-center"
              aria-label="Fermer"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>

            <div className="text-xs text-white/50">Transférer depuis</div>
            <div className="mt-1 text-2xl font-semibold">
              {fromWallet.name || "—"}
            </div>

            <div className="mt-5 grid gap-3">
              {/* Vers */}
              <div>
                <div className="text-xs text-white/50 mb-2">Vers</div>

                {/* IMPORTANT: bg + text lisibles */}
                <CustomSelect
                  value={toId}
                  onChange={(v) => setToId(String(v))}
                  options={toWalletOptions}
                />
              </div>

              {/* Montant */}
              <div>
                <div className="text-xs text-white/50 mb-2">Montant</div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 text-white px-3 py-2 outline-none"
                  placeholder="ex: 100"
                />
              </div>

              {/* Libellé */}
              <div>
                <div className="text-xs text-white/50 mb-2">Libellé</div>
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 text-white px-3 py-2 outline-none"
                  placeholder="Transfert"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm"
              >
                Annuler
              </button>

              <button
                onClick={() =>
                  onSubmit?.({
                    toId,
                    amount: Number(amount),
                    label,
                  })
                }
                disabled={!toId || !amount || Number(amount) <= 0}
                className="px-4 py-2 rounded-2xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/20 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirmer transfert
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}

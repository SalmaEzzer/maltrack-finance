import { useEffect, useMemo, useState } from "react";
import { X, ArrowDownRight, ArrowUpRight, WalletCards, Tag } from "lucide-react";
import { apiFetch } from "../services/api";
import ModalPortal from "./ModalPortal";
import CustomSelect from "./CustomSelect";

function formatMoney(n, currency = "DH") {
  const num = Number(n || 0);
  return `${num.toLocaleString("fr-FR")} ${currency}`;
}

export default function CreateTransactionModal({
  open,
  onClose,
  wallets = [],
  categories = [],
  onCreated,
}) {
  const [walletId, setWalletId] = useState("");
  const [type, setType] = useState("expense");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const filteredCategories = useMemo(() => {
    return (categories || []).filter((c) => c.type === type && !c.systemKey);
  }, [categories, type]);

  const selectedWallet = useMemo(() => {
    return wallets.find((w) => w._id === walletId) || wallets[0];
  }, [wallets, walletId]);

  const selectedCategory = useMemo(() => {
    return filteredCategories.find((c) => c._id === categoryId);
  }, [filteredCategories, categoryId]);

  const walletOptions = useMemo(
    () => wallets.map((w) => ({ value: w._id, label: w.name })),
    [wallets]
  );

  const categoryOptions = useMemo(() => {
    if (filteredCategories.length === 0) {
      return [{ value: "", label: "Aucune categorie", disabled: true }];
    }
    return filteredCategories.map((c) => ({ value: c._id, label: c.name }));
  }, [filteredCategories]);

  useEffect(() => {
    if (!open) return;
    setWalletId(wallets[0]?._id || "");
    setType("expense");
    setCategoryId("");
    setAmount("");
    setDescription("");
  }, [open, wallets]);

  useEffect(() => {
    if (!open) return;
    setCategoryId(filteredCategories[0]?._id || "");
  }, [open, filteredCategories]);

  if (!open) return null;

  const isValid = !!walletId && !!categoryId && Number(amount) > 0;

  async function submit() {
    if (!walletId) return alert("Choisis un wallet");
    if (!categoryId) return alert("Choisis une catégorie");
    if (!amount || Number(amount) <= 0) return alert("Montant invalide");

    try {
      await apiFetch("/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          walletId,
          categoryId,
          type,
          amount: Number(amount),
          description,
          date: new Date().toISOString(),
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
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute inset-0 overflow-y-auto flex items-start sm:items-center justify-center p-4 py-8">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b0b16]/95 backdrop-blur-xl overflow-hidden relative">
          {/* glow */}
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

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-white/50">Ajouter</div>
                <div className="mt-1 text-2xl font-semibold text-white/90">
                  Nouvelle transaction
                </div>

                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                  {type === "income" ? (
                    <>
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-200" />
                      Revenu
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="w-3.5 h-3.5 text-red-200" />
                      Dépense
                    </>
                  )}
                </div>
              </div>

              {/* Amount preview */}
              <div className="text-right">
                <div className="text-xs text-white/50">Montant</div>
                <div
                  className={
                    type === "income"
                      ? "mt-1 text-lg font-semibold text-emerald-200"
                      : "mt-1 text-lg font-semibold text-red-200"
                  }
                >
                  {Number(amount) > 0
                    ? `${type === "income" ? "+" : "-"}${formatMoney(
                        amount,
                        selectedWallet?.currency || "DH"
                      )}`
                    : "—"}
                </div>
              </div>
            </div>

            {/* Toggle type */}
            <div className="mt-6">
              <div className="text-xs text-white/50 mb-2">Type</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={
                    type === "expense"
                      ? "rounded-2xl px-3 py-2 border border-red-400/30 bg-red-400/10 text-red-100 text-sm flex items-center justify-center gap-2"
                      : "rounded-2xl px-3 py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 text-sm flex items-center justify-center gap-2 transition"
                  }
                >
                  <ArrowDownRight className="w-4 h-4" />
                  Dépense
                </button>

                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={
                    type === "income"
                      ? "rounded-2xl px-3 py-2 border border-emerald-400/30 bg-emerald-400/10 text-emerald-100 text-sm flex items-center justify-center gap-2"
                      : "rounded-2xl px-3 py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 text-sm flex items-center justify-center gap-2 transition"
                  }
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Revenu
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="mt-5 grid gap-4">
              {/* Wallet */}
              <div>
                <div className="text-xs text-white/50 mb-2 flex items-center gap-2">
                  <WalletCards className="w-4 h-4" /> Portefeuille
                </div>

                <CustomSelect
                  value={walletId}
                  onChange={(v) => setWalletId(String(v))}
                  options={walletOptions}
                />
              </div>

              {/* Category */}
              <div>
                <div className="text-xs text-white/50 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Catégorie
                </div>

                <CustomSelect
                  value={categoryId}
                  onChange={(v) => setCategoryId(String(v))}
                  options={categoryOptions}
                />

                {selectedCategory?.color ? (
                  <div className="mt-2 text-xs text-white/45 flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: selectedCategory?.color }}
                    />
                    Catégorie sélectionnée :{" "}
                    <span className="text-white/70">{selectedCategory?.name}</span>
                  </div>
                ) : null}
              </div>

              {/* Amount */}
              <div>
                <div className="text-xs text-white/50 mb-2">Montant</div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="
                    w-full rounded-2xl px-3 py-2 outline-none
                    bg-white/5 text-white
                    border border-white/10
                    focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/20
                  "
                  placeholder="ex: 100"
                />
              </div>

              {/* Description */}
              <div>
                <div className="text-xs text-white/50 mb-2">Description</div>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="
                    w-full rounded-2xl px-3 py-2 outline-none
                    bg-white/5 text-white
                    border border-white/10
                    focus:border-purple-500/40 focus:ring-2 focus:ring-purple-500/20
                  "
                  placeholder="ex: Café, Transport..."
                />
              </div>
            </div>

            {/* Actions */}
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
                  border border-purple-500/20
                  text-sm transition
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

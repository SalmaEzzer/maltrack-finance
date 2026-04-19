import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../services/api";
import { WalletCards, Plus, ArrowLeftRight, Info, Star } from "lucide-react";
import CreateWalletModal from "../components/CreateWalletModal";
import WalletDetailsModal from "../components/WalletDetailsModal";
import TransferModal from "../components/TransferModal";




function formatMoney(n, currency = "DH") {
  const num = Number(n || 0);
  return `${num.toLocaleString("fr-FR")} ${currency}`;
}

function getAutoColor(wallet, index) {
  if (wallet.color) return wallet.color;

  const map = {
    cash: "#8B5CF6", // violet
    bank: "#22C55E", // vert
    card: "#F59E0B", // orange
  };

  if (wallet.type && map[wallet.type]) return map[wallet.type];

  const palette = ["#8B5CF6", "#22C55E", "#F59E0B"];
  return palette[index % palette.length];
}

function WalletIcon({ color = "#8B5CF6" }) {
  return (
    <div
      className="h-11 w-11 rounded-2xl grid place-items-center border shadow-[0_0_30px_rgba(196,64,255,0.12)]"
      style={{ backgroundColor: `${color}18`, borderColor: `${color}55` }}
    >
      <WalletCards className="w-5 h-5 text-white/85" />
    </div>
  );
}

function getMonthYear(date = new Date()) {
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  return { month: m, year: y };
}

function getPrevMonthYear(date = new Date()) {
  const d = new Date(date);
  d.setMonth(d.getMonth() - 1);
  return getMonthYear(d);
}

function sumNet(transactions = []) {
  return transactions.reduce((sum, tx) => {
    const amt = Number(tx.amount || 0);
    if (tx.type === "income") return sum + amt;
    return sum - amt;
  }, 0);
}

function computePct(currentNet, prevNet) {
  const c = Number(currentNet || 0);
  const p = Number(prevNet || 0);

  if (p === 0) {
    if (c === 0) return 0;
    return c > 0 ? 100 : -100;
  }
  return ((c - p) / Math.abs(p)) * 100;
}

export default function Wallets() {
  const [wallets, setWallets] = useState([]);
  const [statsByWallet, setStatsByWallet] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [totalPct, setTotalPct] = useState(0);
  const [totalIsNeg, setTotalIsNeg] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [openTransfer, setOpenTransfer] = useState(false);
  const [fromWallet, setFromWallet] = useState(null);





  async function load() {
  setLoading(true);
  setError("");

  try {
    // 1) wallets
    const data = await apiFetch("/api/wallets");
    const list = data.wallets || [];
    setWallets(list);

    // 2) stats (% mois courant vs prcdent)
    const now = new Date();
    const { month, year } = getMonthYear(now);
    const prev = getPrevMonthYear(now);

    const results = await Promise.all(
      list.map(async (w) => {
        try {
          const [cur, prevRes] = await Promise.all([
            apiFetch(`/api/transactions?month=${month}&year=${year}&walletId=${w._id}`),
            apiFetch(`/api/transactions?month=${prev.month}&year=${prev.year}&walletId=${w._id}`),
          ]);

          const curNet = sumNet(cur.transactions || []);
          const prevNet = sumNet(prevRes.transactions || []);
          const pct = computePct(curNet, prevNet);

          return { id: w._id, pct, isNeg: pct < 0, curNet, prevNet };
        } catch {
          return { id: w._id, pct: 0, isNeg: false, curNet: 0, prevNet: 0 };
        }
      })
    );

    //  stats par wallet
    setStatsByWallet(
      Object.fromEntries(results.map((r) => [r.id, { pct: r.pct, isNeg: r.isNeg }]))
    );

    //  total (sans requtes globales)
    const curNetAll = results.reduce((s, r) => s + r.curNet, 0);
    const prevNetAll = results.reduce((s, r) => s + r.prevNet, 0);
    const pctAll = computePct(curNetAll, prevNetAll);

    setTotalPct(pctAll);
    setTotalIsNeg(pctAll < 0);
  } catch (e) {
    setError(e.message);
  } finally {
    setLoading(false);
  }
}



  async function handleCreateWallet(payload) {
  try {
    await apiFetch("/api/wallets", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setOpenCreate(false);
    await load(); // refresh wallets + stats
  } catch (e) {
    alert(e.message);
  }
}


  async function setDefaultWallet(walletId) {
  try {
    await apiFetch(`/api/wallets/${walletId}`, {
      method: "PUT",
      body: JSON.stringify({ isDefault: true }),
    });
    await load();
  } catch (e) {
    alert(e.message);
  }
}


  async function deleteWallet(walletId) {
  console.log("DELETE wallet:", walletId);

  const ok = confirm("Supprimer ce portefeuille ");
  if (!ok) return;

  try {
    await apiFetch(`/api/wallets/${walletId}`, { method: "DELETE" });

    // fermer le modal + reset state
    setOpenDetails(false);
    setSelectedWallet(null);

    await load(); // refresh
  } catch (e) {
    console.error(e);
    alert(e.message);
  }
}
async function handleTransfer({ toId, amount, label }) {
  if (!fromWallet._id) return alert("Wallet source manquant");
  if (!toId) return alert("Choisis un wallet destination");
  if (!amount || Number(amount) <= 0) return alert("Montant invalide");

  try {
    await apiFetch("/api/transfers", {
      method: "POST",
      body: JSON.stringify({
        fromWalletId: fromWallet._id,
        toWalletId: toId,
        amount: Number(amount),
        description: label.trim() || "Transfert",
      }),
    });

    setOpenTransfer(false);
    setFromWallet(null);
    await load();
  } catch (e) {
    alert(e.message);
  }
}






  useEffect(() => {
    load();
  }, []);

  const currency = useMemo(() => {
    const def = wallets.find((w) => w.isDefault);
    return def?.currency || wallets[0]?.currency || "DH";
  }, [wallets]);

  const totalBalance = useMemo(() => {
    return wallets.reduce((sum, w) => sum + Number(w.balance || 0), 0);
  }, [wallets]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Portefeuilles</h1>
          <p className="mt-1 text-white/55 text-sm">Gérez vos différents comptes</p>
        </div>

        <button
          type="button"
          className="px-4 py-2 rounded-2xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/20 text-sm transition active:scale-[0.99] shadow-[0_10px_30px_rgba(168,85,247,0.12)] flex items-center gap-2"
          onClick={() => setOpenCreate(true)}

        >
          <Plus className="w-4 h-4 text-white/80" />
          Nouveau portefeuille
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 right-6 h-40 w-40 rounded-full bg-purple-600/15 blur-3xl" />
        </div>

        <div className="relative">
          <div className="text-xs text-white/50">Solde total</div>
          <div className="mt-3 flex flex-wrap items-end gap-4">
            <div className="text-4xl font-semibold tracking-tight">
              {formatMoney(totalBalance, currency)}
            </div>

            <div
  className={
      totalIsNeg
        ? "inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs text-red-200"
      : "inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200"
  }
>
  <span
    className={
      totalIsNeg ? "h-2 w-2 rounded-full bg-red-400/80" : "h-2 w-2 rounded-full bg-emerald-400/80"
    }
  />
  {totalPct >= 0 ? "+" : ""}
  {totalPct.toFixed(1)}% <span className="text-white/40">ce mois-ci</span>
</div>

          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-white/60">Chargement...</div>
      ) : wallets.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-white/70">
          Aucun portefeuille. Crée ton premier wallet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {wallets.map((w, idx) => {
            const color = getAutoColor(w, idx);
            const stat = statsByWallet[w._id];
            const pct = stat?.pct ?? 0;
            const isNeg = stat?.isNeg ?? false;

            return (
              <div
                key={w._id}
                className="rounded-3xl bg-white/[0.04] border border-white/10 overflow-hidden hover:border-white/15 transition hover:-translate-y-[2px]"
              >
                <div className="h-[3px] w-full" style={{ backgroundColor: color }} />

                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <WalletIcon color={color} />
                      <div>
                        <div className="text-sm text-white/55">
                          {w.isDefault ? "Compte principal" : "Portefeuille"}
                        </div>
                        <div className="font-semibold text-white/90">{w.name}</div>
                      </div>
                    </div>

                    <div
                      className={
                        isNeg
                          ? "inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs text-red-200"
                          : "inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200"
                      }
                    >
                      <span
                        className={
                          isNeg ? "h-2 w-2 rounded-full bg-red-400/80" : "h-2 w-2 rounded-full bg-emerald-400/80"
                        }
                      />
                      {pct >= 0 ? "+" : ""}
                      {pct.toFixed(1)}%
                    </div>
                  </div>

                  <div className="mt-5 flex items-end gap-2">
                    <div className="text-3xl font-semibold tracking-tight">
                      {Number(w.balance || 0).toLocaleString("fr-FR")}
                    </div>
                    <div className="text-xs text-white/50 mb-1">{w.currency || currency}</div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="px-3 py-2 rounded-2xl bg-black/20 hover:bg-black/30 border border-white/10 text-sm transition active:scale-[0.99] flex items-center justify-center gap-2"
                      onClick={() => {
                        setFromWallet({ ...w, color }); // wallet source
                        setOpenTransfer(true);         // ouvre modal transfer
                     }}

                    >
                      <ArrowLeftRight className="w-4 h-4 text-white/70" />
                      Transférer
                    </button>

                    <button
                      type="button"
                      className="px-3 py-2 rounded-2xl bg-black/20 hover:bg-black/30 border border-white/10 text-sm transition active:scale-[0.99] flex items-center justify-center gap-2"
                      onClick={() => {
                         setSelectedWallet({ ...w, color });
                         setOpenDetails(true);
                       }}

                    >
                      <Info className="w-4 h-4 text-white/70" />
                      Détails
                    </button>
                  </div>

                  {/*  bouton principal (si pas dj default) */}
                  {!w.isDefault && (
                    <button
                      type="button"
                      className="mt-3 w-full px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition active:scale-[0.99] flex items-center justify-center gap-2"
                      onClick={() => setDefaultWallet(w._id)}
                    >
                      <Star className="w-4 h-4 text-yellow-300/80" />
                      Définir comme principal
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => setOpenCreate(true)}

            className="rounded-3xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition p-6 flex items-center justify-center min-h-[220px] group"
          >
            <div className="text-center">
              <div className="mx-auto h-14 w-14 rounded-3xl bg-white/5 border border-white/10 grid place-items-center group-hover:scale-105 transition">
                <Plus className="w-7 h-7 text-white/70" />
              </div>
              <div className="mt-3 text-sm text-white/70">Ajouter un portefeuille</div>
            </div>
          </button>
        </div>
      )}
      <CreateWalletModal
  open={openCreate}
  onClose={() => setOpenCreate(false)}
  onSubmit={handleCreateWallet}
/>
{selectedWallet && (
  <WalletDetailsModal
    open={openDetails}
    wallet={selectedWallet}
    onClose={() => {
      setOpenDetails(false);
      setSelectedWallet(null);
    }}
    onSetDefault={setDefaultWallet}
    onDelete={deleteWallet}
  />
)}


<TransferModal
  open={openTransfer}
  onClose={() => {
    setOpenTransfer(false);
    setFromWallet(null);
  }}
  wallets={wallets}
  fromWallet={fromWallet}
  onSubmit={handleTransfer}
/>




    </div>
  );
}


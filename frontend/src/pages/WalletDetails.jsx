import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiFetch } from "../services/api";
import { ArrowLeft, WalletCards } from "lucide-react";

function formatMoney(n, currency = "DH") {
  const num = Number(n || 0);
  return `${num.toLocaleString("fr-FR")} ${currency}`;
}

export default function WalletDetails() {
  const { id } = useParams(); // /wallets/:id
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      // Option A (si ton backend a GET /api/wallets/:id)
      const res = await apiFetch(`/api/wallets/${id}`);
      // selon ton backend, adapte:
      // - res.wallet
      // - ou res (direct)
      const w = res.wallet || res;
      setWallet(w);
    } catch (e) {
      // Option B (fallback): si tu n'as pas /api/wallets/:id
      // on ne bloque pas la page mais on affiche une erreur claire
      setError(
        e.message ||
          "Impossible de charger ce portefeuille. Vérifie que GET /api/wallets/:id existe."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  const currency = useMemo(() => wallet?.currency || "DH", [wallet]);

  if (loading) return <div className="text-white/60">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            to="/app/wallets"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white/80 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux portefeuilles
          </Link>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Détails portefeuille
          </h1>
          <p className="mt-1 text-white/55 text-sm">
            Informations du portefeuille sélectionné
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      )}

      {!wallet ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-white/70">
          Portefeuille introuvable.
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-2xl grid place-items-center border border-white/10 bg-white/5">
              <WalletCards className="w-5 h-5 text-white/85" />
            </div>

            <div className="min-w-0">
              <div className="text-sm text-white/55">
                {wallet?.isDefault ? "Compte principal" : "Portefeuille"}
              </div>
              <div className="font-semibold text-white/90 truncate">
                {wallet.name}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs text-white/50">Solde</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">
              {formatMoney(wallet.balance, currency)}
            </div>
          </div>

          {/* Étape suivante plus tard :
              - Transactions de ce wallet
              - Graph / stats
              - Edit / Delete */}
        </div>
      )}
    </div>
  );
}

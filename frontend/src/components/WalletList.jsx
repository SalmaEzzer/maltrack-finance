import { WalletCards, Star } from "lucide-react";

function formatDH(v) {
  const n = Number(v || 0);
  return `${n.toLocaleString("fr-FR")} DH`;
}

export default function WalletList({ wallets = [] }) {
  const sorted = [...wallets].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

  return (
    <div className="rounded-3xl p-6 bg-white/[0.04] border border-white/10 relative overflow-hidden">
      {/* glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-fuchsia-600/10 blur-3xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white/90">Portefeuilles</div>
            <div className="text-xs text-white/50">Vos soldes actuels</div>
          </div>

          <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 grid place-items-center">
            <WalletCards className="w-5 h-5 text-white/70" />
          </div>
        </div>

        {/* Empty */}
        {sorted.length === 0 ? (
          <div className="mt-5 text-sm text-white/55">
            Aucun portefeuille pour le moment.
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {sorted.map((w) => {
              const isMain = !!w.isDefault;

              return (
                <div
                  key={w._id}
                  className={
                    isMain
                      ? "rounded-2xl p-4 border border-purple-400/25 bg-gradient-to-r from-purple-600/18 to-fuchsia-600/10"
                      : "rounded-2xl p-4 border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] transition"
                  }
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-white/90 truncate">
                          {w.name}
                        </div>

                        {isMain && (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] border border-purple-400/25 bg-purple-400/10 text-purple-100">
                            <Star className="w-3 h-3" />
                            Principal
                          </span>
                        )}
                      </div>

                      <div className="mt-1 text-xs text-white/50">
                        {w.type ? `Type: ${w.type}` : "Compte"}
                        {w.currency ? ` • ${w.currency}` : ""}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-white/50">Solde</div>
                      <div className="text-base font-semibold text-white/90">
                        {formatDH(w.balance)}
                      </div>
                    </div>
                  </div>

                  {/* mini progress bar (juste visuel, premium) */}
                  <div className="mt-3 h-2 w-full rounded-full bg-black/30 border border-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(8, Math.abs(Number(w.balance || 0)) / 200))}%`,
                        background: isMain
                          ? "rgba(192,132,252,0.75)"
                          : "rgba(255,255,255,0.22)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

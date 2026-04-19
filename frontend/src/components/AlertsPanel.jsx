import { useMemo } from "react";
import {
  ShieldAlert,
  Target,
  AlertTriangle,
  TrendingUp,
  Wallet,
  Sparkles,
} from "lucide-react";

function formatDH(v) {
  const n = Number(v || 0);
  return `${n.toLocaleString("fr-FR")} DH`;
}

function sumByType(transactions, type) {
  return (transactions || [])
    .filter((t) => t.type === type && t.kind !== "transfer" && t.kind !== "goal_funding")
    .reduce((s, t) => s + Number(t.amount || 0), 0);
}

export default function AlertsPanel({ transactions = [], wallets = [] }) {
  const alerts = useMemo(() => {
    const income = sumByType(transactions, "income");
    const expense = sumByType(transactions, "expense");
    const saving = income - expense;

    const totalBalance = (wallets || []).reduce(
      (s, w) => s + Number(w.balance || 0),
      0
    );

    // ✅ dépense max (unusual)
    const maxExpenseTx = (transactions || [])
      .filter((t) => t.type === "expense" && t.kind !== "transfer" && t.kind !== "goal_funding")
      .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))[0];

    // ✅ top wallet (plus gros solde)
    const topWallet = (wallets || [])
      .slice()
      .sort((a, b) => Number(b.balance || 0) - Number(a.balance || 0))[0];

    // ✅ moyenne dépense (pour détecter une dépense “inhabituelle”)
    const expenseTxs = (transactions || []).filter(
      (t) => t.type === "expense" && t.kind !== "transfer" && t.kind !== "goal_funding"
    );
    const avgExpense =
      expenseTxs.length > 0 ? expense / expenseTxs.length : 0;

    const list = [];

    // 1) Solde bas
    if (totalBalance > 0 && totalBalance < 200) {
      list.push({
        tone: "danger",
        icon: <AlertTriangle className="w-4 h-4" />,
        title: "Solde faible",
        desc: `Ton solde total est à ${formatDH(totalBalance)}. Pense à limiter les dépenses.`,
        chip: "Attention",
      });
    }

    // 2) Dépense inhabituelle
    if (maxExpenseTx && avgExpense > 0 && Number(maxExpenseTx.amount) > avgExpense * 2.5) {
      list.push({
        tone: "warn",
        icon: <ShieldAlert className="w-4 h-4" />,
        title: "Dépense inhabituelle détectée",
        desc: `Une dépense de ${formatDH(maxExpenseTx.amount)} semble élevée par rapport à ta moyenne.`,
        chip: "À vérifier",
      });
    }

    // 3) Épargne positive
    if (income > 0 && saving > 0) {
      list.push({
        tone: "success",
        icon: <TrendingUp className="w-4 h-4" />,
        title: "Bonne dynamique",
        desc: `Tu as une épargne de ${formatDH(saving)} ce mois-ci. Continue comme ça ✨`,
        chip: "Bravo",
      });
    }

    // 4) Wallet principal
    if (topWallet) {
      list.push({
        tone: "info",
        icon: <Wallet className="w-4 h-4" />,
        title: "Portefeuille dominant",
        desc: `${topWallet.name} contient ${formatDH(topWallet.balance)}.`,
        chip: "Insight",
      });
    }

    // 5) Objectif (pseudo) presque atteint (fallback “prototype-like”)
    // Tu peux plus tard le connecter à tes goals
    if (income > 0 && expense > 0 && expense < income * 0.7) {
      list.push({
        tone: "success",
        icon: <Target className="w-4 h-4" />,
        title: "Objectif presque atteint",
        desc: "Tes dépenses sont bien sous contrôle par rapport à tes revenus.",
        chip: "Proche",
      });
    }

    // si aucune alerte => fallback premium
    if (list.length === 0) {
      list.push({
        tone: "neutral",
        icon: <Sparkles className="w-4 h-4" />,
        title: "Tout est calme",
        desc: "Aucune alerte importante pour le moment. Continue à suivre tes finances.",
        chip: "OK",
      });
    }

    // limite à 3 alertes max (propre + wow)
    return list.slice(0, 3);
  }, [transactions, wallets]);

  const toneStyles = {
    danger:
      "bg-red-500/10 border-red-400/20 text-red-100",
    warn:
      "bg-yellow-500/10 border-yellow-400/20 text-yellow-100",
    success:
      "bg-emerald-500/10 border-emerald-400/20 text-emerald-100",
    info:
      "bg-sky-500/10 border-sky-400/20 text-sky-100",
    neutral:
      "bg-white/5 border-white/10 text-white/85",
  };

  const chipStyles = {
    danger: "bg-red-400/15 border-red-400/25 text-red-100",
    warn: "bg-yellow-400/15 border-yellow-400/25 text-yellow-100",
    success: "bg-emerald-400/15 border-emerald-400/25 text-emerald-100",
    info: "bg-sky-400/15 border-sky-400/25 text-sky-100",
    neutral: "bg-white/10 border-white/10 text-white/70",
  };

  return (
    <div className="rounded-3xl p-6 bg-white/[0.04] border border-white/10 relative overflow-hidden">
      {/* glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute -bottom-24 left-8 h-56 w-56 rounded-full bg-fuchsia-600/10 blur-3xl" />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white/90">Alertes</div>
            <div className="text-xs text-white/50">Insights intelligents (mois sélectionné)</div>
          </div>
          <div className="text-[11px] text-white/50 border border-white/10 bg-white/5 px-2 py-1 rounded-full">
            {alerts.length} • actives
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {alerts.map((a, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border p-4 flex items-start gap-3 ${toneStyles[a.tone]}`}
            >
              <div className="h-9 w-9 rounded-2xl border border-white/10 bg-white/5 grid place-items-center">
                <span className="text-white/90">{a.icon}</span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold truncate">{a.title}</div>
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full border ${chipStyles[a.tone]}`}
                  >
                    {a.chip}
                  </span>
                </div>
                <div className="mt-1 text-xs text-white/70 leading-relaxed">
                  {a.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        
      </div>
    </div>
  );
}

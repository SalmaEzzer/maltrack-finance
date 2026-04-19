import { ArrowUpRight, ArrowDownRight, TrendingUp, WalletCards } from "lucide-react";

export default function StatCard({ title, value, type, currency = "DH" }) {
  const icon =
    type === "income" ? <ArrowUpRight /> :
    type === "expense" ? <ArrowDownRight /> :
    type === "balance" ? <WalletCards /> :
    <TrendingUp />;

  const color =
    type === "income" ? "text-emerald-300" :
    type === "expense" ? "text-red-300" :
    type === "balance" ? "text-white/90" :
    "text-purple-300";

  return (
    <div className="rounded-3xl p-5 bg-white/[0.04] border border-white/10 min-h-[130px]">
      <div className="flex items-center justify-between">
        <div className="text-sm text-white/60">{title}</div>
        <div className={color}>{icon}</div>
      </div>
      <div className={`mt-3 text-2xl font-semibold ${color}`}>
        {Number(value || 0).toLocaleString("fr-FR")} {currency}
      </div>
    </div>
  );
}

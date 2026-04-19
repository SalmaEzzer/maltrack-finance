import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
} from "recharts";

function formatDH(v) {
  const n = Number(v || 0);
  return `${n.toLocaleString("fr-FR")} DH`;
}

function formatK(v) {
  const n = Number(v || 0);
  if (n === 0) return "0";
  if (Math.abs(n) < 1000) return `${Math.round(n)}`;
  return `${(n / 1000).toFixed(1)}k`;
}

// retourne 1..5 selon la semaine dans le mois
function weekOfMonth(date) {
  const d = new Date(date);
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const day = d.getDate();
  const startOffset = first.getDay() === 0 ? 6 : first.getDay() - 1; // lundi=0
  return Math.min(5, Math.floor((day + startOffset - 1) / 7) + 1);
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const dep = payload.find((p) => p.dataKey === "depenses")?.value || 0;
  const rev = payload.find((p) => p.dataKey === "revenus")?.value || 0;

  return (
    <div
      className="
        rounded-2xl border border-white/10
        bg-[#0b0b16]/95 backdrop-blur-xl
        px-4 py-3 shadow-[0_25px_80px_rgba(0,0,0,0.55)]
        min-w-[180px]
      "
    >
      <div className="text-xs text-white/55">{label}</div>

      <div className="mt-2 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2.5 w-2.5 rounded-full bg-purple-400" />
            <span className="text-xs text-white/70 truncate">Dépenses</span>
          </div>
          <div className="text-xs font-semibold text-white/90">{formatDH(dep)}</div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-white/70 truncate">Revenus</span>
          </div>
          <div className="text-xs font-semibold text-white/90">{formatDH(rev)}</div>
        </div>
      </div>
    </div>
  );
}

export default function LineChart({ transactions = [] }) {
  const data = useMemo(() => {
    const weeks = [1, 2, 3, 4, 5].map((w) => ({
      name: `Sem ${w}`,
      depenses: 0,
      revenus: 0,
    }));

    for (const t of transactions) {
      if (!t?.date) continue;
      if (t.kind === "transfer" || t.kind === "goal_funding") continue;
      const w = weekOfMonth(t.date) - 1;
      const amt = Number(t.amount || 0);
      if (w < 0 || w > 4) continue;

      if (t.type === "expense") weeks[w].depenses += amt;
      if (t.type === "income") weeks[w].revenus += amt;
    }

    return weeks;
  }, [transactions]);

  const totals = useMemo(() => {
    const dep = data.reduce((s, x) => s + Number(x.depenses || 0), 0);
    const rev = data.reduce((s, x) => s + Number(x.revenus || 0), 0);
    return { dep, rev };
  }, [data]);

  const maxY = useMemo(() => {
    const m = Math.max(
      0,
      ...data.map((x) => Math.max(Number(x.depenses || 0), Number(x.revenus || 0)))
    );
    // arrondir à un palier “joli”
    if (m <= 500) return 600;
    if (m <= 1000) return 1200;
    if (m <= 2000) return 2400;
    return Math.ceil(m / 1000) * 1000 + 1000;
  }, [data]);

  return (
    <div className="rounded-3xl p-6 bg-white/[0.04] border border-white/10 h-full relative overflow-hidden">
      {/* soft glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-24 h-64 w-64 rounded-full bg-purple-600/12 blur-3xl" />
        <div className="absolute -bottom-24 right-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-white/90">Évolution</div>
            <div className="text-xs text-white/50">
              Dépenses & revenus (par semaine)
            </div>

            {/* mini totals (wow effect) */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                <span className="text-white/60">Total dépenses :</span>
                <span className="text-white/90 font-semibold">{formatDH(totals.dep)}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-white/60">Total revenus :</span>
                <span className="text-white/90 font-semibold">{formatDH(totals.rev)}</span>
              </div>
            </div>
          </div>

          {/* Legend chips */}
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-400" />
              Dépenses
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              Revenus
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="mt-4 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <RLineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
              <defs>
                {/* gradients */}
                <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(192,132,252,0.35)" />
                  <stop offset="100%" stopColor="rgba(192,132,252,0.00)" />
                </linearGradient>

                <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(52,211,153,0.30)" />
                  <stop offset="100%" stopColor="rgba(52,211,153,0.00)" />
                </linearGradient>

                {/* glow filters */}
                <filter id="glowPurple" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id="glowGreen" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 6" />

              <XAxis
                dataKey="name"
                tick={{ fill: "rgba(255,255,255,0.60)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
              />

              <YAxis
                domain={[0, maxY]}
                tick={{ fill: "rgba(255,255,255,0.60)", fontSize: 12 }}
                axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
                tickFormatter={(v) => formatK(v)}
              />

              <Tooltip
                cursor={{ stroke: "rgba(255,255,255,0.10)", strokeWidth: 1 }}
                content={<CustomTooltip />}
              />

              {/* Areas (premium fill) */}
              <Area
                type="monotone"
                dataKey="depenses"
                stroke="rgba(192,132,252,0)"
                fill="url(#gradExpense)"
              />
              <Area
                type="monotone"
                dataKey="revenus"
                stroke="rgba(52,211,153,0)"
                fill="url(#gradIncome)"
              />

              {/* Lines (glow + points) */}
              <Line
                type="monotone"
                dataKey="depenses"
                stroke="rgba(192,132,252,1)"
                strokeWidth={2.75}
                dot={{ r: 0 }}
                activeDot={{ r: 6 }}
                filter="url(#glowPurple)"
              />

              <Line
                type="monotone"
                dataKey="revenus"
                stroke="rgba(52,211,153,1)"
                strokeWidth={2.75}
                dot={{ r: 0 }}
                activeDot={{ r: 6 }}
                filter="url(#glowGreen)"
              />
            </RLineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

function formatDH(v) {
  const n = Number(v || 0);
  return `${n.toLocaleString("fr-FR")} DH`;
}

const FALLBACK_COLORS = [
  "#A78BFA",
  "#34D399",
  "#60A5FA",
  "#FBBF24",
  "#FB7185",
  "#22D3EE",
  "#F472B6",
];

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0];
  const name = row?.name || "Categorie";
  const value = row?.value || 0;
  const color = row?.payload?.color || "#c440ff";

  return (
    <div className="rounded-2xl border border-violet-400/35 bg-[#090914]/95 px-3 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.55)]">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        <span className="text-xs font-medium text-violet-200">{name}</span>
      </div>
      <div className="mt-1 text-sm font-semibold text-white">{formatDH(value)}</div>
    </div>
  );
}

export default function DonutChart({ transactions = [], categories = [] }) {
  const data = useMemo(() => {
    // map categoryId -> name/color
    const catMap = new Map();
    for (const c of categories) {
      catMap.set(c._id, { name: c.name, color: c.color });
    }

    // sum expenses by category
    const sums = new Map();
    for (const t of transactions) {
      if (t.type !== "expense") continue;
      if (t.kind === "transfer" || t.kind === "goal_funding") continue;
      const id = t.categoryId?._id || t.categoryId; // populate ou pas
      const amt = Number(t.amount || 0);
      if (!id) continue;
      sums.set(id, (sums.get(id) || 0) + amt);
    }

    const arr = Array.from(sums.entries())
      .map(([id, value], i) => {
        const meta = catMap.get(id) || { name: "Autre", color: null };
        return {
          id,
          name: meta.name || "Autre",
          value,
          color: meta.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
        };
      })
      .sort((a, b) => b.value - a.value);

    // top 6 + “Autres”
    if (arr.length > 6) {
      const top = arr.slice(0, 6);
      const rest = arr.slice(6).reduce((s, x) => s + x.value, 0);
      top.push({
        id: "others",
        name: "Autres",
        value: rest,
        color: "rgba(255,255,255,0.28)",
      });
      return top;
    }

    return arr;
  }, [transactions, categories]);

  const total = useMemo(() => data.reduce((s, x) => s + x.value, 0), [data]);
  const isSingleSlice = data.length === 1;

  return (
    <div className="rounded-3xl p-6 bg-white/[0.04] border border-white/10 h-full">
      <div className="text-sm font-semibold text-white/90">
        Dépenses par catégorie
      </div>
      <div className="text-xs text-white/50">Répartition (mois sélectionné)</div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-[190px_minmax(0,1fr)] gap-4 items-center">
        <div className="h-[220px] relative mx-auto w-[190px]">
          {data.length === 0 ? (
            <div className="h-full grid place-items-center text-white/50 text-sm">
              Aucune dépense ce mois-ci
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={<DonutTooltip />}
                    cursor={false}
                    wrapperStyle={{ outline: "none", zIndex: 60 }}
                  />

                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="66%"
                    outerRadius="92%"
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={isSingleSlice ? 0 : 2}
                    stroke={isSingleSlice ? "none" : "rgba(255,255,255,0.06)"}
                    strokeWidth={isSingleSlice ? 0 : 1}
                  >
                    {data.map((entry) => (
                      <Cell key={entry.id} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* center label */}
              <div className="absolute inset-0 grid place-items-center pointer-events-none">
                <div className="text-center">
                  <div className="text-xs text-white/50">Total</div>
                  <div className="text-lg font-semibold text-white/90">
                    {formatDH(total)}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Legend */}
        <div className="space-y-2 min-w-0">
          {data.length === 0
            ? null
            : data.map((x) => (
                <div
                  key={x.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: x.color }}
                    />
                    <span className="text-sm text-white/80 truncate">
                      {x.name}
                    </span>
                  </div>
                  <div className="text-sm text-white/70 shrink-0 whitespace-nowrap">{formatDH(x.value)}</div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

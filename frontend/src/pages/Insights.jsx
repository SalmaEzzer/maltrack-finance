import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Sparkles,
  Brain,
  ShieldCheck,
  TrendingUp,
  BadgePercent,
  Star,
  Zap,
} from "lucide-react";
import { apiFetch } from "../services/api";

function formatDH(v) {
  const n = Number(v || 0);
  return `${n.toLocaleString("fr-FR")} DH`;
}

function Card({ className = "", children }) {
  return (
    <div className={"rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-xl " + className}>
      {children}
    </div>
  );
}

function Chip({ children, tone = "purple" }) {
  const map = {
    purple: "bg-purple-500/15 border-purple-400/20 text-purple-100",
    emerald: "bg-emerald-500/15 border-emerald-400/20 text-emerald-100",
    cyan: "bg-cyan-500/15 border-cyan-400/20 text-cyan-100",
    amber: "bg-amber-500/15 border-amber-400/20 text-amber-100",
    slate: "bg-white/5 border-white/10 text-white/80",
  };

  return (
    <span className={"inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] " + (map[tone] || map.slate)}>
      {children}
    </span>
  );
}

function KPI({ title, value, sub, rightIcon, tone = "purple", footer }) {
  const toneMap = {
    purple: {
      icon: "text-purple-200",
      glow: "bg-purple-600/12",
      dot: "bg-purple-300/80",
    },
    emerald: {
      icon: "text-emerald-200",
      glow: "bg-emerald-600/10",
      dot: "bg-emerald-300/80",
    },
    cyan: {
      icon: "text-cyan-200",
      glow: "bg-cyan-600/10",
      dot: "bg-cyan-300/80",
    },
    amber: {
      icon: "text-amber-200",
      glow: "bg-amber-600/12",
      dot: "bg-amber-300/80",
    },
  };
  const t = toneMap[tone] || toneMap.purple;

  return (
    <Card className="relative overflow-hidden p-5">
      <div className="pointer-events-none absolute inset-0">
        <div className={"absolute -top-16 -right-16 h-56 w-56 rounded-full blur-3xl " + t.glow} />
        <div className="absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-fuchsia-600/8 blur-3xl" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-white/55">{title}</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight text-white/95">{value}</div>
            {sub ? <div className="mt-1 text-xs text-white/50">{sub}</div> : null}
          </div>

          <div className="flex items-center gap-2">
            <span className={"h-2 w-2 rounded-full " + t.dot} />
            <div className={"h-10 w-10 rounded-2xl border border-white/10 bg-white/5 grid place-items-center " + t.icon}>
              {rightIcon}
            </div>
          </div>
        </div>

        {footer ? <div className="mt-4">{footer}</div> : null}
      </div>
    </Card>
  );
}

const defaultInsightsData = {
  kpis: {
    health: 0,
    savings: 0,
    precision: 0,
    aiPrecision: 0,
    predictedNext: 0,
    deltaSavings: "Nouveau suivi",
    deltaPredict: "Base historique insuffisante",
  },
  predData: [],
  weekData: [],
  opportunities: [],
  insights: [],
};

function insightIcon(tone) {
  if (tone === "emerald") return <TrendingUp className="w-4 h-4" />;
  if (tone === "amber") return <Zap className="w-4 h-4" />;
  return <Sparkles className="w-4 h-4" />;
}

function toneBox(tone) {
  if (tone === "rose") {
    return {
      box: "bg-rose-500/10 border-rose-400/20",
      icon: "text-rose-200",
      bar: "rgba(244,114,182,0.85)",
    };
  }
  if (tone === "amber") {
    return {
      box: "bg-amber-500/10 border-amber-400/20",
      icon: "text-amber-200",
      bar: "rgba(251,191,36,0.85)",
    };
  }
  return {
    box: "bg-emerald-500/10 border-emerald-400/20",
    icon: "text-emerald-200",
    bar: "rgba(52,211,153,0.85)",
  };
}

function insightTone(tone) {
  if (tone === "emerald") return "bg-emerald-500/10 border-emerald-400/20 text-emerald-100";
  if (tone === "amber") return "bg-amber-500/10 border-amber-400/20 text-amber-100";
  return "bg-purple-500/10 border-purple-400/20 text-purple-100";
}

export default function Insights() {
  const [data, setData] = useState(defaultInsightsData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadInsights() {
  setLoading(true);
  setError("");

  try {
    const isDemo =
      localStorage.getItem("token") === "demo-token";

    if (isDemo) {
      setData({
        kpis: {
          health: 82,
          savings: 1350,
          precision: 91.4,
          aiPrecision: 91.4,
          predictedNext: 4200,
          deltaSavings: "Excellente stabilité",
          deltaPredict: "Projection basée sur vos habitudes",
        },

        predData: [
          { m: "Jan", hist: 3200, pred: null },
          { m: "Fév", hist: 3500, pred: null },
          { m: "Mar", hist: 3900, pred: null },
          { m: "Avr", hist: 4100, pred: null },
          { m: "Mai", hist: 3800, pred: 4200 },
          { m: "Juin", hist: null, pred: 4400 },
          { m: "Juil", hist: null, pred: 3900 },
        ],

        weekData: [
          { d: "Lun", v: 120 },
          { d: "Mar", v: 260 },
          { d: "Mer", v: 90 },
          { d: "Jeu", v: 340 },
          { d: "Ven", v: 210 },
          { d: "Sam", v: 480 },
          { d: "Dim", v: 160 },
        ],

        opportunities: [
          {
            title: "Réduire les abonnements",
            desc: "Vos petites dépenses récurrentes peuvent être optimisées.",
            gain: 240,
            confidence: 88,
            tone: "emerald",
          },
          {
            title: "Limiter shopping week-end",
            desc: "Les dépenses augmentent surtout le samedi.",
            gain: 520,
            confidence: 76,
            tone: "amber",
          },
        ],

        insights: [
          {
            title: "Bonne santé financière",
            desc: "Votre solde reste positif avec une épargne régulière.",
            tone: "emerald",
          },
          {
            title: "Objectif atteignable",
            desc: "Votre objectif principal peut être atteint plus tôt.",
            tone: "purple",
          },
        ],
      });

      return;
    }

    const res = await apiFetch("/api/insights");

    setData({
      kpis: {
        ...defaultInsightsData.kpis,
        ...(res.kpis || {}),
      },
      predData: res.predData || [],
      weekData: res.weekData || [],
      opportunities: res.opportunities || [],
      insights: res.insights || [],
    });
  } catch (e) {
    setError(e.message);
    setData(defaultInsightsData);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadInsights();
  }, []);

  const kpis = data.kpis;
  const precision = kpis.precision ?? kpis.aiPrecision ?? 0;

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden p-6">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-purple-600/16 blur-3xl" />
          <div className="absolute -bottom-28 left-10 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-3xl" />
        </div>

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 grid place-items-center">
              <Brain className="w-6 h-6 text-purple-200" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-white/95">Analyse financière</div>
              <div className="mt-1 text-sm text-white/55">
                Calculée depuis vos transactions, catégories et objectifs
              </div>
            </div>
          </div>

          <Chip tone="purple">
            <Sparkles className="w-3.5 h-3.5" />
            Données réelles
          </Chip>
        </div>
      </Card>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-white/60">
          Chargement des analyses...
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPI
          title="Score de santé"
          value={String(kpis.health)}
          sub={kpis.deltaSavings}
          tone="cyan"
          rightIcon={<ShieldCheck className="w-5 h-5" />}
          footer={
            <div className="mt-2 flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${kpis.health}%`,
                    background: "rgba(34, 211, 238, 0.9)",
                  }}
                />
              </div>
              <span className="text-xs text-white/50">{kpis.health}%</span>
            </div>
          }
        />

        <KPI
          title="Économies potentielles"
          value={`+${formatDH(kpis.savings)}`}
          sub="Calculées sur vos catégories"
          tone="emerald"
          rightIcon={<BadgePercent className="w-5 h-5" />}
        />

        <KPI
          title="Précision du calcul"
          value={`${Number(precision || 0).toFixed(1)}%`}
          sub="Basée sur le volume d'historique"
          tone="purple"
          rightIcon={<Star className="w-5 h-5" />}
        />

        <KPI
          title="Prédiction prochain mois"
          value={formatDH(kpis.predictedNext)}
          sub={kpis.deltaPredict}
          tone="amber"
          rightIcon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 p-6 overflow-hidden relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white/90">Prédictions de dépenses</div>
              <div className="text-xs text-white/50">Historique + projection calculée</div>
            </div>

            <Chip tone="purple">
              <Sparkles className="w-3.5 h-3.5" />
              Calcul actif
            </Chip>
          </div>

          <div className="mt-5 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.predData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="m"
                  tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                  tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                  tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10,10,20,0.95)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 16,
                    color: "white",
                  }}
                  formatter={(value, name) => [formatDH(value), name === "hist" ? "Historique" : "Projection"]}
                  labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                />
                <Area
                  type="monotone"
                  dataKey="hist"
                  stroke="rgba(244,114,182,1)"
                  strokeWidth={2.2}
                  fill="rgba(244,114,182,0.20)"
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="pred"
                  stroke="rgba(168,85,247,1)"
                  strokeWidth={2.2}
                  strokeDasharray="6 6"
                  dot={false}
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone"
                  dataKey="pred"
                  stroke="rgba(168,85,247,0)"
                  fill="rgba(168,85,247,0.12)"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex items-center justify-center gap-6 text-xs text-white/55">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: "rgba(244,114,182,1)" }} />
              Historique
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: "rgba(168,85,247,1)" }} />
              Projection
            </span>
          </div>
        </Card>

        <Card className="p-6 overflow-hidden">
          <div className="text-sm font-semibold text-white/90">Habitudes hebdomadaires</div>
          <div className="text-xs text-white/50">Dépenses par jour cette semaine</div>

          <div className="mt-5 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <RLineChart data={data.weekData} margin={{ top: 10, right: 14, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="d"
                  tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                  tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                  tickLine={{ stroke: "rgba(255,255,255,0.12)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(10,10,20,0.95)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 16,
                    color: "white",
                  }}
                  formatter={(value) => [formatDH(value), "Dépenses"]}
                  labelStyle={{ color: "rgba(255,255,255,0.7)" }}
                />
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="rgba(34,211,238,1)"
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </RLineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-6">
          <div>
            <div className="text-sm font-semibold text-white/90">Opportunités d'économies</div>
            <div className="text-xs text-white/50">Suggestions calculées avec vos catégories</div>
          </div>

          <div className="mt-5 space-y-3">
            {data.opportunities.map((o, idx) => {
              const tone = toneBox(o.tone);

              return (
                <div key={idx} className={"rounded-2xl border p-4 " + tone.box}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 grid place-items-center">
                        <BadgePercent className={"w-5 h-5 " + tone.icon} />
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-white/90">{o.title}</div>
                        <div className="text-xs text-white/55 mt-1">{o.desc}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold text-emerald-200">+{formatDH(o.gain)}</div>
                      <div className="text-[11px] text-white/50">{o.confidence}% confiance</div>
                    </div>
                  </div>

                  <div className="mt-3 h-2 w-full rounded-full bg-black/20 border border-white/10 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${o.confidence}%`, background: tone.bar }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 overflow-hidden relative">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-purple-600/12 blur-3xl" />
          </div>

          <div className="relative">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-white/90">Insights calculés</div>
                <div className="text-xs text-white/50">Recommandations basées sur votre historique</div>
              </div>

              <Chip tone="emerald">{data.insights.length} actifs</Chip>
            </div>

            <div className="mt-5 space-y-3">
              {data.insights.map((it, idx) => (
                <div key={idx} className={"rounded-2xl border p-4 " + insightTone(it.tone)}>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 grid place-items-center">
                      {it.icon || insightIcon(it.tone)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white/90">{it.title}</div>
                      <div className="text-xs text-white/55 mt-1">{it.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={loadInsights}
              className="
                mt-4 w-full rounded-2xl py-3
                bg-gradient-to-r from-purple-600/45 to-fuchsia-600/25
                hover:from-purple-600/55 hover:to-fuchsia-600/30
                border border-purple-400/20
                text-sm font-semibold
                shadow-[0_14px_40px_rgba(168,85,247,0.25)]
                transition active:scale-[0.99]
                inline-flex items-center justify-center gap-2
              "
            >
              <Sparkles className="w-4 h-4 text-white/90" />
              Recalculer les insights
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

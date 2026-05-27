import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../services/api";
import { Plus, Trash2, TrendingUp } from "lucide-react";
import CreateGoalModal from "../components/CreateGoalModal";
import FundGoalModal from "../components/FundGoalModal";

function formatMoney(n, currency = "DH") {
  const num = Number(n || 0);
  return `${num.toLocaleString("fr-FR")} ${currency}`;
}

function pct(current, target) {
  const c = Number(current || 0);
  const t = Number(target || 0);
  if (t <= 0) return 0;
  return Math.min(100, Math.max(0, (c / t) * 100));
}

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [openFund, setOpenFund] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  async function load() {
    setLoading(true);
    setError("");

    try {
      const isDemo = localStorage.getItem("token") === "demo-token";

      if (isDemo) {
        setGoals([
          {
            _id: "demo-goal-1",
            name: "MacBook Pro",
            currentAmount: 13000,
            targetAmount: 20000,
            color: "#A855F7",
            dueDate: "2026-12-01",
            walletId: { name: "Wallet principal" },
          },
          {
            _id: "demo-goal-2",
            name: "Voyage Istanbul",
            currentAmount: 6500,
            targetAmount: 15000,
            color: "#06B6D4",
            dueDate: "2026-08-10",
            walletId: { name: "Épargne voyage" },
          },
          {
            _id: "demo-goal-3",
            name: "Emergency Fund",
            currentAmount: 10000,
            targetAmount: 20000,
            color: "#10B981",
            dueDate: "2027-01-15",
            walletId: { name: "Savings" },
          },
        ]);

        setWallets([
          {
            _id: "demo-wallet-1",
            name: "Wallet principal",
            balance: 15420,
          },
          {
            _id: "demo-wallet-2",
            name: "Épargne voyage",
            balance: 6500,
          },
        ]);

        return;
      }

      const [goalsRes, walletsRes] = await Promise.all([
        apiFetch("/api/goals"),
        apiFetch("/api/wallets"),
      ]);

      setGoals(goalsRes.goals || []);
      setWallets(walletsRes.wallets || []);
    } catch (e) {
      setError(e.message);
      setGoals([]);
      setWallets([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const totals = useMemo(() => {
    const current = goals.reduce((s, g) => s + Number(g.currentAmount || 0), 0);
    const target = goals.reduce((s, g) => s + Number(g.targetAmount || 0), 0);
    return { current, target, p: pct(current, target) };
  }, [goals]);

  const monthGain = useMemo(() => {
    const v = Math.round((totals.current * 0.08) / 10) * 10;
    return Math.max(0, v);
  }, [totals.current]);

  async function deleteGoal(id) {
    const ok = confirm("Supprimer cet objectif ?");
    if (!ok) return;

    try {
      const isDemo = localStorage.getItem("token") === "demo-token";

      if (isDemo) {
        setGoals((prev) => prev.filter((goal) => goal._id !== id));
        return;
      }

      await apiFetch(`/api/goals/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Objectifs</h1>
          <p className="mt-1 text-white/55 text-sm">
            Suivez vos objectifs d'épargne
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpenCreate(true)}
          disabled={wallets.length === 0}
          className="
            px-4 py-2 rounded-2xl
            bg-gradient-to-r from-purple-600/35 to-fuchsia-600/20
            hover:from-purple-600/45 hover:to-fuchsia-600/30
            border border-purple-500/20 text-sm
            transition active:scale-[0.99]
            shadow-[0_12px_40px_rgba(168,85,247,0.18)]
            flex items-center gap-2
            disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          <Plus className="w-4 h-4 text-white/85" />
          Créer un objectif
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      )}

      {!loading && wallets.length === 0 ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-100">
          Crée d'abord un portefeuille pour pouvoir créer et financer des objectifs.
        </div>
      ) : null}

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-purple-600/15 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-fuchsia-600/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-white/50">Épargne totale</div>
              <div className="mt-2 text-3xl font-semibold tracking-tight">
                {formatMoney(totals.current)}
              </div>
              <div className="mt-1 text-xs text-white/50">
                sur {formatMoney(totals.target)} ({Math.round(totals.p)}%)
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
              <TrendingUp className="w-4 h-4" />
              + {formatMoney(monthGain)}{" "}
              <span className="text-white/40">ce mois</span>
            </div>
          </div>

          <div className="h-2.5 rounded-full bg-white/5 border border-white/10 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${totals.p}%`,
                background:
                  "linear-gradient(90deg, rgba(168,85,247,0.9), rgba(217,70,239,0.7))",
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="text-white/60">Chargement</div>
        ) : goals.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-white/70">
            Aucun objectif. Crée ton premier objectif.
          </div>
        ) : (
          goals.map((g) => {
            const p = pct(g.currentAmount, g.targetAmount);
            const isDone = p >= 100;

            return (
              <div
                key={g._id}
                className="
                  rounded-3xl border border-white/10 bg-white/[0.04]
                  overflow-hidden relative
                  hover:border-white/15 transition
                  hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]
                "
              >
                <div
                  className="h-[3px] w-full"
                  style={{ backgroundColor: g.color || "#A855F7" }}
                />

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-11 w-11 rounded-2xl grid place-items-center border"
                        style={{
                          backgroundColor: `${g.color || "#A855F7"}18`,
                          borderColor: `${g.color || "#A855F7"}55`,
                        }}
                      >
                        <span className="text-white/90 font-semibold">
                          {g.name?.slice(0, 1).toUpperCase() || "G"}
                        </span>
                      </div>

                      <div>
                        <div className="font-semibold text-white/90">{g.name}</div>
                        <div className="text-xs text-white/45">
                          {g.dueDate
                            ? `Échéance : ${new Date(g.dueDate).toLocaleDateString("fr-FR")}`
                            : "Sans échéance"}
                        </div>

                        {g.walletId ? (
                          <div className="mt-1 text-xs text-white/45">
                            Wallet : {g.walletId.name}
                          </div>
                        ) : (
                          <div className="mt-1 text-xs text-amber-200/80">
                            Aucun wallet lié
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteGoal(g._id)}
                      className="h-9 w-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 grid place-items-center"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-white/70" />
                    </button>
                  </div>

                  <div className="mt-5 text-xs text-white/50">Progression</div>

                  <div className="mt-2 flex items-center justify-between text-xs text-white/50">
                    <div>{formatMoney(g.currentAmount)}</div>
                    <div className="text-white/60">{Math.round(p)}%</div>
                    <div>{formatMoney(g.targetAmount)}</div>
                  </div>

                  <div className="mt-2 h-2.5 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${p}%`,
                        background: `linear-gradient(90deg, ${
                          g.color || "#A855F7"
                        }CC, ${g.color || "#A855F7"}66)`,
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGoal(g);
                      setOpenFund(true);
                    }}
                    disabled={isDone}
                    className="
                      mt-5 w-full px-4 py-2 rounded-2xl
                      bg-black/20 hover:bg-black/30
                      border border-white/10
                      text-sm transition active:scale-[0.99]
                      disabled:opacity-40 disabled:cursor-not-allowed
                    "
                  >
                    {isDone ? "Objectif atteint" : "Ajouter des fonds"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <CreateGoalModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        wallets={wallets}
        onCreated={async () => {
          setOpenCreate(false);
          await load();
        }}
      />

      <FundGoalModal
        open={openFund}
        goal={selectedGoal}
        wallets={wallets}
        onClose={() => {
          setOpenFund(false);
          setSelectedGoal(null);
        }}
        onFunded={async () => {
          setOpenFund(false);
          setSelectedGoal(null);
          await load();
        }}
      />
    </div>
  );
}
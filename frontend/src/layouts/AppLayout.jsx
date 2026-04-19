import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearToken } from "../services/api";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Target,
  LineChart,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";

const navItems = [
  { to: "/app/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/app/wallets", label: "Portefeuilles", icon: Wallet },
  { to: "/app/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/app/goals", label: "Objectifs", icon: Target },
  { to: "/app/insights", label: "Insights", icon: LineChart },
  { to: "/app/settings", label: "Paramètres", icon: Settings },
];

export default function AppLayout() {
  const navigate = useNavigate();

  function logout() {
    clearToken();
    navigate("/login");
  }

  return (
    <div className="min-h-screen text-white flex bg-[#070712]">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/10 bg-[#0b0b16] flex flex-col relative overflow-hidden">
        {/* Electric glow */}
        <div className="pointer-events-none absolute -top-28 -left-28 h-72 w-72 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="pointer-events-none absolute top-24 -right-32 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-140px] left-20 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />

        {/* Brand */}
        <div className="p-5 flex items-center gap-3 relative">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-fuchsia-500/30 via-purple-500/25 to-indigo-500/20 border border-white/10 grid place-items-center shadow-[0_0_30px_rgba(196,64,255,0.18)]">
            <Sparkles className="w-5 h-5 text-fuchsia-200" />
          </div>
          <div>
            <div className="font-semibold tracking-wide">MalTrack</div>
            <div className="text-xs text-white/50">Financement privé</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-3 py-2 space-y-1 flex-1 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "group relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition border",
                    "focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40",
                    isActive
                      ? "bg-gradient-to-r from-fuchsia-500/20 via-purple-500/18 to-indigo-500/10 border-fuchsia-400/25 text-white shadow-[0_0_35px_rgba(196,64,255,0.12)]"
                      : "border-transparent text-white/70 hover:bg-white/5 hover:border-white/10",
                  ].join(" ")
                }
              >
                {/* Active neon bar */}
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[3px] rounded-full bg-gradient-to-b from-fuchsia-400 to-purple-400 opacity-0 group-[.active]:opacity-100" />

                <Icon className="w-[18px] h-[18px] text-white/65 group-hover:text-white/90 transition" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User / logout */}
        <div className="p-4 border-t border-white/10 relative">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="text-xs text-white/45">Utilisateur</div>
            <div className="text-sm text-white/80 font-medium">connecté</div>

            <button
              onClick={logout}
              className="mt-3 w-full px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4 text-white/70" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 relative overflow-hidden">
        {/* Background electric */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-56 -left-56 h-[720px] w-[720px] rounded-full bg-fuchsia-500/16 blur-3xl" />
          <div className="absolute -top-56 right-0 h-[740px] w-[740px] rounded-full bg-purple-500/14 blur-3xl" />
          <div className="absolute bottom-[-340px] left-[22%] h-[760px] w-[760px] rounded-full bg-indigo-500/12 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] via-transparent to-transparent" />
        </div>

        <div className="relative p-8">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-xl neon-glow overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400" />
            <div className="p-7">
              <Outlet />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

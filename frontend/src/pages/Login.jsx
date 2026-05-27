import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, setToken } from "../services/api";
import AuthShell from "../components/AuthShell";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("salma@test.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleDemoAccess() {
    setToken("demo-token");

    localStorage.setItem(
      "user",
      JSON.stringify({
        name: "Demo User",
        email: "demo@maltrack.com",
        mode: "demo",
      })
    );

    navigate("/app/dashboard");
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setToken(data.token);
      navigate("/app/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[460px] rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/30 px-8 pt-8 pb-7"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-white/90">MT</span>
          </div>
          <div className="text-white/90 font-semibold">MalTrack</div>
        </div>

        <h1 className="mt-7 text-2xl font-semibold tracking-tight">Bon retour</h1>
        <p className="text-white/60 mt-2">
          Connectez-vous pour accéder à votre espace
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <button
          type="button"
          className="mt-6 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left hover:bg-white/10 transition"
          onClick={handleDemoAccess}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white/90">
                Accès démo instantané
              </div>
              <div className="text-xs text-white/55">
                Explorez sans créer de compte
              </div>
            </div>
            <span className="text-white/50">→</span>
          </div>
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] text-white/45">OU AVEC VOTRE EMAIL</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-white/70">Email</label>
            <input
              className="mt-2 w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#1EC7A6]/70 focus:ring-2 focus:ring-[#1EC7A6]/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-white/70">
                Mot de passe
              </label>
              <button
                type="button"
                className="text-xs text-white/50 hover:text-white/70"
                onClick={() => alert("À faire plus tard: Forgot password")}
              >
                Mot de passe oublié
              </button>
            </div>

            <input
              className="mt-2 w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#1EC7A6]/70 focus:ring-2 focus:ring-[#1EC7A6]/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="mt-6 w-full rounded-xl py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#7C3AED] to-[#1EC7A6] hover:opacity-95 active:opacity-90 transition shadow-lg shadow-[#7C3AED]/15 disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <p className="text-sm text-white/60 mt-4 text-center">
          Pas de compte{" "}
          <Link className="text-white/80 hover:text-white" to="/register">
            Créer un compte
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
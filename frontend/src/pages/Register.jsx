import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, setToken } from "../services/api";
import AuthShell from "../components/AuthShell";

export default function Register() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("Salma");
  const [lastName, setLastName] = useState("Ezzerrouti");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const login = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setToken(login.token);
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

        <h1 className="mt-7 text-2xl font-semibold tracking-tight">Inscription</h1>
        <p className="text-white/60 mt-2">Créer un compte MalTrack</p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-white/70">Prénom</label>
            <input
              className="mt-2 w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
              focus:border-[#1EC7A6]/70 focus:ring-2 focus:ring-[#1EC7A6]/20"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-white/70">Nom</label>
            <input
              className="mt-2 w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
              focus:border-[#1EC7A6]/70 focus:ring-2 focus:ring-[#1EC7A6]/20"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-white/70">Email</label>
            <input
              className="mt-2 w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
              focus:border-[#1EC7A6]/70 focus:ring-2 focus:ring-[#1EC7A6]/20"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-white/70">Mot de passe</label>
            <input
              className="mt-2 w-full rounded-xl bg-black/20 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none
              focus:border-[#1EC7A6]/70 focus:ring-2 focus:ring-[#1EC7A6]/20"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
            <p className="mt-2 text-[11px] text-white/45">
              Utilisez au moins 8 caractères.
            </p>
          </div>
        </div>

        <button
          disabled={loading}
          className="mt-6 w-full rounded-xl py-3 text-sm font-semibold text-white
          bg-gradient-to-r from-[#7C3AED] to-[#1EC7A6]
          hover:opacity-95 active:opacity-90 transition
          shadow-lg shadow-[#7C3AED]/15 disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer le compte"}
        </button>

        <p className="text-sm text-white/60 mt-4 text-center">
          Déjà un compte {" "}
          <Link className="text-white/80 hover:text-white" to="/login">
            Connexion
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

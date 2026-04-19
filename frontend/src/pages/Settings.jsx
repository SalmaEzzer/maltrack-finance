import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Bell,
  Shield,
  Lock,
  Smartphone,
  Moon,
  LogOut,
} from "lucide-react";
import { apiFetch, clearToken } from "../services/api";

function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={
        "relative h-7 w-12 rounded-full border transition disabled:opacity-60 disabled:cursor-not-allowed " +
        (checked
          ? "bg-purple-600/40 border-purple-500/30"
          : "bg-white/5 border-white/10")
      }
    >
      <span
        className={
          "absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full transition " +
          (checked ? "left-[26px] bg-white/90" : "left-[4px] bg-white/40")
        }
      />
    </button>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
        <span className="text-white/70">{icon}</span>
        <div className="text-sm font-semibold text-white/90">{title}</div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-xs text-white/50 mb-2">{label}</div>
      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/90">
        {value}
      </div>
    </div>
  );
}

function RowItem({ title, subtitle, right }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <div className="text-sm text-white/85">{title}</div>
        {subtitle ? (
          <div className="text-xs text-white/45 mt-0.5">{subtitle}</div>
        ) : null}
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-2.5 text-sm text-white placeholder:text-white/45 focus:outline-none focus:border-white/25";

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [notifications, setNotifications] = useState({
    transactions: true,
    anomalies: true,
    goals: true,
    monthly: false,
  });

  const [securityPrefs, setSecurityPrefs] = useState({
    twoFactorEnabled: false,
  });
  const [appearancePrefs, setAppearancePrefs] = useState({
    darkTheme: true,
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [updating2FA, setUpdating2FA] = useState(false);
  const [updatingTheme, setUpdatingTheme] = useState(false);

  const fullName = useMemo(() => {
    if (!user) return "Utilisateur";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Utilisateur";
  }, [user]);

  async function loadSettings() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch("/api/me");
      const u = res.user || null;
      setUser(u);
      setProfileForm({
        firstName: u?.firstName || "",
        lastName: u?.lastName || "",
        email: u?.email || "",
      });

      if (u?.notificationPreferences) {
        setNotifications((current) => ({
          ...current,
          ...u.notificationPreferences,
        }));
      }
      if (u?.securityPreferences) {
        setSecurityPrefs((current) => ({
          ...current,
          ...u.securityPreferences,
        }));
      }
      if (u?.appearancePreferences) {
        setAppearancePrefs((current) => ({
          ...current,
          ...u.appearancePreferences,
        }));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateNotification(key, value) {
    const previous = notifications;
    const next = { ...notifications, [key]: value };
    setNotifications(next);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch("/api/me/notifications", {
        method: "PATCH",
        body: JSON.stringify(next),
      });
      if (res.notifications) {
        setNotifications((current) => ({ ...current, ...res.notifications }));
      }
    } catch (e) {
      setError(e.message);
      setNotifications(previous);
    }
  }

  async function saveProfile() {
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      setError("Le prénom et le nom sont obligatoires.");
      return;
    }
    setSavingProfile(true);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch("/api/me", {
        method: "PATCH",
        body: JSON.stringify({
          firstName: profileForm.firstName.trim(),
          lastName: profileForm.lastName.trim(),
        }),
      });
      setUser(res.user);
      setIsEditingProfile(false);
      setSuccess("Profil mis à jour.");
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword() {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setError("Veuillez remplir tous les champs du mot de passe.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("La confirmation du mot de passe ne correspond pas.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setSavingPassword(true);
    setError("");
    setSuccess("");

    try {
      await apiFetch("/api/me/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
      setSuccess("Mot de passe mis à jour.");
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingPassword(false);
    }
  }

  async function toggleTwoFactor(nextValue) {
    const previous = securityPrefs.twoFactorEnabled;
    setSecurityPrefs((current) => ({ ...current, twoFactorEnabled: nextValue }));
    setUpdating2FA(true);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch("/api/me/security", {
        method: "PATCH",
        body: JSON.stringify({ twoFactorEnabled: nextValue }),
      });
      if (res.security) {
        setSecurityPrefs((current) => ({ ...current, ...res.security }));
      }
      setSuccess(nextValue ? "2FA activée." : "2FA désactivée.");
    } catch (e) {
      setError(e.message);
      setSecurityPrefs((current) => ({ ...current, twoFactorEnabled: previous }));
    } finally {
      setUpdating2FA(false);
    }
  }

  async function toggleTheme(nextValue) {
    const previous = appearancePrefs.darkTheme;
    setAppearancePrefs((current) => ({ ...current, darkTheme: nextValue }));
    setUpdatingTheme(true);
    setError("");
    setSuccess("");

    try {
      const res = await apiFetch("/api/me/appearance", {
        method: "PATCH",
        body: JSON.stringify({ darkTheme: nextValue }),
      });
      if (res.appearance) {
        setAppearancePrefs((current) => ({ ...current, ...res.appearance }));
      }
      setSuccess(nextValue ? "Thème sombre activé." : "Thème sombre désactivé.");
    } catch (e) {
      setError(e.message);
      setAppearancePrefs((current) => ({ ...current, darkTheme: previous }));
    } finally {
      setUpdatingTheme(false);
    }
  }

  function logout() {
    clearToken();
    navigate("/login");
  }

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-semibold">Paramètres</h1>
        <p className="text-white/50 text-sm">Gérez vos préférences et votre compte</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-100">
          {success}
        </div>
      ) : null}
      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-white/60">
          Chargement des paramètres...
        </div>
      ) : null}

      <Section title="Profil" icon={<User className="w-4 h-4" />}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl border border-white/10 bg-purple-600/15 grid place-items-center">
              <User className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white/90">{fullName}</div>
              <div className="text-xs text-white/45">{user?.email || ""}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (isEditingProfile) {
                setProfileForm({
                  firstName: user?.firstName || "",
                  lastName: user?.lastName || "",
                  email: user?.email || "",
                });
              }
              setIsEditingProfile((v) => !v);
            }}
            className="px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 transition"
          >
            {isEditingProfile ? "Annuler" : "Modifier"}
          </button>
        </div>

        {isEditingProfile ? (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-white/50 mb-2">Prénom</div>
              <input
                className={inputClassName}
                value={profileForm.firstName}
                onChange={(e) =>
                  setProfileForm((current) => ({ ...current, firstName: e.target.value }))
                }
              />
            </div>
            <div>
              <div className="text-xs text-white/50 mb-2">Nom</div>
              <input
                className={inputClassName}
                value={profileForm.lastName}
                onChange={(e) =>
                  setProfileForm((current) => ({ ...current, lastName: e.target.value }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <div className="text-xs text-white/50 mb-2">Email</div>
              <input className={inputClassName + " opacity-70"} value={profileForm.email} disabled />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="button"
                onClick={saveProfile}
                disabled={savingProfile}
                className="px-4 py-2 rounded-2xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingProfile ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nom complet" value={fullName} />
            <Field label="Email" value={user?.email || ""} />
          </div>
        )}
      </Section>

      <Section title="Notifications" icon={<Bell className="w-4 h-4" />}>
        <RowItem
          title="Alertes de transactions"
          subtitle="Recevoir une notification pour chaque transaction"
          right={
            <Toggle
              checked={notifications.transactions}
              onChange={(v) => updateNotification("transactions", v)}
            />
          }
        />
        <div className="h-px bg-white/10 my-1" />
        <RowItem
          title="Alertes d'anomalies"
          subtitle="Être alerté des dépenses inhabituelles"
          right={
            <Toggle
              checked={notifications.anomalies}
              onChange={(v) => updateNotification("anomalies", v)}
            />
          }
        />
        <div className="h-px bg-white/10 my-1" />
        <RowItem
          title="Rappels d'objectifs"
          subtitle="Rappels hebdomadaires sur vos objectifs"
          right={
            <Toggle checked={notifications.goals} onChange={(v) => updateNotification("goals", v)} />
          }
        />
        <div className="h-px bg-white/10 my-1" />
        <RowItem
          title="Résumé mensuel"
          subtitle="Recevoir un récapitulatif par email"
          right={
            <Toggle
              checked={notifications.monthly}
              onChange={(v) => updateNotification("monthly", v)}
            />
          }
        />
      </Section>

      <Section title="Sécurité" icon={<Shield className="w-4 h-4" />}>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowPasswordForm((v) => !v)}
            className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition px-4 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 grid place-items-center">
                <Lock className="w-5 h-5 text-white/70" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-white/85">Changer le mot de passe</div>
                <div className="text-xs text-white/45">Cliquez pour modifier</div>
              </div>
            </div>
          </button>

          {showPasswordForm ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <div className="text-xs text-white/50 mb-2">Mot de passe actuel</div>
                <input
                  type="password"
                  className={inputClassName}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((current) => ({
                      ...current,
                      currentPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <div className="text-xs text-white/50 mb-2">Nouveau mot de passe</div>
                <input
                  type="password"
                  className={inputClassName}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((current) => ({
                      ...current,
                      newPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <div className="text-xs text-white/50 mb-2">Confirmer le nouveau mot de passe</div>
                <input
                  type="password"
                  className={inputClassName}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((current) => ({
                      ...current,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={savePassword}
                  disabled={savingPassword}
                  className="px-4 py-2 rounded-2xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingPassword ? "Mise à jour..." : "Mettre à jour"}
                </button>
              </div>
            </div>
          ) : null}

          <div className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 grid place-items-center">
                <Smartphone className="w-5 h-5 text-white/70" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-white/85">
                  Authentification à deux facteurs
                </div>
                <div className="text-xs text-white/45">
                  {securityPrefs.twoFactorEnabled ? "Activée" : "Non activée"}
                </div>
              </div>
            </div>
            <Toggle
              checked={securityPrefs.twoFactorEnabled}
              onChange={toggleTwoFactor}
              disabled={updating2FA}
            />
          </div>
        </div>
      </Section>

      <Section title="Apparence" icon={<Moon className="w-4 h-4" />}>
        <RowItem
          title="Thème sombre"
          subtitle="Préférence enregistrée dans votre compte"
          right={
            <Toggle
              checked={appearancePrefs.darkTheme}
              onChange={toggleTheme}
              disabled={updatingTheme}
            />
          }
        />
      </Section>

      <div className="rounded-3xl border border-red-500/25 bg-red-500/10 overflow-hidden">
        <div className="p-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-red-100">Déconnexion</div>
            <div className="text-xs text-red-100/60">Se déconnecter de votre compte</div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-sm text-red-100 transition"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}

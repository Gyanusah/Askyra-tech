import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import {
  ShieldCheck,
  Clock3,
  ChartNoAxesCombined,
  Award,
  Handshake,
  ClipboardCheck,
  Eye,
  EyeOff,
  Mountain,
} from "lucide-react";

const features = [
  { icon: Clock3, text: "Access your courses" },
  { icon: ChartNoAxesCombined, text: "Track your progress" },
  { icon: Award, text: "Get certificates" },
  { icon: Handshake, text: "Request services" },
  { icon: ClipboardCheck, text: "And more..." },
];

export default function Login() {
  const { role: routeRole } = useParams();
  const isAdminLogin = routeRole?.toLowerCase() === "admin";
  const accountType = isAdminLogin ? "admin" : "student";
  const [activeTab, setActiveTab] = useState(
    isAdminLogin || routeRole ? "login" : "signup",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const updateField = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
    setMessage("");
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (activeTab === "signup" && !agree) {
      setMessage("Please agree to the Terms & Conditions.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = activeTab === "signup" ? "/auth/signup" : "/auth/login";
      const payload = activeTab === "signup"
        ? {
            name: form.fullName,
            email: form.email,
            password: form.password,
            role: accountType,
          }
        : {
            email: form.email,
            password: form.password,
            role: accountType,
          };
      const result = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      navigate(`/dashboard/${result.user.role}`, { replace: true });
    } catch (error) {
      setMessage(error.message || "Unable to connect to the account service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020d1b] px-4 py-8 font-sans sm:px-6 lg:py-10">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,#063d5a55,transparent_40%),radial-gradient(ellipse_at_80%_65%,#06406435,transparent_45%)]" />

      {/* Mountain illustration */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="pointer-events-none absolute bottom-0 left-0 h-36 w-full opacity-70 sm:h-48"
      >
        <defs>
          <linearGradient id="mountainGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#08769a" />
            <stop offset="100%" stopColor="#031326" />
          </linearGradient>
        </defs>
        <path
          d="M0 180 L110 90 L170 140 L260 40 L360 170 L440 105 L535 195 L650 60 L750 180 L850 85 L960 180 L1070 45 L1180 165 L1280 90 L1440 200 L1440 320 L0 320Z"
          fill="url(#mountainGradient)"
          stroke="#087da5"
          strokeWidth="2"
        />
        <path
          d="M0 235 L130 170 L235 240 L360 125 L460 245 L600 155 L710 250 L850 150 L970 245 L1100 135 L1230 240 L1350 165 L1440 230"
          fill="none"
          stroke="#0a5579"
          strokeWidth="3"
        />
        <path
          d="M260 40 L290 94 L310 83 L360 170 M650 60 L680 112 L702 98 L750 180 M1070 45 L1105 100 L1125 88 L1180 165"
          fill="none"
          stroke="#36c7e7"
          strokeWidth="2"
        />
      </svg>

      <div className="relative z-10 mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-16">
        {/* Left branding panel */}
        <section className="flex flex-col items-center text-center text-white md:items-start md:text-left">
          <div className="mb-5 grid h-24 w-24 place-items-center rounded-full border border-cyan-400/30 bg-cyan-950/30 text-cyan-300 shadow-[0_0_45px_#00cfff20] sm:h-28 sm:w-28">
            <ShieldCheck size={76} strokeWidth={1.25} />
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            ASK YRA TECH
          </h1>
          <p className="mt-1 text-[10px] tracking-wide text-slate-300">
            Cybersecurity | Development | Training
          </p>

          <div className="mt-7 w-full max-w-sm">
            <h2 className="text-lg font-extrabold">Join AskYra Tech</h2>
            <div className="mt-5 space-y-4">
              {features.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-left">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-cyan-700/60 bg-cyan-950/50 text-cyan-300">
                    <Icon size={19} />
                  </span>
                  <span className="text-sm text-slate-200">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Authentication card */}
        <section className="mx-auto w-full max-w-md rounded-xl border border-slate-200 bg-gradient-to-br from-white to-[#f5f9ff] p-5 shadow-[0_15px_60px_#00000035] sm:p-7 md:mx-0">
          {/* Login and Signup tabs */}
          <div className="mb-5 flex gap-7 border-b border-sky-100">
            {["login", ...(isAdminLogin ? [] : ["signup"])].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => switchTab(tab)}
                className={`relative pb-3 text-xs font-bold capitalize transition ${
                  activeTab === tab
                    ? "text-sky-900"
                    : "text-slate-500 hover:text-sky-700"
                }`}
              >
                {tab === "login" ? "Login" : "Sign Up"}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-cyan-500" />
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            {activeTab === "signup" && (
              <label className="block text-xs font-semibold text-slate-700">
                Full Name
                <span className="text-rose-500"> *</span>
                <input
                  required
                  name="fullName"
                  value={form.fullName}
                  onChange={updateField}
                  placeholder="Enter your name"
                  autoComplete="name"
                  className="mt-1.5 w-full rounded-lg border border-sky-100 bg-white px-3 py-3 text-xs font-normal outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
              </label>
            )}

            {/* Email */}
            <label className="block text-xs font-semibold text-slate-700">
              Email <span className="text-rose-500">*</span>
              <input
                required
                type="email"
                name="email"
                value={form.email}
                onChange={updateField}
                placeholder="Enter your email"
                autoComplete="email"
                className="mt-1.5 w-full rounded-lg border border-sky-100 bg-white px-3 py-3 text-xs font-normal outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
            </label>

            {/* Password */}
            <label className="block text-xs font-semibold text-slate-700">
              Password <span className="text-rose-500">*</span>
              <span className="relative block">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={updateField}
                  placeholder={
                    activeTab === "signup"
                      ? "Create a password"
                      : "Enter your password"
                  }
                  autoComplete={
                    activeTab === "signup" ? "new-password" : "current-password"
                  }
                  minLength={8}
                  className="mt-1.5 w-full rounded-lg border border-sky-100 bg-white px-3 py-3 pr-11 text-xs font-normal outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-sky-700"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>

            {/* Role selection */}
            {activeTab === "signup" && (
              <label className="flex cursor-pointer items-start gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => {
                    setAgree(e.target.checked);
                    setMessage("");
                  }}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-cyan-500"
                />
                <span>
                  I agree to the{" "}
                  <a
                    href="/terms"
                    className="font-semibold text-sky-700 underline underline-offset-2"
                  >
                    Terms &amp; Conditions
                  </a>
                </span>
              </label>
            )}

            {activeTab === "login" && (
              <div className="flex justify-end">
                <a
                  href="/forgot-password"
                  className="text-xs font-semibold text-sky-700 hover:text-cyan-600"
                >
                  Forgot password?
                </a>
              </div>
            )}

            {message && (
              <div role="alert" className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-xs leading-5 text-rose-800">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg border border-cyan-400 bg-cyan-500 px-4 py-3.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : activeTab === "signup"
                  ? "Create Account"
                  : "Login"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-500">
            {activeTab === "signup"
              ? "Already have an account? "
              : isAdminLogin
                ? ""
                : "Don't have an account? "}
            {!isAdminLogin && <button
              type="button"
              onClick={() =>
                switchTab(activeTab === "signup" ? "login" : "signup")
              }
              className="font-bold text-sky-700 hover:text-cyan-600"
            >
              {activeTab === "signup" ? "Login" : "Sign Up"}
            </button>}
          </p>
        </section>
      </div>

      {/* Bottom tagline */}
      <div className="pointer-events-none absolute bottom-3 left-0 z-10 w-full px-4 text-center">
        <p className="flex items-center justify-center gap-2 text-[10px] font-semibold tracking-widest text-cyan-300 sm:gap-3 sm:text-xs">
          <Mountain size={15} />
          Learn <span className="text-slate-500">|</span> Build
          <span className="text-slate-500">|</span> Secure
          <span className="text-slate-500">|</span> Grow
        </p>
      </div>
    </main>
  );
}

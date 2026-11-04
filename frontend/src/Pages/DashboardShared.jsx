import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, LogOut } from "lucide-react";
import { apiFetch } from "../lib/api";

export function DashboardLayout({ role, user, children }) {
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState("");

  async function logout() {
    setLogoutError("");
    try {
      await apiFetch("/auth/logout", { method: "POST" });
      navigate("/login", { replace: true });
    } catch (error) {
      setLogoutError(error.message);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7faff] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-cyan-700">
              AskYRA Tech · {role} dashboard
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Welcome, {user?.companyName || user?.name}
            </h1>
            <p className="mt-1.5 text-sm text-slate-600">{user?.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-md border border-sky-200 bg-white px-3 py-2 text-xs font-bold text-sky-800 hover:bg-sky-50"
            >
              Back to website <ArrowRight size={14} />
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </header>
        {logoutError && (
          <p role="alert" className="mb-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
            {logoutError}
          </p>
        )}
        {children}
      </div>
    </main>
  );
}

export function DashboardLoading({ error, onRetry }) {
  return (
    <section className="rounded-xl border border-sky-100 bg-white p-8 text-center">
      <h2 className="font-bold text-slate-900">
        {error ? "Could not load dashboard" : "Loading dashboard…"}
      </h2>
      {error && <p role="alert" className="mt-2 text-sm text-rose-700">{error}</p>}
      {error && (
        <button onClick={onRetry} className="mt-4 rounded-md bg-sky-700 px-4 py-2 text-xs font-bold text-white">
          Try again
        </button>
      )}
    </section>
  );
}

export function DashboardSection({ title, children }) {
  return (
    <section className="rounded-xl border border-sky-100 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-4 text-sm font-extrabold text-slate-900 sm:text-base">{title}</h2>
      {children}
    </section>
  );
}

export function Metric({ title, value }) {
  return (
    <article className="rounded-xl border border-sky-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-extrabold text-slate-900">{value}</p>
    </article>
  );
}

export function Progress({ value }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2 min-w-20 flex-1 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-600 to-cyan-500"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-9 text-right text-[11px] font-bold text-sky-800">{value}%</span>
    </div>
  );
}

export function PaymentStatus({ status }) {
  const classes = {
    paid: "bg-emerald-50 text-emerald-700",
    active: "bg-emerald-50 text-emerald-700",
    completed: "bg-emerald-50 text-emerald-700",
    in_progress: "bg-sky-50 text-sky-700",
    reviewing: "bg-sky-50 text-sky-700",
    pending: "bg-amber-50 text-amber-700",
    pending_payment: "bg-amber-50 text-amber-700",
    submitted: "bg-amber-50 text-amber-700",
    failed: "bg-rose-50 text-rose-700",
    cancelled: "bg-slate-100 text-slate-700",
    rejected: "bg-rose-50 text-rose-700",
  };
  const label = status.replaceAll("_", " ");
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${classes[status] ?? classes.pending}`}>
      {label}
    </span>
  );
}

export function formatNPR(amount) {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 2,
  }).format(amount);
}

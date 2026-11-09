import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";
import { apiFetch } from "../lib/api";

const services = [
  "Penetration Testing & Vulnerability Assessment",
  "IDS/IPS Implementation",
  "Security Awareness Training",
  "Custom Websites",
  "E-Commerce Platforms",
  "Secure Web Applications",
  "Search Engine Optimization",
  "Social Media Marketing",
  "Email Marketing",
  "Campaign Analytics",
];

const inputClass =
  "mt-1.5 w-full rounded-md border border-sky-100 bg-white px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100";

export default function ServiceRequest() {
  const [searchParams] = useSearchParams();
  const requestedService = searchParams.get("service") ?? "";
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [form, setForm] = useState({
    contactPerson: "",
    phone: "",
    service: services.includes(requestedService) ? requestedService : "",
    details: "",
  });
  const [submittedRequest, setSubmittedRequest] = useState(null);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let active = true;
    apiFetch("/auth/me")
      .then(({ user: currentUser }) => {
        if (!active) return;
        setUser(currentUser);
        if (currentUser?.role === "company") {
          setForm((current) => ({
            ...current,
            contactPerson: current.contactPerson || currentUser.name,
          }));
        }
      })
      .catch((error) => {
        if (active) setAuthError(error.message);
      })
      .finally(() => {
        if (active) setLoadingUser(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submitRequest(event) {
    event.preventDefault();
    setSubmitError("");
    try {
      const { serviceRequest } = await apiFetch("/service-requests", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSubmittedRequest(serviceRequest);
    } catch (error) {
      setSubmitError(error.message);
    }
  }

  return (
    <main className="min-h-[70vh] bg-[#f7faff] px-4 py-8 sm:px-6 sm:py-12">
      <section className="mx-auto max-w-2xl rounded-xl border border-sky-100 bg-white p-5 shadow-sm sm:p-8">
        <Link
          to="/services"
          className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-sky-700 hover:text-cyan-700"
        >
          <ArrowLeft size={15} />
          Back to Services
        </Link>

        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-cyan-700">
            AskYRA Tech
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
            Request a Service
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Tell us about your business and project. Our team will review your
            requirements and follow up.
          </p>
        </div>

        {loadingUser ? (
          <p className="rounded-lg bg-sky-50 p-4 text-sm text-slate-600">
            Checking your company account…
          </p>
        ) : user?.role !== "company" ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900">
            <h2 className="font-bold">Company account required</h2>
            <p className="mt-2 text-sm leading-6">
              Sign in or create a company account before submitting a request.
              {authError && authError !== "Sign in to continue."
                ? ` ${authError}`
                : ""}
            </p>
            <Link
              to="/login/company"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-sky-700 px-4 py-2 text-xs font-bold text-white"
            >
              Continue as a company <ArrowRight size={14} />
            </Link>
          </div>
        ) : submittedRequest ? (
          <div
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-emerald-800"
          >
            <CheckCircle2 size={26} className="mb-2" />
            <h2 className="font-bold">Service request submitted!</h2>
            <p className="mt-2 text-sm leading-6">
              Request reference: {submittedRequest._id}. You can follow updates
              from your company dashboard.
            </p>
            <Link
              to="/dashboard/company"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-sky-800 hover:text-cyan-700"
            >
              Return to services <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <form onSubmit={submitRequest} className="space-y-4">
            <p className="rounded-lg bg-sky-50 p-3 text-xs text-slate-600">
              Submitting as <strong>{user?.companyName || user?.name}</strong> ·{" "}
              {user?.email}
            </p>
            <label className="block text-xs font-semibold text-slate-700">
              Contact person <span className="text-rose-500">*</span>
              <input
                required
                name="contactPerson"
                value={form.contactPerson}
                onChange={updateForm}
                autoComplete="name"
                placeholder="Enter your name"
                className={inputClass}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-semibold text-slate-700">
                Phone <span className="text-rose-500">*</span>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={updateForm}
                  autoComplete="tel"
                  placeholder="Enter phone number"
                  className={inputClass}
                />
              </label>
            </div>

            <label className="block text-xs font-semibold text-slate-700">
              Service needed <span className="text-rose-500">*</span>
              <span className="relative block">
                <select
                  required
                  name="service"
                  value={form.service}
                  onChange={updateForm}
                  className={`${inputClass} appearance-none pr-9 ${
                    form.service ? "" : "text-slate-400"
                  }`}
                >
                  <option value="" disabled>
                    Select a service
                  </option>
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </span>
            </label>

            <label className="block text-xs font-semibold text-slate-700">
              Project details <span className="text-rose-500">*</span>
              <textarea
                required
                name="details"
                value={form.details}
                onChange={updateForm}
                rows={5}
                placeholder="Describe your goals, requirements, and timeline..."
                className={`${inputClass} min-h-28 resize-y`}
              />
            </label>

            {submitError && (
              <p
                role="alert"
                className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800"
              >
                {submitError}
              </p>
            )}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-500 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2"
            >
              Submit Request <ArrowRight size={16} />
            </button>
            <p className="text-center text-[11px] leading-5 text-slate-500">
              Demo form only. No data is sent to a server.
            </p>
          </form>
        )}
      </section>
    </main>
  );
}

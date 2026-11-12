import { useState } from "react";
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
  const [form, setForm] = useState({
    companyName: "",
    email: "",
    phone: "",
    contactPerson: "",
    contactEmail: "",
    position: "",
    service: services.includes(requestedService) ? requestedService : "",
  });
  const [submittedRequest, setSubmittedRequest] = useState(null);
  const [submitError, setSubmitError] = useState("");

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
            Share your company and contact details. Our team will review your
            request and follow up.
          </p>
        </div>

        {submittedRequest ? (
          <div
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-emerald-800"
          >
            <CheckCircle2 size={26} className="mb-2" />
            <h2 className="font-bold">Service request submitted!</h2>
            <p className="mt-2 text-sm leading-6">
              Request reference: {submittedRequest._id}. Our team will contact
              you at {submittedRequest.email}.
            </p>
            <Link
              to="/services"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-sky-800 hover:text-cyan-700"
            >
              Explore more services <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <form onSubmit={submitRequest} className="space-y-4">
            <label className="block text-xs font-semibold text-slate-700">
              Company name <span className="text-rose-500">*</span>
              <input
                required
                name="companyName"
                value={form.companyName}
                onChange={updateForm}
                autoComplete="organization"
                placeholder="Enter company name"
                className={inputClass}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-semibold text-slate-700">
                Company email <span className="text-rose-500">*</span>
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={updateForm}
                  autoComplete="email"
                  placeholder="name@company.com"
                  className={inputClass}
                />
              </label>
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

            <h2 className="border-t border-sky-100 pt-4 text-sm font-bold text-slate-800">
              Person taking the service
            </h2>
            <label className="block text-xs font-semibold text-slate-700">
              Name <span className="text-rose-500">*</span>
              <input
                required
                name="contactPerson"
                value={form.contactPerson}
                onChange={updateForm}
                autoComplete="name"
                placeholder="Enter their name"
                className={inputClass}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-semibold text-slate-700">
                Email <span className="text-rose-500">*</span>
                <input
                  required
                  type="email"
                  name="contactEmail"
                  value={form.contactEmail}
                  onChange={updateForm}
                  autoComplete="email"
                  placeholder="name@example.com"
                  className={inputClass}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Position <span className="text-rose-500">*</span>
                <input
                  required
                  name="position"
                  value={form.position}
                  onChange={updateForm}
                  autoComplete="organization-title"
                  placeholder="Enter their position"
                  className={inputClass}
                />
              </label>
            </div>

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
          </form>
        )}
      </section>
    </main>
  );
}

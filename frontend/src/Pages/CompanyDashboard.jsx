import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";
import {
  DashboardLayout,
  DashboardLoading,
  DashboardSection,
  formatNPR,
  Metric,
  PaymentStatus,
  Progress,
} from "./DashboardShared";

function submitEsewa(checkout) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = checkout.url;
  Object.entries(checkout.fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

export default function CompanyDashboard({ user }) {
  const [data, setData] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState({});
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [dashboard, { methods }] = await Promise.all([
        apiFetch("/dashboard/company"),
        apiFetch("/payments/methods"),
      ]);
      setData(dashboard);
      setPaymentMethods(methods);
    } catch (loadError) {
      setError(loadError.message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function pay(payment) {
    setError("");
    setNotice("");
    setBusy(payment._id);
    try {
      const result = await apiFetch(`/payments/${payment._id}/checkout`, {
        method: "POST",
        body: JSON.stringify({ paymentMethod: defaultPaymentMethod(payment) }),
      });
      if (result.checkoutUrl) return window.location.assign(result.checkoutUrl);
      if (result.checkout?.provider === "esewa") return submitEsewa(result.checkout);
      setNotice(result.bankTransfer?.instructions ?? "Payment is pending verification.");
      await load();
    } catch (paymentError) {
      setError(paymentError.message);
    } finally {
      setBusy("");
    }
  }

  if (!data) return <DashboardLoading error={error} onRetry={load} />;

  const active = data.serviceRequests.filter(
    (item) => ["submitted", "reviewing", "in_progress"].includes(item.status),
  );
  const average = active.length
    ? Math.round(active.reduce((sum, item) => sum + item.progress, 0) / active.length)
    : 0;
  const unpaid = data.payments
    .filter((payment) => ["pending", "failed"].includes(payment.status))
    .reduce((sum, payment) => sum + payment.amountNPR, 0);
  const defaultPaymentMethod = (payment) => {
    const selected = paymentMethods.find((method) => method.value === paymentMethod[payment._id] && method.enabled);
    if (selected) return selected.value;
    const current = paymentMethods.find((method) => method.value === payment.provider && method.enabled);
    return current?.value ?? paymentMethods.find((method) => method.enabled)?.value ?? "";
  };

  return (
    <DashboardLayout role="Company" user={user}>
      {error && <p role="alert" className="mb-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
      {notice && <p role="status" className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">{notice}</p>}
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric title="Service requests" value={data.serviceRequests.length} />
        <Metric title="Active services" value={active.length} />
        <Metric title="Average progress" value={`${average}%`} />
        <Metric title="Unpaid invoices" value={formatNPR(unpaid)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <DashboardSection title="Services and project progress">
          {data.serviceRequests.length === 0 ? (
            <p className="text-sm text-slate-500">
              No service requests yet. <Link className="font-bold text-sky-700" to="/service-request">Submit a request</Link>.
            </p>
          ) : (
            <div className="space-y-3">
              {data.serviceRequests.map((service) => (
                <article key={service._id} className="rounded-lg border border-sky-100 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{service.service}</h3>
                      <p className="mt-1 text-[11px] text-slate-500">Contact: {service.contactPerson} · {service.phone}</p>
                    </div>
                    <PaymentStatus status={service.status} />
                  </div>
                  {service.priceNPR != null && <p className="mt-2 text-xs font-bold text-slate-700">Quoted: {formatNPR(service.priceNPR)}</p>}
                  <div className="mt-4"><Progress value={service.progress} /></div>
                  <p className="mt-3 text-xs text-slate-600">Milestone: {service.milestone}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{service.details}</p>
                  {service.updates?.length > 0 && (
                    <ul className="mt-3 space-y-1 border-t border-sky-100 pt-3 text-[11px] text-slate-500">
                      {service.updates.map((update, index) => <li key={`${update.createdAt}-${index}`}>{update.message}</li>)}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          )}
          <Link to="/service-request" className="mt-4 inline-flex rounded-md bg-sky-700 px-3 py-2 text-xs font-bold text-white hover:bg-sky-800">
            Request another service
          </Link>
        </DashboardSection>

        <DashboardSection title="Invoices and payments">
          {data.payments.length === 0 ? (
            <p className="text-sm text-slate-500">Invoices will appear when the service team prepares a quote.</p>
          ) : (
            <div className="space-y-3">
              {data.payments.map((payment) => (
                <article key={payment._id} className="rounded-lg border border-sky-100 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{payment.description}</p>
                      <p className="mt-1 text-[10px] text-slate-500">{payment.invoiceNumber} · {payment.provider}</p>
                    </div>
                    <PaymentStatus status={payment.status} />
                  </div>
                  <p className="mt-2 text-sm font-extrabold text-slate-900">{formatNPR(payment.amountNPR)}</p>
                  {["pending", "failed"].includes(payment.status) && (
                    <div className="mt-3 space-y-2">
                      <select
                        aria-label={`Payment method for ${payment.invoiceNumber}`}
                        value={defaultPaymentMethod(payment)}
                        onChange={(event) => setPaymentMethod((current) => ({ ...current, [payment._id]: event.target.value }))}
                        className="w-full rounded-md border border-sky-100 bg-white px-2 py-2 text-xs"
                      >
                        {paymentMethods.map((method) => (
                          <option key={method.value} value={method.value} disabled={!method.enabled}>
                            {method.label}{!method.enabled ? " (not configured)" : ""}
                          </option>
                        ))}
                      </select>
                      <button onClick={() => void pay(payment)} disabled={busy === payment._id || !defaultPaymentMethod(payment)} className="w-full rounded-md bg-sky-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">
                        {busy === payment._id ? "Starting…" : payment.status === "failed" ? "Retry payment" : "Pay invoice"}
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </DashboardSection>
      </div>
    </DashboardLayout>
  );
}

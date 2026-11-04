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
  for (const [name, value] of Object.entries(checkout.fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

export default function StudentDashboard({ user }) {
  const [data, setData] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [busyPayment, setBusyPayment] = useState("");
  const [paymentMethod, setPaymentMethod] = useState({});

  const load = useCallback(async () => {
    setError("");
    try {
      const [dashboard, { methods }] = await Promise.all([
        apiFetch("/dashboard/student"),
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
    setActionMessage("");
    setBusyPayment(payment._id);
    try {
      const method = defaultPaymentMethod(payment);
      const result = await apiFetch(`/payments/${payment._id}/checkout`, {
        method: "POST",
        body: JSON.stringify({ paymentMethod: method }),
      });
      if (result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
        return;
      }
      if (result.checkout?.provider === "esewa") {
        submitEsewa(result.checkout);
        return;
      }
      setActionMessage(result.bankTransfer?.instructions ?? "Payment is pending verification.");
      await load();
    } catch (paymentError) {
      setError(paymentError.message);
    } finally {
      setBusyPayment("");
    }
  }

  if (!data) return <DashboardLoading error={error} onRetry={load} />;

  const activeEnrollments = data.enrollments.filter(
    (enrollment) => enrollment.status === "active" || enrollment.status === "completed",
  );
  const averageProgress = activeEnrollments.length
    ? Math.round(activeEnrollments.reduce((sum, item) => sum + item.progress, 0) / activeEnrollments.length)
    : 0;
  const outstanding = data.payments
    .filter((payment) => ["pending", "failed"].includes(payment.status))
    .reduce((sum, payment) => sum + payment.amountNPR, 0);
  const defaultPaymentMethod = (payment) => {
    const selected = paymentMethods.find((method) => method.value === paymentMethod[payment._id] && method.enabled);
    if (selected) return selected.value;
    const current = paymentMethods.find((method) => method.value === payment.provider && method.enabled);
    return current?.value ?? paymentMethods.find((method) => method.enabled)?.value ?? "";
  };

  return (
    <DashboardLayout role="Student" user={user}>
      {error && <p role="alert" className="mb-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
      {actionMessage && <p role="status" className="mb-4 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">{actionMessage}</p>}

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric title="Enrolled courses" value={data.enrollments.length} />
        <Metric title="Average progress" value={`${averageProgress}%`} />
        <Metric title="Completed courses" value={data.enrollments.filter((item) => item.status === "completed").length} />
        <Metric title="Unpaid amount" value={formatNPR(outstanding)} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <DashboardSection title="My courses">
          {data.enrollments.length === 0 ? (
            <p className="text-sm text-slate-500">
              No courses yet. <Link className="font-bold text-sky-700" to="/courses">Browse the catalog</Link>.
            </p>
          ) : (
            <div className="space-y-3">
              {data.enrollments.map((enrollment) => (
                <article key={enrollment._id} className="rounded-lg border border-sky-100 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{enrollment.courseTitle}</h3>
                      <p className="mt-1 text-[11px] text-slate-500">{enrollment.category} · {formatNPR(enrollment.amountNPR)}</p>
                    </div>
                    <PaymentStatus status={enrollment.status} />
                  </div>
                  {enrollment.status !== "pending_payment" && (
                    <>
                      <div className="mt-4"><Progress value={enrollment.progress} /></div>
                      <p className="mt-3 text-xs text-slate-600">Next lesson: {enrollment.nextLesson}</p>
                    </>
                  )}
                  {enrollment.status === "pending_payment" && (
                    <p className="mt-3 text-xs text-slate-600">Complete payment to activate this enrollment.</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </DashboardSection>

        <DashboardSection title="Payment history">
          {data.payments.length === 0 ? (
            <p className="text-sm text-slate-500">No payments yet.</p>
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
                      <label className="block text-[10px] font-semibold text-slate-600">
                        Payment method
                        <select
                          value={defaultPaymentMethod(payment)}
                          onChange={(event) => setPaymentMethod((current) => ({ ...current, [payment._id]: event.target.value }))}
                          className="mt-1 w-full rounded-md border border-sky-100 bg-white px-2 py-2 text-xs"
                        >
                          {paymentMethods.map((method) => (
                            <option key={method.value} value={method.value} disabled={!method.enabled}>
                              {method.label}{!method.enabled ? " (not configured)" : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        onClick={() => void pay(payment)}
                        disabled={busyPayment === payment._id || !defaultPaymentMethod(payment)}
                        className="w-full rounded-md bg-sky-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                      >
                        {busyPayment === payment._id ? "Starting…" : payment.status === "failed" ? "Retry payment" : "Continue to payment"}
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

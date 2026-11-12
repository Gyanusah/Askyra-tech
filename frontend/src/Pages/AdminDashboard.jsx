import { useCallback, useEffect, useState } from "react";
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

function Table({ headers, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-left text-xs">
        <thead className="border-b border-sky-100 text-[10px] uppercase tracking-wide text-slate-500">
          <tr>{headers.map((header) => <th key={header} className="px-3 py-3">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-sky-50">{children}</tbody>
      </table>
    </div>
  );
}

export default function AdminDashboard({ user }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [progressValues, setProgressValues] = useState({});
  const [milestones, setMilestones] = useState({});
  const [quotes, setQuotes] = useState({});
  const [paymentNotes, setPaymentNotes] = useState({});
  const [messages, setMessages] = useState({});

  const load = useCallback(async () => {
    setError("");
    try {
      setData(await apiFetch("/dashboard/admin"));
    } catch (loadError) {
      setError(loadError.message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function performAction(key, path, body, successMessage) {
    setError("");
    setMessages({});
    setBusy(key);
    try {
      await apiFetch(path, { method: "PATCH", body: JSON.stringify(body) });
      setMessages({ [key]: successMessage });
      await load();
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusy("");
    }
  }

  async function issueInvoice(service) {
    const key = `invoice-${service._id}`;
    setError("");
    setBusy(key);
    try {
      const amountNPR = Number(quotes[service._id]);
      await apiFetch(`/admin/service-requests/${service._id}/invoice`, {
        method: "POST",
        body: JSON.stringify({ amountNPR }),
      });
      setMessages({ [key]: "Invoice created and added to the company's dashboard." });
      await load();
    } catch (invoiceError) {
      setError(invoiceError.message);
    } finally {
      setBusy("");
    }
  }

  if (!data) return <DashboardLoading error={error} onRetry={load} />;

  const recentUsers = data.users;
  const recentPayments = data.payments;

  return (
    <DashboardLayout role="Admin" user={user}>
      {error && <p role="alert" className="mb-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Metric title="Student accounts" value={data.counts.students} />
        <Metric title="Company accounts" value={data.counts.companies} />
        <Metric title="Active enrollments" value={data.counts.activeEnrollments} />
        <Metric title="Active service projects" value={data.counts.activeServices} />
        <Metric title="Paid invoices" value={data.counts.paidPayments} />
        <Metric title="Payments awaiting review" value={data.counts.pendingPayments} />
      </div>

      <div className="space-y-5">
        <DashboardSection title={`Student accounts (${recentUsers.filter((item) => item.role === "student").length})`}>
          <Table headers={["Student", "Email", "Phone", "Joined", "Status"]}>
            {recentUsers.filter((item) => item.role === "student").map((student) => (
              <tr key={student.id}>
                <td className="px-3 py-3 font-bold text-slate-800">{student.name}</td>
                <td className="px-3 py-3 text-slate-600">{student.email}</td>
                <td className="px-3 py-3 text-slate-600">{student.phone || "—"}</td>
                <td className="px-3 py-3 text-slate-600">{new Date(student.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-3"><PaymentStatus status={student.isActive ? "active" : "cancelled"} /></td>
              </tr>
            ))}
          </Table>
        </DashboardSection>

        <DashboardSection title={`Company accounts (${recentUsers.filter((item) => item.role === "company").length})`}>
          <Table headers={["Company", "Account contact", "Email", "Phone", "Joined", "Status"]}>
            {recentUsers.filter((item) => item.role === "company").map((company) => (
              <tr key={company.id}>
                <td className="px-3 py-3 font-bold text-slate-800">{company.companyName || company.name}</td>
                <td className="px-3 py-3 text-slate-600">{company.name}</td>
                <td className="px-3 py-3 text-slate-600">{company.email}</td>
                <td className="px-3 py-3 text-slate-600">{company.phone || "—"}</td>
                <td className="px-3 py-3 text-slate-600">{new Date(company.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-3"><PaymentStatus status={company.isActive ? "active" : "cancelled"} /></td>
              </tr>
            ))}
          </Table>
        </DashboardSection>

        <DashboardSection title="Course enrollments and progress">
          <Table headers={["Student", "Course", "Amount", "Progress", "Next lesson", "Status", "Update"]}>
            {data.enrollments.map((enrollment) => {
              const student = recentUsers.find((item) => item.id === String(enrollment.user));
              const key = `enrollment-${enrollment._id}`;
              return (
                <tr key={enrollment._id}>
                  <td className="px-3 py-3 text-slate-700">{student?.name ?? "Account removed"}</td>
                  <td className="px-3 py-3 font-semibold text-slate-800">{enrollment.courseTitle}</td>
                  <td className="px-3 py-3">{formatNPR(enrollment.amountNPR)}</td>
                  <td className="px-3 py-3"><Progress value={enrollment.progress} /></td>
                  <td className="px-3 py-3 text-slate-600">{enrollment.nextLesson}</td>
                  <td className="px-3 py-3"><PaymentStatus status={enrollment.status} /></td>
                  <td className="px-3 py-3">
                    <form
                      className="flex min-w-48 gap-1"
                      onSubmit={(event) => {
                        event.preventDefault();
                        void performAction(key, `/admin/enrollments/${enrollment._id}/progress`, {
                          progress: Number(progressValues[enrollment._id] ?? enrollment.progress),
                        }, "Progress saved.");
                      }}
                    >
                      <input
                        type="number"
                        min="0"
                        max="100"
                        aria-label={`Progress for ${enrollment.courseTitle}`}
                        value={progressValues[enrollment._id] ?? enrollment.progress}
                        onChange={(event) => setProgressValues((current) => ({ ...current, [enrollment._id]: event.target.value }))}
                        className="w-16 rounded border border-sky-100 px-2 py-1"
                        disabled={enrollment.status === "pending_payment"}
                      />
                      <button disabled={busy === key || enrollment.status === "pending_payment"} className="rounded bg-sky-700 px-2 py-1 font-bold text-white disabled:opacity-50">
                        Save
                      </button>
                    </form>
                    {messages[key] && <p role="status" className="mt-1 text-[10px] text-emerald-700">{messages[key]}</p>}
                  </td>
                </tr>
              );
            })}
          </Table>
        </DashboardSection>

        <DashboardSection title="Company service requests">
          <div className="space-y-3">
            {data.serviceRequests.map((service) => {
              const company = recentUsers.find((item) => item.id === String(service.user));
              const key = `service-${service._id}`;
              return (
                <article key={service._id} className="rounded-lg border border-sky-100 p-4">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{service.service}</h3>
                      <p className="mt-1 text-xs text-slate-600">{service.companyName} · {service.contactPerson}</p>
                      <p className="text-[11px] text-slate-500">{service.email} · {service.phone}</p>
                      <p className="text-[11px] text-slate-500">{service.contactEmail} · {service.position}</p>
                    </div>
                    <PaymentStatus status={service.status} />
                  </div>
                  {service.details && <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-slate-600">{service.details}</p>}
                  <div className="mt-3"><Progress value={service.progress} /></div>
                  <p className="mt-2 text-[11px] text-slate-500">Milestone: {service.milestone} · Account: {company?.email ?? "—"}</p>
                  <form
                    className="mt-4 grid gap-2 border-t border-sky-100 pt-4 sm:grid-cols-2 lg:grid-cols-5"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void performAction(key, `/admin/service-requests/${service._id}`, {
                        progress: Number(progressValues[service._id] ?? service.progress),
                        status: service.status,
                        milestone: milestones[service._id] || service.milestone,
                        update: milestones[service._id] ? `Milestone updated: ${milestones[service._id]}` : "Project progress updated.",
                      }, "Service update saved.");
                    }}
                  >
                    <input
                      type="number"
                      min="0"
                      max="100"
                      aria-label={`Progress for ${service.service}`}
                      value={progressValues[service._id] ?? service.progress}
                      onChange={(event) => setProgressValues((current) => ({ ...current, [service._id]: event.target.value }))}
                      className="rounded border border-sky-100 px-2 py-2 text-xs"
                    />
                    <select
                      aria-label={`Status for ${service.service}`}
                      value={service.status}
                      onChange={(event) => {
                        void performAction(key, `/admin/service-requests/${service._id}`, {
                          status: event.target.value,
                          progress: service.progress,
                        }, "Service status updated.");
                      }}
                      className="rounded border border-sky-100 bg-white px-2 py-2 text-xs"
                    >
                      {["submitted", "reviewing", "in_progress", "completed", "rejected"].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
                    </select>
                    <input
                      aria-label={`Next milestone for ${service.service}`}
                      placeholder="Next milestone"
                      value={milestones[service._id] ?? service.milestone}
                      onChange={(event) => setMilestones((current) => ({ ...current, [service._id]: event.target.value }))}
                      className="rounded border border-sky-100 px-2 py-2 text-xs"
                    />
                    <button disabled={busy === key} className="rounded bg-sky-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Save update</button>
                    <span className="text-[10px] text-slate-500">{messages[key]}</span>
                  </form>
                  {service.user ? <form
                    className="mt-3 flex flex-wrap items-center gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void issueInvoice(service);
                    }}
                  >
                    <label className="text-[11px] text-slate-600">
                      Create NPR invoice
                      <input
                        required
                        min="1"
                        type="number"
                        value={quotes[service._id] ?? service.priceNPR ?? ""}
                        onChange={(event) => setQuotes((current) => ({ ...current, [service._id]: event.target.value }))}
                        className="ml-2 w-28 rounded border border-sky-100 px-2 py-1.5"
                      />
                    </label>
                    <button disabled={busy === `invoice-${service._id}`} className="rounded border border-sky-200 px-3 py-1.5 text-[11px] font-bold text-sky-800 disabled:opacity-50">
                      {busy === `invoice-${service._id}` ? "Creating…" : "Issue invoice"}
                    </button>
                    {messages[`invoice-${service._id}`] && <span role="status" className="text-[10px] text-emerald-700">{messages[`invoice-${service._id}`]}</span>}
                  </form> : <p className="mt-3 text-[11px] text-slate-500">Invoice creation is available for requests linked to a company account.</p>}
                </article>
              );
            })}
            {data.serviceRequests.length === 0 && <p className="text-sm text-slate-500">No service requests have been submitted.</p>}
          </div>
        </DashboardSection>

        <DashboardSection title="Payments and bank transfer review">
          <Table headers={["Invoice", "Account", "Description", "Amount", "Method", "Status", "Action"]}>
            {recentPayments.map((payment) => {
              const account = recentUsers.find((item) => item.id === String(payment.user));
              const key = `payment-${payment._id}`;
              return (
                <tr key={payment._id}>
                  <td className="px-3 py-3 font-semibold">{payment.invoiceNumber}</td>
                  <td className="px-3 py-3 text-slate-600">{account?.email ?? "Account removed"}</td>
                  <td className="px-3 py-3 text-slate-600">{payment.description}</td>
                  <td className="px-3 py-3 font-bold">{formatNPR(payment.amountNPR)}</td>
                  <td className="px-3 py-3">{payment.provider}</td>
                  <td className="px-3 py-3"><PaymentStatus status={payment.status} /></td>
                  <td className="px-3 py-3">
                    {payment.provider === "bank_transfer" && payment.status === "pending" ? (
                      <div className="min-w-40">
                        <input
                          required
                          aria-label={`Verification note for ${payment.invoiceNumber}`}
                          placeholder="Verification note"
                          value={paymentNotes[payment._id] ?? ""}
                          onChange={(event) => setPaymentNotes((current) => ({ ...current, [payment._id]: event.target.value }))}
                          className="mb-1 w-full rounded border border-sky-100 px-2 py-1"
                        />
                        <button
                          onClick={() => void performAction(key, `/admin/payments/${payment._id}/bank-transfer`, {
                            status: "paid",
                            note: paymentNotes[payment._id] ?? "",
                          }, "Bank transfer verified.")}
                          disabled={busy === key}
                          className="rounded bg-emerald-700 px-2 py-1 font-bold text-white disabled:opacity-50"
                        >
                          Verify transfer
                        </button>
                      </div>
                    ) : "—"}
                    {messages[key] && <p role="status" className="mt-1 text-[10px] text-emerald-700">{messages[key]}</p>}
                  </td>
                </tr>
              );
            })}
          </Table>
        </DashboardSection>
      </div>
    </DashboardLayout>
  );
}

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { apiFetch } from "../lib/api";

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

export default function Register() {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(
    searchParams.get("courseId") ?? "",
  );
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([apiFetch("/courses"), apiFetch("/payments/methods")])
      .then(([{ courses: availableCourses }, { methods }]) => {
        if (!active) return;
        setCourses(availableCourses);
        setPaymentMethods(methods);
        setPaymentMethod(methods.find((method) => method.enabled)?.value ?? "");
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoadingCourses(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function submitCourse(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      let currentPaymentId = paymentId;
      if (!currentPaymentId) {
        const enrollmentResult = await apiFetch("/enrollments", {
          method: "POST",
          body: JSON.stringify({ courseId: selectedCourse, paymentMethod }),
        });
        currentPaymentId = enrollmentResult.payment._id;
        setPaymentId(currentPaymentId);
      }

      const checkout = await apiFetch(`/payments/${currentPaymentId}/checkout`, {
        method: "POST",
        body: JSON.stringify({ paymentMethod }),
      });
      if (checkout.checkoutUrl) {
        window.location.assign(checkout.checkoutUrl);
        return;
      }
      if (checkout.checkout?.provider === "esewa") {
        submitEsewa(checkout.checkout);
        return;
      }
      setSuccess(
        `${checkout.bankTransfer.reference}: ${checkout.bankTransfer.instructions}`,
      );
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  const course = courses.find((item) => item.id === selectedCourse);

  return (
    <main className="min-h-[65vh] bg-[#f7faff] px-4 py-8 sm:px-6 sm:py-12">
      <section className="mx-auto max-w-2xl rounded-xl border border-sky-100 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-cyan-700">
            AskYRA Tech
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
            Course enrollment
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Choose a course and payment method. Sign in as a student before
            enrolling.
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-4 rounded-lg border border-rose-100 bg-rose-50 p-3 text-xs leading-5 text-rose-800">
            <p>{error}</p>
            {(error.toLowerCase().includes("sign in") ||
              error.toLowerCase().includes("not allowed")) && (
              <Link to="/login/student" className="mt-2 inline-flex font-bold underline">
                Sign in to continue
              </Link>
            )}
          </div>
        )}

        {success && (
          <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={21} className="mb-2" />
            <p className="text-sm font-bold">Enrollment created</p>
            <p className="mt-1 text-xs leading-5">{success}</p>
            <Link to="/dashboard/student" className="mt-3 inline-flex items-center gap-2 text-xs font-bold">
              View student dashboard <ArrowRight size={14} />
            </Link>
          </div>
        )}

        <form onSubmit={submitCourse} className="space-y-5">
          <label className="block text-xs font-semibold text-slate-700">
            Select course <span className="text-rose-500">*</span>
            <select
              required
              value={selectedCourse}
              onChange={(event) => {
                setSelectedCourse(event.target.value);
                setPaymentId("");
              }}
              disabled={loadingCourses || Boolean(paymentId)}
              className="mt-1.5 w-full rounded-md border border-sky-100 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-50"
            >
              <option value="" disabled>
                {loadingCourses ? "Loading courses…" : "Choose a course"}
              </option>
              {courses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} · NPR {item.priceNPR}
                </option>
              ))}
            </select>
          </label>

          {course && (
            <div className="rounded-lg border border-sky-100 bg-sky-50/60 p-4">
              <p className="text-sm font-bold text-slate-900">{course.title}</p>
              <p className="mt-1 text-xs text-slate-600">
                {course.category} · {course.level} · {course.duration}
              </p>
              <p className="mt-3 text-lg font-extrabold text-sky-800">
                NPR {course.priceNPR}
              </p>
            </div>
          )}

          <fieldset>
            <legend className="text-xs font-semibold text-slate-700">
              Payment method <span className="text-rose-500">*</span>
            </legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {paymentMethods.map((method) => (
                <label key={method.value} className={`flex items-center gap-2 rounded-lg border border-sky-100 p-3 text-xs ${method.enabled ? "cursor-pointer text-slate-700" : "cursor-not-allowed text-slate-400"}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    disabled={!method.enabled}
                    className="accent-cyan-500"
                  />
                  {method.label}{!method.enabled && " (not configured)"}
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={loadingCourses || submitting || !courses.length || !paymentMethod || Boolean(success)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-500 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Preparing checkout…" : paymentId ? "Retry checkout" : "Enroll and continue to payment"}
            <ArrowRight size={16} />
          </button>
          <p className="text-center text-[11px] leading-5 text-slate-500">
            Configured Khalti and eSewa payments are verified by the backend. Bank transfers
            remain pending until an administrator confirms receipt.
          </p>
        </form>

        <p className="mt-5 text-center text-xs text-slate-500">
          Already have a student account?{" "}
          <Link to="/login/student" className="font-bold text-sky-700 hover:text-cyan-600">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}

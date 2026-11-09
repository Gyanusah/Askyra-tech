import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import AdminDashboard from "./AdminDashboard";
import CompanyDashboard from "./CompanyDashboard";
import StudentDashboard from "./StudentDashboard";

export default function Dashboard() {
  const { role = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const loadUser = useCallback(async () => {
    setError("");
    try {
      const { user: currentUser } = await apiFetch("/auth/me");
      if (!currentUser) {
        navigate("/login", { replace: true });
        return;
      }
      setUser(currentUser);
    } catch (loadError) {
      if (loadError.status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      setError(loadError.message);
    }
  }, [navigate]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user && user.role !== role.toLowerCase()) {
      navigate(`/dashboard/${user.role}`, { replace: true });
    }
  }, [navigate, role, user]);

  if (error) {
    return (
      <main className="min-h-[60vh] px-4 py-10">
        <div className="mx-auto max-w-lg rounded-xl border border-rose-100 bg-white p-6 text-center">
          <p role="alert" className="text-sm text-rose-700">
            {error}
          </p>
          <button
            onClick={() => void loadUser()}
            className="mt-4 rounded-md bg-sky-700 px-4 py-2 text-xs font-bold text-white"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }
  if (!user || user.role !== role.toLowerCase()) {
    return (
      <main className="min-h-[60vh] px-4 py-12 text-center text-sm text-slate-500">
        Checking your account…
      </main>
    );
  }

  const paymentResult = searchParams.get("payment");
  return (
    <>
      {paymentResult && (
        <div
          role="status"
          className={`px-4 py-3 text-center text-sm font-semibold ${
            paymentResult === "success"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-amber-50 text-amber-900"
          }`}
        >
          {paymentResult === "success"
            ? "Payment verified. Your dashboard has been updated."
            : "Payment was not verified. Check your payment history or try again."}
        </div>
      )}
      {user.role === "student" && <StudentDashboard user={user} />}
      {user.role === "company" && <CompanyDashboard user={user} />}
      {user.role === "admin" && <AdminDashboard user={user} />}
    </>
  );
}

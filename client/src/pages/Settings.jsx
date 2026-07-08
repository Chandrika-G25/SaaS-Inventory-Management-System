import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

function Toast({ type, message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const colours =
    type === "success"
      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
      : "bg-red-50 border-red-300 text-red-700";
  const icon = type === "success" ? "✓" : "✕";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 border rounded-xl px-4 py-3 shadow-lg text-sm font-medium ${colours} animate-slide-up`}
    >
      <span className="text-base">{icon}</span>
      {message}
      <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100">
        ×
      </button>
    </div>
  );
}

export default function Settings() {
  const { token } = useAuth();
  const [threshold, setThreshold] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

  useEffect(() => {
    api
      .getSettings(token)
      .then((data) => setThreshold(data.defaultLowStockThreshold))
      .catch((err) => setToast({ type: "error", message: err.message }))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    const val = Number(threshold);
    if (!threshold || isNaN(val) || !Number.isInteger(val) || val < 0) {
      setToast({ type: "error", message: "Please enter a valid non-negative whole number." });
      return;
    }
    setSaving(true);
    try {
      await api.updateSettings(token, { defaultLowStockThreshold: val });
      setToast({ type: "success", message: "Settings saved successfully." });
    } catch (err) {
      setToast({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg">
      {toast && (
        <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your organisation-wide inventory preferences.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-700 mb-1">
          Default Low Stock Threshold
        </h2>
        <p className="text-sm text-slate-500 mb-5">
          When a product does not have its own threshold, this value is used to determine
          whether it appears in the low-stock list on the Dashboard.
        </p>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Loading settings…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="threshold-input"
                className="block text-xs font-semibold text-slate-600 mb-1"
              >
                Threshold (units)
              </label>
              <input
                id="threshold-input"
                type="number"
                min="0"
                step="1"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-slate-300 transition"
                placeholder="e.g. 5"
                required
              />
              <p className="text-xs text-slate-400 mt-1">
                Must be a whole number ≥ 0.
              </p>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-sm rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold shadow-sm transition-colors"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

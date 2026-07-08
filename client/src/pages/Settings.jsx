import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Settings() {
  const { token } = useAuth();
  const [threshold, setThreshold] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getSettings(token)
      .then((data) => setThreshold(data.defaultLowStockThreshold))
      .catch((err) => setError(err.message));
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaved(false);
    try {
      await api.updateSettings(token, { defaultLowStockThreshold: threshold });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      <form onSubmit={handleSubmit} className="bg-white border rounded-lg shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Default Low Stock Threshold</label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
          <p className="text-xs text-slate-500 mt-1">
            Used when a product doesn't have its own threshold set.
          </p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-green-600">Saved.</p>}
        <button
          type="submit"
          className="bg-slate-900 text-white text-sm px-4 py-2 rounded hover:bg-slate-800"
        >
          Save
        </button>
      </form>
    </div>
  );
}

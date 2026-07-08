import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import SummaryCard from "../components/SummaryCard.jsx";
import LowStockTable from "../components/LowStockTable.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function Dashboard() {
  const { token, organization } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getDashboard(token)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [token]);

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
        {error}
      </div>
    );

  if (!data)
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm py-12 justify-center">
        <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Loading dashboard metrics…
      </div>
    );

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">Workspace</span>
        <h1 className="text-3xl font-bold font-outfit text-slate-900">
          Hello, {organization?.name || "User"}
        </h1>
        <p className="text-sm text-slate-500">
          Here is your inventory status overview for today.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <SummaryCard title="Total Products" value={data.totalProducts} />
        <SummaryCard title="Total Quantity on Hand" value={data.totalQuantity} />
      </div>

      {/* Low Stock card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-premium overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold font-outfit text-slate-800">
              Low Stock Alerts
            </span>
            {data.lowStockItems.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100/50">
                {data.lowStockItems.length}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">Updates instantly as stock moves</p>
        </div>
        {data.lowStockItems.length === 0 ? (
          <EmptyState message="Great! All products are currently above their low stock thresholds." />
        ) : (
          <LowStockTable items={data.lowStockItems} />
        )}
      </div>
    </div>
  );
}

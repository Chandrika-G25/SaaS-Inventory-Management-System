import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import SummaryCard from "../components/SummaryCard.jsx";
import LowStockTable from "../components/LowStockTable.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function Dashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getDashboard(token)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [token]);

  if (error) return <p className="text-red-600 text-sm">{error}</p>;
  if (!data) return <p className="text-slate-500 text-sm">Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <SummaryCard title="Total Products" value={data.totalProducts} />
        <SummaryCard title="Total Quantity on Hand" value={data.totalQuantity} />
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <div className="px-5 py-3 border-b font-medium">Low Stock Items</div>
        {data.lowStockItems.length === 0 ? (
          <EmptyState message="Great! No products are currently running low on stock." />
        ) : (
          <LowStockTable items={data.lowStockItems} />
        )}
      </div>
    </div>
  );
}

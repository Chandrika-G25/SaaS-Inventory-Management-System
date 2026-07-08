import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

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
        <div className="bg-white border rounded-lg p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Products</p>
          <p className="text-3xl font-semibold mt-1">{data.totalProducts}</p>
        </div>
        <div className="bg-white border rounded-lg p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Quantity on Hand</p>
          <p className="text-3xl font-semibold mt-1">{data.totalQuantity}</p>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm">
        <div className="px-5 py-3 border-b font-medium">Low Stock Items</div>
        {data.lowStockItems.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No low stock items. Nice work.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="px-5 py-2">Name</th>
                <th className="px-5 py-2">SKU</th>
                <th className="px-5 py-2">Quantity</th>
                <th className="px-5 py-2">Threshold</th>
              </tr>
            </thead>
            <tbody>
              {data.lowStockItems.map((item) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="px-5 py-2">{item.name}</td>
                  <td className="px-5 py-2">{item.sku}</td>
                  <td className="px-5 py-2 text-red-600 font-medium">{item.quantityOnHand}</td>
                  <td className="px-5 py-2">{item.lowStockThreshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

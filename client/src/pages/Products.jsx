import { useEffect, useState, useMemo } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const emptyForm = {
  id: null,
  name: "",
  sku: "",
  description: "",
  quantityOnHand: "",
  costPrice: "",
  sellingPrice: "",
  lowStockThreshold: "",
};

export default function Products() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  function loadProducts() {
    api.getProducts(token).then(setProducts).catch((err) => setError(err.message));
  }

  useEffect(loadProducts, [token]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [products, search]);

  function openCreate() {
    setForm(emptyForm);
    setShowForm(true);
    setError("");
  }

  function openEdit(p) {
    setForm({
      id: p.id,
      name: p.name,
      sku: p.sku,
      description: p.description || "",
      quantityOnHand: p.quantityOnHand,
      costPrice: p.costPrice ?? "",
      sellingPrice: p.sellingPrice ?? "",
      lowStockThreshold: p.lowStockThreshold ?? "",
    });
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (form.id) {
        await api.updateProduct(token, form.id, form);
      } else {
        await api.createProduct(token, form);
      }
      setShowForm(false);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    await api.deleteProduct(token, id);
    setConfirmDeleteId(null);
    loadProducts();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <button
          onClick={openCreate}
          className="bg-slate-900 text-white text-sm px-4 py-2 rounded hover:bg-slate-800"
        >
          Add Product
        </button>
      </div>

      <input
        placeholder="Search by name or SKU..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded px-3 py-2 text-sm w-full mb-4"
      />

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="px-5 py-2">Name</th>
              <th className="px-5 py-2">SKU</th>
              <th className="px-5 py-2">Quantity</th>
              <th className="px-5 py-2">Low Stock</th>
              <th className="px-5 py-2">Selling Price</th>
              <th className="px-5 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const threshold = p.lowStockThreshold ?? 5;
              const isLow = p.quantityOnHand <= threshold;
              return (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-5 py-2">{p.name}</td>
                  <td className="px-5 py-2">{p.sku}</td>
                  <td className="px-5 py-2">{p.quantityOnHand}</td>
                  <td className="px-5 py-2">
                    {isLow ? (
                      <span className="text-red-600 font-medium">Low</span>
                    ) : (
                      <span className="text-slate-400">OK</span>
                    )}
                  </td>
                  <td className="px-5 py-2">
                    {p.sellingPrice != null ? `$${p.sellingPrice}` : "—"}
                  </td>
                  <td className="px-5 py-2 text-right space-x-3">
                    <button
                      onClick={() => openEdit(p)}
                      className="text-slate-600 hover:text-slate-900 text-xs underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(p.id)}
                      className="text-red-600 hover:text-red-800 text-xs underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-center text-slate-400">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">
              {form.id ? "Edit Product" : "Add Product"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">SKU</label>
                <input
                  required
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Quantity on Hand</label>
                  <input
                    type="number"
                    value={form.quantityOnHand}
                    onChange={(e) => setForm({ ...form, quantityOnHand: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Low Stock Threshold</label>
                  <input
                    type="number"
                    value={form.lowStockThreshold}
                    onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="default"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Cost Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.costPrice}
                    onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Selling Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.sellingPrice}
                    onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                  rows={2}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm rounded bg-slate-900 text-white hover:bg-slate-800"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <p className="text-sm mb-4">
              Are you sure you want to delete this product? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm rounded border"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

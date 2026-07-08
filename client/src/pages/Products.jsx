import { useEffect, useState, useMemo } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const emptyForm = {
  id: null,
  name: "",
  sku: "",
  description: "",
  quantity: "",
  costPrice: "",
  sellingPrice: "",
  lowStockThreshold: "",
};

function Badge({ isLow, quantity, threshold }) {
  if (isLow) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100/50">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-subtle" />
        Low ({quantity}/{threshold})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100/50">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Healthy
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/60">
          <h2 className="text-base font-bold font-outfit text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all text-lg"
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">
        {label}
        {hint && <span className="ml-1 font-normal text-slate-400">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent placeholder:text-slate-300 transition";

export default function Products() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");
  const [adjustId, setAdjustId] = useState(null);
  const [adjustName, setAdjustName] = useState("");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [loading, setLoading] = useState(true);

  function loadProducts() {
    setLoading(true);
    api
      .getProducts(token)
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(loadProducts, [token]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
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
      quantity: p.quantity ?? "",
      costPrice: p.costPrice ?? "",
      sellingPrice: p.sellingPrice ?? "",
      lowStockThreshold: p.lowStockThreshold ?? "",
    });
    setShowForm(true);
    setError("");
  }

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function openAdjust(p) {
    setAdjustId(p.id);
    setAdjustName(p.name);
    setAdjustAmount("");
    setAdjustNote("");
    setError("");
  }

  async function handleAdjustSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.adjustProductStock(token, adjustId, {
        adjustment: Number(adjustAmount),
        note: adjustNote,
      });
      setAdjustId(null);
      loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (form.id) {
        await api.updateProduct(token, form.id, {
          name: form.name,
          sku: form.sku,
          description: form.description,
          quantity: form.quantity,
          costPrice: form.costPrice,
          sellingPrice: form.sellingPrice,
          lowStockThreshold: form.lowStockThreshold,
        });
      } else {
        await api.createProduct(token, {
          name: form.name,
          sku: form.sku,
          description: form.description,
          quantity: form.quantity,
          costPrice: form.costPrice,
          sellingPrice: form.sellingPrice,
          lowStockThreshold: form.lowStockThreshold,
        });
      }
      setShowForm(false);
      loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function promptDelete(p) {
    setConfirmDeleteId(p.id);
    setDeleteName(p.name);
  }

  async function handleDelete() {
    try {
      await api.deleteProduct(token, confirmDeleteId);
    } catch (err) {
      setError(err.message);
    }
    setConfirmDeleteId(null);
    loadProducts();
  }

  const totalProducts = products.length;
  const lowStockCount = products.filter((p) => {
    const t = p.lowStockThreshold ?? 5;
    return p.quantity <= t;
  }).length;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest block mb-0.5">Inventory</span>
          <h1 className="text-3xl font-bold font-outfit text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your stock items, tracked SKUs, and replenishment limits.
          </p>
        </div>
        <button
          id="add-product-btn"
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4.5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all duration-200 hover:-translate-y-0.5"
        >
          <span className="text-lg leading-none">+</span>
          Add Product
        </button>
      </div>

      {/* Info Stats Ribbon */}
      <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5 text-xs text-slate-600">
        <span className="font-semibold text-slate-800">Summary:</span>
        <span>{totalProducts} products total</span>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
        <span className={lowStockCount > 0 ? "text-red-650 font-bold" : "text-slate-500"}>
          {lowStockCount} items currently running low
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400 pointer-events-none text-sm">
          🔍
        </span>
        <input
          id="product-search"
          placeholder="Search by name or SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-slate-200/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition shadow-premium placeholder:text-slate-350 bg-white"
        />
      </div>

      {/* Error banner */}
      {error && !showForm && (
        <div className="bg-red-50 border border-red-200 text-red-750 text-xs font-semibold rounded-xl px-4 py-3 animate-fade-in">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-premium overflow-hidden">
        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm py-16 justify-center">
            <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading product directory…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50/70 text-slate-500 text-xs font-semibold uppercase tracking-wide border-b border-slate-200/60">
                  <th className="px-6 py-3.5">Product Name</th>
                  <th className="px-6 py-3.5">SKU</th>
                  <th className="px-6 py-3.5 text-center">Qty on Hand</th>
                  <th className="px-6 py-3.5 text-center">Stock Status</th>
                  <th className="px-6 py-3.5 text-right">Selling Price</th>
                  <th className="px-6 py-3.5 text-right pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filtered.map((p) => {
                  const threshold = p.lowStockThreshold ?? 5;
                  const isLow = p.quantity <= threshold;
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        <div>{p.name}</div>
                        {p.description && (
                          <div className="text-xs text-slate-400 font-normal mt-0.5 max-w-[200px] truncate">
                            {p.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-500 text-xs">{p.sku}</td>
                      <td className="px-6 py-4 text-center tabular-nums text-slate-700">
                        <div className="font-semibold">{p.quantity}</div>
                        {p.lastUpdateNote && (
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[120px] mx-auto font-normal" title={p.lastUpdateNote}>
                            💬 {p.lastUpdateNote}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge isLow={isLow} quantity={p.quantity} threshold={threshold} />
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums font-semibold text-slate-700">
                        {p.sellingPrice != null ? `$${Number(p.sellingPrice).toFixed(2)}` : "—"}
                      </td>
                      <td className="px-6 py-4 text-right pr-8">
                        <div className="flex items-center justify-end gap-3.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openAdjust(p)}
                            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold transition-colors"
                          >
                            Adjust
                          </button>
                          <button
                            id={`edit-${p.id}`}
                            onClick={() => openEdit(p)}
                            className="text-indigo-650 hover:text-indigo-850 text-xs font-bold transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            id={`delete-${p.id}`}
                            onClick={() => promptDelete(p)}
                            className="text-red-500 hover:text-red-700 text-xs font-bold transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center">
                      <p className="text-slate-450 text-sm">
                        {search ? "No products match your search query." : 'No products logged yet. Click "Add Product" to create your first stock item.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <Modal
          title={form.id ? "Edit Product" : "Add Product"}
          onClose={() => setShowForm(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Name" hint="(required)">
              <input
                id="product-name"
                required
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Wireless Mouse"
                className={inputClass}
              />
            </FormField>

            <FormField label="SKU" hint="(required, unique)">
              <input
                id="product-sku"
                required
                value={form.sku}
                onChange={set("sku")}
                placeholder="e.g. WL-MOUSE-001"
                className={inputClass}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Quantity on Hand">
                <input
                  id="product-quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={form.quantity}
                  onChange={set("quantity")}
                  placeholder="0"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Low Stock Threshold" hint="(optional)">
                <input
                  id="product-threshold"
                  type="number"
                  min="0"
                  step="1"
                  value={form.lowStockThreshold}
                  onChange={set("lowStockThreshold")}
                  placeholder="default"
                  className={inputClass}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Cost Price" hint="(optional)">
                <input
                  id="product-cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.costPrice}
                  onChange={set("costPrice")}
                  placeholder="0.00"
                  className={inputClass}
                />
              </FormField>
              <FormField label="Selling Price" hint="(optional)">
                <input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.sellingPrice}
                  onChange={set("sellingPrice")}
                  placeholder="0.00"
                  className={inputClass}
                />
              </FormField>
            </div>

            <FormField label="Description" hint="(optional)">
              <textarea
                id="product-description"
                value={form.description}
                onChange={set("description")}
                rows={2}
                placeholder="Short description of the product…"
                className={inputClass}
              />
            </FormField>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-sm rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold shadow-sm transition-colors"
              >
                {saving ? "Saving…" : form.id ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <Modal title="Delete Product" onClose={() => setConfirmDeleteId(null)}>
          <p className="text-sm text-slate-600 mb-6">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-slate-800">"{deleteName}"</span>? This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="px-4 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              id="confirm-delete-btn"
              onClick={handleDelete}
              className="px-5 py-2 text-sm rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-sm transition-colors"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}

      {/* Adjust Stock Modal */}
      {adjustId && (
        <Modal title={`Adjust Stock: ${adjustName}`} onClose={() => setAdjustId(null)}>
          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            <FormField label="Adjustment Amount" hint="(use + for add, - for reduce)">
              <input
                type="number"
                required
                step="1"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                placeholder="+/- units"
                className={inputClass}
              />
            </FormField>
            <FormField label="Note" hint="(optional)">
              <input
                type="text"
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                placeholder="Reason for adjustment"
                className={inputClass}
              />
            </FormField>
            
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAdjustId(null)}
                className="px-4 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold shadow-sm transition-colors"
              >
                {saving ? "Saving…" : "Confirm"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

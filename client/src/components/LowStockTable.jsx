export default function LowStockTable({ items }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="bg-slate-50/70 text-slate-500 text-xs font-semibold uppercase tracking-wide border-b border-slate-200/60">
            <th className="px-6 py-3.5">Product Name</th>
            <th className="px-6 py-3.5">SKU</th>
            <th className="px-6 py-3.5 text-center">Quantity on Hand</th>
            <th className="px-6 py-3.5 text-center">Low Stock Threshold</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/80">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
              <td className="px-6 py-4 font-mono text-slate-500 text-xs">{item.sku}</td>
              <td className="px-6 py-4 text-center">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-100/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-subtle" />
                  {item.quantity} units
                </span>
              </td>
              <td className="px-6 py-4 text-center text-slate-500 tabular-nums font-medium">
                {item.lowStockThreshold}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

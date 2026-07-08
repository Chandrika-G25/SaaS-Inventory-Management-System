export default function LowStockTable({ items }) {
  return (
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
        {items.map((item) => (
          <tr key={item.id} className="border-b last:border-0">
            <td className="px-5 py-2">{item.name}</td>
            <td className="px-5 py-2">{item.sku}</td>
            <td className="px-5 py-2 text-red-600 font-medium">{item.quantity}</td>
            <td className="px-5 py-2">{item.lowStockThreshold}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

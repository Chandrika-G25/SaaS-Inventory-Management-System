export default function SummaryCard({ title, value }) {
  return (
    <div className="bg-white border rounded-lg p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-3xl font-semibold mt-1">{value}</p>
    </div>
  );
}

export default function SummaryCard({ title, value }) {
  const isProducts = title.toLowerCase().includes("product");

  return (
    <div className="relative bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300 group hover:-translate-y-0.5 overflow-hidden">
      {/* Decorative background shape */}
      <div
        className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 blur-xl group-hover:scale-125 transition-transform duration-500 ${
          isProducts ? "bg-indigo-600" : "bg-emerald-600"
        }`}
      />
      <div className="flex items-center justify-between relative z-10">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            {title}
          </span>
          <span className="text-4xl font-outfit font-bold text-slate-800 tracking-tight">
            {value}
          </span>
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${
            isProducts
              ? "bg-indigo-50 text-indigo-600 border border-indigo-100/50"
              : "bg-emerald-50 text-emerald-600 border border-emerald-100/50"
          }`}
        >
          {isProducts ? "📦" : "📊"}
        </div>
      </div>
    </div>
  );
}

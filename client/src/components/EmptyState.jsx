export default function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl mb-3 border border-emerald-100/50">
        ✓
      </div>
      <p className="text-sm font-semibold text-slate-700 mb-0.5">All Clear!</p>
      <p className="text-sm text-slate-500 max-w-sm">{message}</p>
    </div>
  );
}

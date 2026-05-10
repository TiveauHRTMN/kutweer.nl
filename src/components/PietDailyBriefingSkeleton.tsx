export default function PietDailyBriefingSkeleton() {
  return (
    <div className="card p-5 sm:p-6 space-y-5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-slate-200" />
          <div className="h-3 w-24 rounded bg-slate-200" />
        </div>
        <div className="h-3 w-20 rounded bg-slate-200" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="rounded-xl p-3 bg-slate-100 space-y-2">
            <div className="h-2 w-12 mx-auto rounded bg-slate-200" />
            <div className="h-6 w-6 mx-auto rounded bg-slate-200" />
            <div className="h-3 w-8 mx-auto rounded bg-slate-200" />
            <div className="h-2 w-10 mx-auto rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="space-y-2 pl-4 border-l-2 border-slate-200">
        <div className="h-3 w-full rounded bg-slate-200" />
        <div className="h-3 w-5/6 rounded bg-slate-200" />
        <div className="h-3 w-4/6 rounded bg-slate-200" />
      </div>
    </div>
  );
}

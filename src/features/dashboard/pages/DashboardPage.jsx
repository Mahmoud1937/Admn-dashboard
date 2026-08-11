const DashboardPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard Overview</h1>
      <p className="mt-1 text-sm text-slate-500">
        Welcome back! Here is what&apos;s happening with MediCard today.
      </p>

      <div className="mt-6 grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white py-24 text-sm text-slate-400">
        Stat cards go here next
      </div>
    </div>
  );
};

export default DashboardPage;

import DashboardCharts from "../components/DashboardCharts";
import StatCards from "../components/StatCards";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-primary-600">Overview</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Monitor card activity, invoices, providers, and operational trends
          from one place.
        </p>
      </header>

      <StatCards />
      <DashboardCharts />
    </div>
  );
}

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faChartColumn,
} from "@fortawesome/free-solid-svg-icons";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { DASHBOARD_CHART_GROUP_BY } from "../services/dashboardService";
import { useDashboardChart } from "../hooks/useDashboardChart";
import {
  getDashboardFilter,
  saveDashboardFilter,
} from "../../../shared/utils/dashboardFilterSession";

const GROUP_OPTIONS = [
  { value: DASHBOARD_CHART_GROUP_BY.ByMonth, label: "By month" },
  { value: DASHBOARD_CHART_GROUP_BY.ByQuarter, label: "By quarter" },
  { value: DASHBOARD_CHART_GROUP_BY.ByHalfYear, label: "By half year" },
  { value: DASHBOARD_CHART_GROUP_BY.ByYear, label: "By year" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, index) => currentYear - index);
const initialChartFilters = () => {
  const stored = getDashboardFilter("chart");
  return {
    groupBy: Object.values(DASHBOARD_CHART_GROUP_BY).includes(stored?.groupBy)
      ? stored.groupBy
      : DASHBOARD_CHART_GROUP_BY.ByMonth,
    year: YEARS.includes(stored?.year) ? stored.year : currentYear,
  };
};

const formatMoney = (value) =>
  `${Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EGP`;

const formatCount = (value) => Number(value ?? 0).toLocaleString("en-US");

const formatCompactNumber = (value) =>
  Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value ?? 0));

const prepareChartData = (info) =>
  (info?.data ?? []).map((item) => ({
    ...item,
    label: item.labelEn || String(item.period ?? ""),
  }));

const TOOLTIP_STYLE = {
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
  fontSize: "12px",
};

const CHART_CARD_BACKGROUNDS = {
  blue: "border-blue-100 bg-blue-50/30",
  emerald: "border-emerald-100 bg-emerald-50/30",
  amber: "border-amber-100 bg-amber-50/30",
};

function ChartCard({
  title,
  description,
  totalLabel,
  total,
  tone = "blue",
  className = "",
  chartClassName = "h-72",
  children,
}) {
  return (
    <article
      className={`min-w-0 rounded-xl border p-4 shadow-sm sm:p-5 ${CHART_CARD_BACKGROUNDS[tone]} ${className}`}
    >
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <div className="min-w-0 sm:text-right">
          <p className="break-words text-lg font-bold text-slate-900">{total}</p>
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            {totalLabel}
          </p>
        </div>
      </div>
      <div className={`${chartClassName} w-full min-w-0`}>
        {children}
      </div>
    </article>
  );
}

function EmptyChartState({ message }) {
  return (
    <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
      <div>
        <FontAwesomeIcon
          icon={faChartColumn}
          className="text-2xl text-slate-300"
          aria-hidden="true"
        />
        <p className="mt-3 text-sm font-medium text-slate-600">
          No chart data available
        </p>
        <p className="mt-1 text-xs text-slate-400">{message}</p>
      </div>
    </div>
  );
}

function ChartsSkeleton() {
  return (
    <div
      className="grid gap-4 xl:grid-cols-2"
      aria-label="Loading dashboard charts"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="h-[370px] animate-pulse rounded-xl border border-slate-200 bg-white p-5"
        >
          <div className="h-4 w-36 rounded bg-slate-200" />
          <div className="mt-2 h-3 w-48 rounded bg-slate-100" />
          <div className="mt-10 h-64 rounded-lg bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export default function DashboardCharts() {
  const [{ groupBy, year }, setChartFilters] = useState(initialChartFilters);

  useEffect(() => {
    saveDashboardFilter("chart", { groupBy, year });
  }, [groupBy, year]);

  const isMonthGrouping = groupBy === DASHBOARD_CHART_GROUP_BY.ByMonth;

  const handleGroupByChange = (event) => {
    const nextGroupBy = Number(event.target.value);

    setChartFilters((previous) => ({
      groupBy: nextGroupBy,
      year:
        nextGroupBy === DASHBOARD_CHART_GROUP_BY.ByMonth
          ? previous.year
          : currentYear,
    }));
  };

  const { data, isLoading, isError, refetch } = useDashboardChart({
    groupBy,
    year,
  });

  const invoiceData = prepareChartData(data?.invoiceInfo);
  const providerData = prepareChartData(data?.providerInfo).map(
    (provider, index) => ({
      label: provider.label,
      providers: provider.count,
      branches: data?.branchInfo?.data?.[index]?.count ?? 0,
    })
  );

  return (
    <section className="space-y-4" aria-labelledby="dashboard-trends-title">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2
            id="dashboard-trends-title"
            className="text-base font-semibold text-slate-900"
          >
            Operational trends
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Compare performance across the selected reporting period.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end xl:w-auto">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:flex-none">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">
                Group by
              </span>
              <span className="relative block">
                <FontAwesomeIcon
                  icon={faChartColumn}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"
                />
                <select
                  value={groupBy}
                  onChange={handleGroupByChange}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-8 text-sm text-slate-700 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-600/10 xl:w-40"
                >
                  {GROUP_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">
                Year
              </span>
              <span className="relative block">
                <FontAwesomeIcon
                  icon={faCalendarDays}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"
                />
                <select
                  value={year}
                  onChange={(event) =>
                    setChartFilters((previous) => ({
                      ...previous,
                      year: Number(event.target.value),
                    }))
                  }
                  disabled={!isMonthGrouping}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-8 text-sm text-slate-700 outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-600/10 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 xl:w-32"
                >
                  {YEARS.map((optionYear) => (
                    <option key={optionYear} value={optionYear}>
                      {optionYear}
                    </option>
                  ))}
                </select>
              </span>
            </label>
          </div>
          <button
            type="button"
            onClick={() =>
              setChartFilters({
                groupBy: DASHBOARD_CHART_GROUP_BY.ByMonth,
                year: currentYear,
              })
            }
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
          >
            Reset
          </button>
        </div>
      </div>

      {isLoading && <ChartsSkeleton />}

      {isError && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>Failed to load dashboard trends.</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-1.5 font-medium transition hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      )}

      {data && !isLoading && (
        <div className="grid gap-4 xl:grid-cols-2">
          <ChartCard
            title="Invoice Performance"
            description="Revenue and invoice volume across the selected reporting period"
            totalLabel="Revenue / invoices"
            total={`${formatMoney(data.invoiceInfo?.totalAmount)} / ${formatCount(
              data.invoiceInfo?.totalCount
            )}`}
            className="xl:col-span-2"
            chartClassName="h-80"
            tone="blue"
          >
            {invoiceData.length === 0 ? (
              <EmptyChartState message="Try another year or reporting interval." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={invoiceData}
                  margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="invoiceRevenueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#1d487e" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#1d487e" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    minTickGap={12}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="amount"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    tickFormatter={formatCompactNumber}
                    width={48}
                  />
                  <YAxis
                    yAxisId="count"
                    orientation="right"
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value, name) => [
                      name === "Revenue" ? formatMoney(value) : formatCount(value),
                      name,
                    ]}
                    cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                  />
                  <Area
                    yAxisId="amount"
                    type="monotone"
                    dataKey="totalAmount"
                    name="Revenue"
                    stroke="#1d487e"
                    strokeWidth={3}
                    fill="url(#invoiceRevenueGradient)"
                    activeDot={{ r: 5, fill: "#1d487e", stroke: "#fff", strokeWidth: 2 }}
                  />
                  <Bar
                    yAxisId="count"
                    dataKey="count"
                    name="Invoices"
                    fill="#8b5cf6"
                    fillOpacity={0.85}
                    radius={[5, 5, 0, 0]}
                    maxBarSize={26}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard
            title="Sold Cards"
            description="Cards sold across the reporting period"
            totalLabel="Total cards"
            total={formatCount(data.soldCardsInfo?.totalCount)}
            tone="emerald"
          >
            {prepareChartData(data.soldCardsInfo).length === 0 ? (
              <EmptyChartState message="No sold-card activity was returned for this period." />
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prepareChartData(data.soldCardsInfo)} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} minTickGap={12} tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} width={36} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [formatCount(value), "Cards"]} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="count" name="Cards" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard
            title="Provider Network Growth"
            description="New providers and branches added over time"
            totalLabel="Providers / branches"
            total={`${formatCount(data.providerInfo?.totalCount)} / ${formatCount(data.branchInfo?.totalCount)}`}
            tone="amber"
          >
            {providerData.length === 0 ? (
              <EmptyChartState message="No provider or branch activity was returned for this period." />
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={providerData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} minTickGap={12} tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} width={36} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatCount(value)} cursor={{ fill: "#f8fafc" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                <Bar dataKey="providers" name="Providers" fill="#d97706" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Bar dataKey="branches" name="Branches" fill="#0ea5e9" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      )}
    </section>
  );
}

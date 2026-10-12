import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendUp,
  faBuildingCircleCheck,
  faCreditCard,
  faFileInvoiceDollar,
} from "@fortawesome/free-solid-svg-icons";
import { useDashboard } from "../hooks/useDashboard";
import { DatePicker } from "../../../shared/components/DateRangeFilterFields";
import {
  getDashboardFilter,
  saveDashboardFilter,
} from "../../../shared/utils/dashboardFilterSession";

const today = () => new Date().toLocaleDateString("en-CA");
const isStoredDate = (value) =>
  value === "" ||
  (typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(new Date(`${value}T00:00:00`).getTime()));

const initialDates = () => {
  const stored = getDashboardFilter("summary");
  return {
    from: isStoredDate(stored?.from) ? stored.from : today(),
    to: isStoredDate(stored?.to) ? stored.to : today(),
  };
};

const toApiDate = (date, time) => {
  if (!date) return null;

  const parsedDate = new Date(`${date}T${time}`);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
};

const formatMoney = (value) =>
  `${Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} EGP`;

const formatCount = (value) => Number(value ?? 0).toLocaleString("en-US");

const CARD_STYLES = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
};

const CARD_BACKGROUNDS = {
  blue: "border-blue-100 bg-blue-50/40",
  emerald: "border-emerald-100 bg-emerald-50/40",
  amber: "border-amber-100 bg-amber-50/40",
  violet: "border-violet-100 bg-violet-50/40",
};

function StatCard({
  title,
  icon,
  tone,
  primaryLabel,
  primaryValue,
  secondaryLabel,
  secondaryValue,
}) {
  return (
    <article
      className={`min-w-0 rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5 ${CARD_BACKGROUNDS[tone]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 break-words text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {primaryValue}
          </p>
          <p className="mt-1 text-xs text-slate-400">{primaryLabel}</p>
        </div>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${CARD_STYLES[tone]}`}
        >
          <FontAwesomeIcon icon={icon} aria-hidden="true" />
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
        <span className="text-xs font-medium text-slate-500">
          {secondaryLabel}
        </span>
        <span className="min-w-0 break-words text-right text-sm font-semibold text-slate-700">
          {secondaryValue}
        </span>
      </div>
    </article>
  );
}

function StatCardsSkeleton() {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4"
      aria-label="Loading dashboard summary"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="h-[177px] animate-pulse rounded-xl border border-slate-200 bg-white p-5"
        >
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="mt-5 h-8 w-32 rounded bg-slate-200" />
          <div className="mt-8 h-px bg-slate-100" />
          <div className="mt-4 h-4 w-full rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export default function StatCards() {
  const [{ from, to }, setDates] = useState(initialDates);

  useEffect(() => {
    saveDashboardFilter("summary", { from, to });
  }, [from, to]);

  const filters = useMemo(
    () => {
      const fromDate = toApiDate(from, "00:00:00");
      const toDate = toApiDate(to, "23:59:59");

      return fromDate && toDate ? { fromDate, toDate } : null;
    },
    [from, to]
  );

  const { data, isLoading, isError, refetch } = useDashboard(
    filters,
    Boolean(filters)
  );

  return (
    <section className="space-y-4" aria-labelledby="dashboard-summary-title">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2
            id="dashboard-summary-title"
            className="text-base font-semibold text-slate-900"
          >
            Performance summary
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Choose a date range to update the key metrics.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end xl:w-auto">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:flex-none">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">
                From date
              </span>
              <DatePicker
                value={from}
                maxDate={to}
                onChange={(value) =>
                  setDates((previous) => ({ ...previous, from: value }))
                }
                className="w-full xl:w-40"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">
                To date
              </span>
              <DatePicker
                value={to}
                minDate={from}
                onChange={(value) =>
                  setDates((previous) => ({ ...previous, to: value }))
                }
                className="w-full xl:w-40"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={() => {
              const date = today();
              setDates({ from: date, to: date });
            }}
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
          >
            Reset
          </button>
        </div>
      </div>

      {!filters && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Select both From and To dates to load the dashboard summary.
        </div>
      )}

      {isLoading && <StatCardsSkeleton />}

      {isError && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>Failed to load dashboard summary.</span>
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
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <StatCard
            title="Sold Cards"
            icon={faCreditCard}
            tone="blue"
            primaryLabel="Total amount"
            primaryValue={formatMoney(data.soldCards?.totalAmount)}
            secondaryLabel="Cards sold"
            secondaryValue={formatCount(data.soldCards?.count)}
          />
          <StatCard
            title="Activated Cards"
            icon={faArrowTrendUp}
            tone="emerald"
            primaryLabel="Total amount"
            primaryValue={formatMoney(data.activatedCards?.totalAmount)}
            secondaryLabel="Cards activated"
            secondaryValue={formatCount(data.activatedCards?.count)}
          />
          <StatCard
            title="Provider Network"
            icon={faBuildingCircleCheck}
            tone="amber"
            primaryLabel="Providers"
            primaryValue={formatCount(data.providers?.providersCount)}
            secondaryLabel="Branches"
            secondaryValue={formatCount(data.providers?.branchesCount)}
          />
          <StatCard
            title="Invoices"
            icon={faFileInvoiceDollar}
            tone="violet"
            primaryLabel="Total amount"
            primaryValue={formatMoney(data.invoices?.totalAmount)}
            secondaryLabel="Invoices issued"
            secondaryValue={formatCount(data.invoices?.count)}
          />
        </div>
      )}
    </section>
  );
}

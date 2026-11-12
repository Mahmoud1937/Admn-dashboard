import localizeMessage from "../../../localization/localizeMessage";
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
import Skeleton from "../../../shared/components/Skeleton";
import { useTranslation } from "react-i18next";
import useLanguage from "../../../localization/useLanguage";

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
  })} ${localizeMessage("EGP")}`;

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
      <div className="flex items-start justify-between gap-2 sm:gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 break-words text-lg font-bold tracking-tight text-slate-900 sm:text-2xl">
            <bdi dir="ltr">{primaryValue}</bdi>
          </p>
          <p className="mt-1 text-xs text-slate-400">{primaryLabel}</p>
        </div>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1 sm:h-11 sm:w-11 ${CARD_STYLES[tone]}`}
        >
          <FontAwesomeIcon icon={icon} aria-hidden="true" />
        </span>
      </div>

      <div className="mt-5 flex flex-col items-start gap-1 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
        <span className="text-xs font-medium text-slate-500">
          {secondaryLabel}
        </span>
        <span className="min-w-0 break-words text-start text-sm font-semibold text-slate-700 sm:text-end">
          <bdi dir="ltr">{secondaryValue}</bdi>
        </span>
      </div>
    </article>
  );
}

function StatCardsSkeleton() {
  const { t } = useTranslation("dashboard");
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4"
      aria-label={t("summary.loading")}
    >
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton
          key={index}
          className="h-[177px] rounded-xl border border-slate-200 bg-white p-5"
        >
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="mt-5 h-8 w-32 rounded bg-slate-200" />
          <div className="mt-8 h-px bg-slate-100" />
          <div className="mt-4 h-4 w-full rounded bg-slate-100" />
        </Skeleton>
      ))}
    </div>
  );
}

export default function StatCards() {
  const { t } = useTranslation("dashboard");
  const { language } = useLanguage();
  const dateLabels = {
    locale: language,
    weekdayLabels: t("weekdays", { returnObjects: true }),
    previousMonthLabel: t("previousMonth"),
    nextMonthLabel: t("nextMonth"),
    toggleCalendarLabel: t("toggleCalendar"),
  };
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
    Boolean(filters),
    language
  );

  return (
    <section className="space-y-4" aria-labelledby="dashboard-summary-title">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2
            id="dashboard-summary-title"
            className="text-base font-semibold text-slate-900"
          >
            {t("summary.title")}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {t("summary.description")}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end xl:w-auto">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 xl:flex-none">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">
                {t("summary.fromDate")}
              </span>
              <DatePicker
                value={from}
                maxDate={to}
                onChange={(value) =>
                  setDates((previous) => ({ ...previous, from: value }))
                }
                className="w-full xl:w-40"
                {...dateLabels}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-slate-600">
                {t("summary.toDate")}
              </span>
              <DatePicker
                value={to}
                minDate={from}
                onChange={(value) =>
                  setDates((previous) => ({ ...previous, to: value }))
                }
                className="w-full xl:w-40"
                {...dateLabels}
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
            {t("summary.reset")}
          </button>
        </div>
      </div>

      {!filters && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t("summary.missingDates")}
        </div>
      )}

      {isLoading && <StatCardsSkeleton />}

      {isError && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{t("summary.error")}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-1.5 font-medium transition hover:bg-red-100"
          >
            {t("summary.retry")}
          </button>
        </div>
      )}

      {data && !isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
          <StatCard
            title={t("summary.soldCards")}
            icon={faCreditCard}
            tone="blue"
            primaryLabel={t("summary.totalAmount")}
            primaryValue={formatMoney(data.soldCards?.totalAmount)}
            secondaryLabel={t("summary.cardsSold")}
            secondaryValue={formatCount(data.soldCards?.count)}
          />
          <StatCard
            title={t("summary.activatedCards")}
            icon={faArrowTrendUp}
            tone="emerald"
            primaryLabel={t("summary.totalAmount")}
            primaryValue={formatMoney(data.activatedCards?.totalAmount)}
            secondaryLabel={t("summary.cardsActivated")}
            secondaryValue={formatCount(data.activatedCards?.count)}
          />
          <StatCard
            title={t("summary.providerNetwork")}
            icon={faBuildingCircleCheck}
            tone="amber"
            primaryLabel={t("summary.providers")}
            primaryValue={formatCount(data.providers?.providersCount)}
            secondaryLabel={t("summary.branches")}
            secondaryValue={formatCount(data.providers?.branchesCount)}
          />
          <StatCard
            title={t("summary.invoices")}
            icon={faFileInvoiceDollar}
            tone="violet"
            primaryLabel={t("summary.totalAmount")}
            primaryValue={formatMoney(data.invoices?.totalAmount)}
            secondaryLabel={t("summary.invoicesIssued")}
            secondaryValue={formatCount(data.invoices?.count)}
          />
        </div>
      )}
    </section>
  );
}

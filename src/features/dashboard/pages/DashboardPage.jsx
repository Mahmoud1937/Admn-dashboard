import DashboardCharts from "../components/DashboardCharts";
import StatCards from "../components/StatCards";
import { useTranslation } from "react-i18next";
import LocalizedPage from "../../../localization/LocalizedPage";

export default function DashboardPage() {
  const { t } = useTranslation("dashboard");
  return (
    <LocalizedPage className="min-w-0 space-y-6 sm:space-y-8">
      <header>
        <p className="text-sm font-medium text-primary-600">{t("overview")}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {t("intro")}
        </p>
      </header>

      <StatCards />
      <DashboardCharts />
    </LocalizedPage>
  );
}

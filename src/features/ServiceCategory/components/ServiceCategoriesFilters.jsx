import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import useLanguage from "../../../localization/useLanguage";
import useServiceCategoriesText from "../../../localization/useServiceCategoriesText";

export default function ServiceCategoriesFilters({ search, onSearchChange }) {
  const t = useServiceCategoriesText();
  const { direction } = useLanguage();
  const rtl = direction === "rtl";
  return (
    <div className="border-b border-slate-200 p-4">
      <div className="relative">
        <FontAwesomeIcon
          icon={faSearch}
          className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${rtl ? "right-4" : "left-4"}`}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={rtl ? { direction: "rtl", textAlign: "right" } : undefined}
          placeholder={t("Search service categories by name (EN/AR)...")}
          aria-label={t("Search service categories by name (EN/AR)...")}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white ${rtl ? "pr-11 pl-4" : "pl-11 pr-4"}`}
        />
      </div>
    </div>
  );
}

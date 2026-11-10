import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getServiceCategories } from "../../ServiceCategory/services/Servicecategoriesservice";
import useLanguage from "../../../localization/useLanguage";
import useServicesAdminText from "../../../localization/useServicesAdminText";

export default function CategorySelect({
  value,
  onChange,
  placeholder = "Select category",
  error,
  disabled,
  className = "w-full sm:w-72",
  localized = false,
}) {
  const t = useServicesAdminText();
  const { language, direction } = useLanguage();
  const rtl = localized && direction === "rtl";
  return (
    
    <div className={className}>
      <SearchableAsyncSelect
        queryKey={localized ? ["service-categories", "select", language] : ["categories"]}
        fetchItems={getServiceCategories}
        value={value}
        onChange={onChange}
        getOptionLabel={(item) => localized
          ? (rtl ? [item.arName, item.enName] : [item.enName, item.arName]).filter(Boolean).join(" - ")
          : `${item.enName} - ${item.arName}`}
        placeholder={placeholder}
        searchPlaceholder={localized ? t("Search categories...") : "Search categories..."}
        labels={localized ? {
          loading: t("Loading..."),
          loadingMore: t("Loading more..."),
          unableToLoadOptions: t("Unable to load options."),
          tryAgain: t("Try again"),
          noResults: t("No results found."),
          clearSelection: t("Clear selection"),
          openOptions: t("Open options"),
          closeOptions: t("Close options"),
        } : undefined}
        rtl={rtl}
        disabled={disabled}
        error={error}
      />
    </div>
  );
}

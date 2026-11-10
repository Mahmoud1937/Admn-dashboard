import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getManualPrescriptionPharmacies, getManualPrescriptionProviders } from "../services/prescriptionsService";
import useLanguage from "../../../localization/useLanguage";
import usePrescriptionsText from "../../../localization/usePrescriptionsText";

export default function PrescriptionProviderDropdown({ serviceId, value, onChange, disabled, pharmacy = false, active = true }) {
  const t = usePrescriptionsText();
  const { language, direction } = useLanguage();
  const rtl = direction === "rtl";
  return (
    <div onKeyDown={(event) => {
      if (event.key === "Enter" && event.target.tagName === "INPUT") event.preventDefault();
    }}>
      <SearchableAsyncSelect
        queryKey={pharmacy ? ["manual-prescription-pharmacies", "dropdown", language] : ["manual-prescription-providers", serviceId, "dropdown", language]}
        fetchItems={(pageNumber, pageSize, search) => pharmacy
          ? getManualPrescriptionPharmacies({ pageNumber, pageSize, search })
          : getManualPrescriptionProviders({ serviceId, pageNumber, pageSize, search })}
        value={value}
        onChange={onChange}
        getOptionValue={(provider) => provider.providerId}
        getOptionLabel={(provider) => (rtl ? [provider.arName, provider.enName] : [provider.enName, provider.arName]).filter(Boolean).join(" - ") || t("Provider #{{id}}", { id: provider.providerId })}
        placeholder={t(pharmacy ? "Select pharmacy (optional)" : "Select provider (optional)")}
        searchPlaceholder={t(pharmacy ? "Search pharmacies..." : "Search providers...")}
        labels={{
          loading: t("Loading..."), loadingMore: t("Loading more..."),
          unableToLoadOptions: t("Unable to load options."), tryAgain: t("Try again"),
          noResults: t("No results found."), clearSelection: t("Clear selection"),
          openOptions: t("Open options"), closeOptions: t("Close options"),
        }}
        rtl={rtl}
        disabled={disabled || !active || (!pharmacy && !serviceId)}
        preload={active && !disabled && (pharmacy || Boolean(serviceId))}
      />
    </div>
  );
}

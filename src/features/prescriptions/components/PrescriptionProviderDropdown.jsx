import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getManualPrescriptionPharmacies, getManualPrescriptionProviders } from "../services/prescriptionsService";

export default function PrescriptionProviderDropdown({ serviceId, value, onChange, disabled, pharmacy = false, active = true }) {
  return (
    <div onKeyDown={(event) => {
      if (event.key === "Enter" && event.target.tagName === "INPUT") event.preventDefault();
    }}>
      <SearchableAsyncSelect
        queryKey={pharmacy ? ["manual-prescription-pharmacies", "dropdown"] : ["manual-prescription-providers", serviceId, "dropdown"]}
        fetchItems={(pageNumber, pageSize, search) => pharmacy
          ? getManualPrescriptionPharmacies({ pageNumber, pageSize, search })
          : getManualPrescriptionProviders({ serviceId, pageNumber, pageSize, search })}
        value={value}
        onChange={onChange}
        getOptionValue={(provider) => provider.providerId}
        getOptionLabel={(provider) => [provider.enName, provider.arName].filter(Boolean).join(" - ") || `Provider #${provider.providerId}`}
        placeholder={pharmacy ? "Select pharmacy (optional)" : "Select provider (optional)"}
        searchPlaceholder={pharmacy ? "Search pharmacies..." : "Search providers..."}
        disabled={disabled || !active || (!pharmacy && !serviceId)}
        preload={active && !disabled && (pharmacy || Boolean(serviceId))}
      />
    </div>
  );
}

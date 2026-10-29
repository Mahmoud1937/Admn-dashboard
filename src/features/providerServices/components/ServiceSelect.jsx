import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getProviderServiceOptions } from "../services/providerServicesService";


export default function ServiceSelect({
  categoryId, 
  value,
  onChange,
  placeholder = "Select service",
  error,
  disabled,
  fallbackLabel,
}) {
  return (
    <div className="w-full">
      <SearchableAsyncSelect
        queryKey={["provider-service-options", categoryId]}
        fetchItems={(pageNumber, pageSize, searchTerm) =>
          getProviderServiceOptions({ categoryId, pageNumber, pageSize, searchTerm })
        }
        value={value}
        onChange={onChange}
        getOptionLabel={(item) => [item.enName, item.arName].filter(Boolean).join(" - ")}
        placeholder={placeholder}
        searchPlaceholder="Search services..."
        disabled={disabled || !categoryId}
        error={error}
        fallbackLabel={fallbackLabel}
      />
    </div>
  );
}

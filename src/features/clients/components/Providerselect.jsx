import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getProviders } from "../../providers/services/providersService";

export default function ProviderSelect({
  value,
  onChange,
  placeholder = "Select a provider",
  error,
  disabled,
  queryKey = ["providers"],
  className = "w-full sm:w-72",
}) {
  return (
    <div className={className}>
      <SearchableAsyncSelect
        queryKey={queryKey}
        fetchItems={(pageNumber, pageSize, searchTerm) =>
          getProviders({ pageNumber, pageSize, searchTerm })
        }
        value={value}
        onChange={onChange}
        getOptionLabel={(item) =>
          item.arName && item.enName
            ? `${item.enName} - ${item.arName}`
            : item.arName || item.enName || ""
        }
        placeholder={placeholder}
        searchPlaceholder="Search providers..."
        disabled={disabled}
        error={error}
      />
    </div>
  );
}
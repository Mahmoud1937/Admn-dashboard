import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getProviders } from "../../providers/services/providersService";



export default function ProviderSelectDropdown({
  value,
  onChange,
  placeholder = "Select a provider",
  error,
  disabled,
}) {
  return (
    <SearchableAsyncSelect
      queryKey={["providers"]}
      fetchItems={(pageNumber, pageSize, searchTerm) =>
        getProviders({
          pageNumber,
          pageSize,
          searchTerm,
        })
      }
      value={value}
      onChange={onChange}
      getOptionLabel={(item) =>
        item.arName && item.enName
          ? `${item.arName} - ${item.enName}`
          : item.arName || item.enName || ""
      }
      placeholder={placeholder}
      searchPlaceholder="Search providers..."
      disabled={disabled}
      error={error}
    />
  );
}
import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getProviders } from "../../providers/services/providersService";


export default function ProviderSelect({
  value,
  onChange,
  placeholder = "All providers",
  error,
  disabled,
  className = "w-full sm:w-72", // default kept in line with ProviderCategorySelect
}) {
  return (
    <div className={className}>
      <SearchableAsyncSelect
        queryKey={["order-history-providers"]}
        fetchItems={(pageNumber, pageSize, searchTerm) =>
          getProviders({ pageNumber, pageSize, searchTerm })
        }
        value={value}
        onChange={onChange}
        getOptionLabel={(item) => `${item.enName} - ${item.arName}`}
        placeholder={placeholder}
        searchPlaceholder="Search providers..."
        disabled={disabled}
        error={error}
      />
    </div>
  );
}
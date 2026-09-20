import SearchableAsyncSelect from "./SearchableAsyncSelect";
import { getProviderLookup } from "../../features/providers/services/providersService";

const optionLabel = (item) =>
  item?.enName && item?.arName
    ? `${item.enName} - ${item.arName}`
    : item?.enName || item?.arName || "";

export default function ProviderSelect({
  queryKey,
  value,
  onChange,
  placeholder = "Select provider",
  error,
  disabled,
}) {
  return (
    <SearchableAsyncSelect
      queryKey={queryKey}
      fetchItems={(pageNumber, pageSize, searchTerm) =>
        getProviderLookup({ pageNumber, pageSize, searchTerm })
      }
      value={value}
      onChange={onChange}
      getOptionLabel={optionLabel}
      getOptionValue={(item) => item.id}
      placeholder={placeholder}
      searchPlaceholder="Search providers..."
      disabled={disabled}
      error={error}
    />
  );
}
import SearchableAsyncSelect from "./SearchableAsyncSelect";
import { getProviderLookup } from "../../features/providers/services/providersService";

const optionLabel = (item) =>
  item?.enName && item?.arName
    ? `${item.enName} - ${item.arName}`
    : item?.enName || item?.arName || "";

export default function ProviderSelect({
  queryKey = ["providers", "lookup"],
  value,
  onChange,
  placeholder = "Select provider",
  error,
  disabled,
  className,
  highlighted,
  rtl = false,
  searchPlaceholder = "Search providers...",
  labels,
  getOptionLabel = optionLabel,
}) {
  const select = (
    <SearchableAsyncSelect
      queryKey={queryKey}
      fetchItems={(pageNumber, pageSize, searchTerm) =>
        getProviderLookup({ pageNumber, pageSize, searchTerm })
      }
      value={value}
      onChange={onChange}
      getOptionLabel={getOptionLabel}
      getOptionValue={(item) => item.id}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      labels={labels}
      rtl={rtl}
      disabled={disabled}
      highlighted={highlighted}
      error={error}
    />
  );

  return className ? <div className={className}>{select}</div> : select;
}

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
}) {
  const select = (
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
      highlighted={highlighted}
      error={error}
    />
  );

  return className ? <div className={className}>{select}</div> : select;
}

import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getGovernorates } from "../../governorates/services/governoratesService";

export default function GovernorateSelect({
  value,
  onChange,
  placeholder = "Select governorate",
  error,
  disabled,
  searchPlaceholder = "Search governorates...",
  labels,
  language,
  rtl = false,
  getOptionLabel = (item) => `${item.enName} - ${item.arName}`,
}) {
  return (
    <div className="w-full">
      <SearchableAsyncSelect
        queryKey={language ? ["governorates", language] : ["governorates"]}
        fetchItems={getGovernorates}
        value={value}
        onChange={onChange}
        getOptionLabel={getOptionLabel}
        placeholder={placeholder}
        searchPlaceholder={searchPlaceholder}
        labels={labels}
        rtl={rtl}
        disabled={disabled}
        error={error}
      />
    </div>
  );
}

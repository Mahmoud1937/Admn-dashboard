import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getGovernorates } from "../../governorates/services/governoratesService";

export default function GovernorateSelect({
  value,
  onChange,
  placeholder = "Select governorate",
  error,
  disabled,
}) {
  return (
    <div className="w-full sm:w-72">
      <SearchableAsyncSelect
        queryKey={["governorates"]}
        fetchItems={getGovernorates}
        value={value}
        onChange={onChange}
        getOptionLabel={(item) => `${item.enName} - ${item.arName}`}
        placeholder={placeholder}
        searchPlaceholder="Search governorates..."
        disabled={disabled}
        error={error}
      />
    </div>
  );
}
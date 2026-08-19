import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getCities } from "../../cities/service/citeisService";


export default function CitySelect({
  governorateId,
  value,
  onChange,
  placeholder = "Select city",
  error,
  disabled,
}) {
  return (
    <div className="w-full">
      <SearchableAsyncSelect
        queryKey={["cities", governorateId]}
        fetchItems={(pageNumber, pageSize, searchTerm) =>
          getCities({ governorateId, pageNumber, pageSize, searchTerm })
        }
        value={value}
        onChange={onChange}
        getOptionLabel={(item) => `${item.enName} - ${item.arName}`}
        placeholder={
          !governorateId ? "Select governorate first" : placeholder
        }
        searchPlaceholder="Search cities..."
        disabled={disabled || !governorateId}
        error={error}
      />
    </div>
  );
}
import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getCities } from "../../cities/service/citeisService";


export default function CitySelect({
  governorateId,
  value,
  onChange,
  placeholder = "Select city",
  error,
  disabled,
  searchPlaceholder = "Search cities...",
  chooseFirstPlaceholder = "Choose Governorate First ",
  labels,
  language,
  rtl = false,
  getOptionLabel = (item) => `${item.enName} - ${item.arName}`,
}) {
  return (
    <div className="w-full">
      <SearchableAsyncSelect
        queryKey={language ? ["cities", governorateId, language] : ["cities", governorateId]}
        fetchItems={(pageNumber, pageSize, searchTerm) =>
          getCities({ governorateId, pageNumber, pageSize, searchTerm })
        }
        value={value}
        onChange={onChange}
        getOptionLabel={getOptionLabel}
        placeholder={!governorateId ? chooseFirstPlaceholder : placeholder}
        searchPlaceholder={searchPlaceholder}
        labels={labels}
        rtl={rtl}
        disabled={disabled || !governorateId}
        error={error}
      />
    </div>
  );
}

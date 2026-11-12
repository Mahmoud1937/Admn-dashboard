import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getSpecialists } from "../../specialists/service/SpecialistsService";


export default function SpecialistSelect({ value, onChange, placeholder = "Select specialist", searchPlaceholder = "Search specialists...", labels, language, rtl, error, disabled, getOptionLabel = (item) => `${item.enName} - ${item.arName}` }) {
  return (
    <SearchableAsyncSelect
      queryKey={language ? ["specialists", language] : ["specialists"]}
      fetchItems={getSpecialists}
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
  );
}

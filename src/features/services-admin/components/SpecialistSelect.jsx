import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getSpecialists } from "../../specialists/service/SpecialistsService";


export default function SpecialistSelect({ value, onChange, placeholder = "Select specialist", error, disabled }) {
  return (
    <SearchableAsyncSelect
      queryKey={["specialists"]}
      fetchItems={getSpecialists}
      value={value}
      onChange={onChange}
      getOptionLabel={(item) => `${item.enName} - ${item.arName}`}
      placeholder={placeholder}
      searchPlaceholder="Search specialists..."
      disabled={disabled}
      error={error}
    />
  );
}
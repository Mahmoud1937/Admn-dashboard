import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getServiceCategories } from "../../ServiceCategory/services/Servicecategoriesservice";

export default function CategorySelect({
  value,
  onChange,
  placeholder = "Select category",
  error,
  disabled,
}) {
  return (
    <div className="w-full sm:w-72">
      <SearchableAsyncSelect
        queryKey={["categories"]}
        fetchItems={getServiceCategories}
        value={value}
        onChange={onChange}
        getOptionLabel={(item) => `${item.enName} - ${item.arName}`}
        placeholder={placeholder}
        searchPlaceholder="Search categories..."
        disabled={disabled}
        error={error}
      />
    </div>
  );
}
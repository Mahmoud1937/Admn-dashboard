import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getCategories } from "../../categoreis/service/categoryService";


export default function ProviderCategorySelect({
  value,
  onChange,
  placeholder = "All categories",
  error,
  disabled,
}) {
  return (
    <div className="w-full sm:w-72">
      <SearchableAsyncSelect
        queryKey={["provider-categories"]}
        fetchItems={(pageNumber, pageSize, searchTerm) =>
          getCategories(pageNumber, pageSize, searchTerm)
        }
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
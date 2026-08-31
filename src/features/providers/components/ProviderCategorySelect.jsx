import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getCategories } from "../../categoreis/service/categoryService";

export default function ProviderCategorySelect({
  value,
  onChange,
  placeholder = "All categories",
  error,
  disabled,
  className = "w-full sm:w-72", // default kept exactly as before
}) {
  return (
    <div className={className}>
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
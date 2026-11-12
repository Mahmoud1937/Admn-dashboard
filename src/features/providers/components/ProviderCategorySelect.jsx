import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getCategories } from "../../categoreis/service/categoryService";

export default function ProviderCategorySelect({
  value,
  onChange,
  placeholder = "All categories",
  error,
  disabled,
  className = "w-full sm:w-72", // default kept exactly as before
  searchPlaceholder = "Search categories...",
  labels,
  language,
  rtl,
  getOptionLabel = (item) => `${item.enName} - ${item.arName}`,
}) {
  return (
    <div className={className}>
      <SearchableAsyncSelect
        queryKey={language ? ["provider-categories", language] : ["provider-categories"]}
        fetchItems={(pageNumber, pageSize, searchTerm) =>
          getCategories(pageNumber, pageSize, searchTerm)
        }
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

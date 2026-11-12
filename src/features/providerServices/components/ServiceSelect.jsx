import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getServices } from "../../services-admin/services/ServicesService";


export default function ServiceSelect({
  categoryId, 
  value,
  onChange,
  placeholder = "Select service",
  error,
  disabled,
  searchPlaceholder = "Search services...",
  labels,
  language,
  rtl,
  getOptionLabel = (item) => `${item.enName} - ${item.arName}`,
}) {
  return (
    <div className="w-full">
      <SearchableAsyncSelect
        queryKey={language ? ["services", categoryId ?? "all", language] : ["services", categoryId ?? "all"]}
        fetchItems={(pageNumber, pageSize, searchTerm) =>
          getServices({ categoryId, pageNumber, pageSize, searchTerm })
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

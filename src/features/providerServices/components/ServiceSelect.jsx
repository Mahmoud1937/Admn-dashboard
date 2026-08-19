import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getServices } from "../../services-admin/services/ServicesService";


export default function ServiceSelect({
  categoryId, 
  value,
  onChange,
  placeholder = "Select service",
  error,
  disabled,
}) {
  return (
    <div className="w-full">
      <SearchableAsyncSelect
        queryKey={["services", categoryId ?? "all"]}
        fetchItems={(pageNumber, pageSize, searchTerm) =>
          getServices({ categoryId, pageNumber, pageSize, searchTerm })
        }
        value={value}
        onChange={onChange}
        getOptionLabel={(item) => `${item.enName} - ${item.arName}`}
        placeholder={placeholder}
        searchPlaceholder="Search services..."
        disabled={disabled}
        error={error}
      />
    </div>
  );
}
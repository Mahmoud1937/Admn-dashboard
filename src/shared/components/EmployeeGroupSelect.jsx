import SearchableAsyncSelect from "./SearchableAsyncSelect";
import { getEmployeeGroups } from "../../features/tickets/services/ticketsService";

const optionLabel = (item) =>
  item?.enName && item?.arName
    ? `${item.enName} - ${item.arName}`
    : item?.enName || item?.arName || "";

export default function EmployeeGroupSelect({
  queryKey,
  value,
  onChange,
  placeholder = "Select employee group",
  error,
  disabled,
}) {
  return (
    <SearchableAsyncSelect
      queryKey={queryKey}
      fetchItems={(pageNumber, pageSize, searchTerm) =>
        getEmployeeGroups(pageNumber, pageSize, searchTerm)
      }
      value={value}
      onChange={onChange}
      getOptionLabel={optionLabel}
      getOptionValue={(item) => item.id}
      placeholder={placeholder}
      searchPlaceholder="Search employee groups..."
      disabled={disabled}
      error={error}
    />
  );
}
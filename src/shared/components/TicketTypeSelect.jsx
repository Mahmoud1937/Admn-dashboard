import SearchableAsyncSelect from "./SearchableAsyncSelect";
import { getTicketTypes } from "../../features/ticket-types/services/ticketTypesService";

const optionLabel = (item) =>
  item?.enName && item?.arName
    ? `${item.enName} - ${item.arName}`
    : item?.enName || item?.arName || "";

export default function TicketTypeSelect({
  queryKey,
  value,
  onChange,
  placeholder = "Select ticket type",
  error,
  disabled,
}) {
  return (
    <SearchableAsyncSelect
      queryKey={queryKey}
      fetchItems={(pageNumber, pageSize, searchTerm) =>
        getTicketTypes(pageNumber, pageSize, searchTerm)
      }
      value={value}
      onChange={onChange}
      getOptionLabel={optionLabel}
      getOptionValue={(item) => item.id}
      placeholder={placeholder}
      searchPlaceholder="Search ticket types..."
      disabled={disabled}
      error={error}
    />
  );
}
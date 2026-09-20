import SearchableAsyncSelect from "./SearchableAsyncSelect";
import { getClients } from "../../features/clients/services/clientsService";

export default function ClientSelect({
  queryKey,
  value,
  onChange,
  placeholder = "Select client",
  error,
  disabled,
}) {
  return (
    <SearchableAsyncSelect
      queryKey={queryKey}
      fetchItems={(pageNumber, pageSize, searchTerm) =>
        getClients({ pageNumber, pageSize, searchTerm })
      }
      value={value}
      onChange={onChange}
      getOptionLabel={(client) => client.userName || ""}
      getOptionValue={(item) => item.clientId}
      placeholder={placeholder}
      searchPlaceholder="Search clients..."
      disabled={disabled}
      error={error}
    />
  );
}
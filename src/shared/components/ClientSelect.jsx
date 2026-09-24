import SearchableAsyncSelect from "./SearchableAsyncSelect";
import { getClientsLookup } from "../../features/clients/services/clientsService";

export default function ClientSelect({
  queryKey,
  value,
  onChange,
  placeholder = "Select client",
  error,
  disabled,
  fallbackLabel,
}) {
  return (
    <SearchableAsyncSelect
      queryKey={queryKey}
      fetchItems={(pageNumber, pageSize, searchTerm) =>
        getClientsLookup({ pageNumber, pageSize, searchTerm })
      }
      value={value}
      onChange={onChange}
      getOptionLabel={(client) => {
        const name =
          client.fullName ||
          client.userName ||
          [client.firstName, client.lastName].filter(Boolean).join(" ");
        return name || "";
      }}
      getOptionValue={(client) => client.id ?? client.clientId}
      placeholder={placeholder}
      searchPlaceholder="Search clients..."
      disabled={disabled}
      error={error}
      fallbackLabel={fallbackLabel}
    />
  );
}

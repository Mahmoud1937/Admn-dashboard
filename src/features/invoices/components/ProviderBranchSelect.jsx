import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getBranchesLookup } from "../../branches/services/providerBranchesService";


export default function ProviderBranchSelect({
  value,
  onChange,
  providerId,
  placeholder = "Select a branch",
  error,
  disabled,
  className = "w-full sm:w-72",
}) {
  return (
    <div className={className}>
      <SearchableAsyncSelect
        queryKey={["provider-branches", "lookup", providerId]}
        fetchItems={(pageNumber, pageSize, searchTerm) =>
          getBranchesLookup({ providerId, pageNumber, pageSize, searchTerm })
        }
        value={value}
        onChange={onChange}
        getOptionLabel={(item) => item.branchName || ""}
        getOptionValue={(item) => item.providerBranchId}
        placeholder={providerId ? placeholder : "Select a provider first"}
        searchPlaceholder="Search branches..."
        disabled={disabled || !providerId}
        error={error}
      />
    </div>
  );
}
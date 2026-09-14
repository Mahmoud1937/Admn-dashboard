import SearchableAsyncSelect from "../../../shared/components/SearchableAsyncSelect";
import { getProviderBranches } from "../../branches/services/providerBranchesService";

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
          getProviderBranches({ providerId, pageNumber, pageSize, search: searchTerm })
            .then((res) => ({ data: res })) // <-- الفرق هنا: نلف الرد في { data: ... }
        }
        value={value}
        onChange={onChange}
        getOptionLabel={(item) => item.branchName || ""}
        getOptionValue={(item) => item.id}
        placeholder={providerId ? placeholder : "Select a provider first"}
        searchPlaceholder="Search branches..."
        disabled={disabled || !providerId}
        error={error}
      />
    </div>
  );
}
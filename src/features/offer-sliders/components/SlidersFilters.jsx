import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SlidersFilters = ({ search, onSearchChange, totalCount }) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      <div className="relative w-full sm:max-w-sm">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by provider name..."
          className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-3 py-1.5 self-start sm:self-auto whitespace-nowrap">
        {totalCount} slider{totalCount === 1 ? "" : "s"}
      </span>
    </div>
  );
};

export default SlidersFilters;
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SlidersFilters = ({ search, onSearchChange, totalCount }) => {
  return (
    <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by provider name..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white"
        />
      </div>

      <span className="self-start whitespace-nowrap rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500 sm:self-auto">
        {totalCount} slider{totalCount === 1 ? "" : "s"}
      </span>
    </div>
  );
};

export default SlidersFilters;

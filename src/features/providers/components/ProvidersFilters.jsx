import { useQuery } from "@tanstack/react-query";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { getCategories } from "../../categoreis/service/categoryService";
import { getSpecialists } from "../../specialists/service/SpecialistsService";

export const emptyFilters = {
  status: 0,
  joinDateFrom: "",
  joinDateTo: "",
  categoryId: "",
  specialistId: "",
};

export default function ProvidersFilters({ draft, onChange, onApply, onClear, onClose, panelRef }) {
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories", "dropdown"],
    queryFn: () => getCategories(),
  });

  const { data: specialistsData, isLoading: isSpecialistsLoading } = useQuery({
    queryKey: ["specialists", "dropdown"],
    queryFn: () => getSpecialists(1, 1000),
  });

  const categories = categoriesData?.data?.items ?? [];
  const specialists = specialistsData?.data?.items ?? [];
  const set = (field) => (e) =>
    onChange((prev) => ({ ...prev, [field]: e.target.value }));

  const setStatus = (e) =>
    onChange((prev) => ({ ...prev, status: Number(e.target.value) }));

  return (
    <>
      {/* Mobile-only backdrop, closes the panel on outside tap */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-20 bg-slate-900/30 sm:hidden"
      />

      <div
        ref={panelRef}
        className="
          fixed inset-x-0 bottom-0 z-30 max-h-[85vh] w-full overflow-y-auto
          rounded-t-2xl border border-slate-200 bg-white p-5 shadow-lg
          sm:absolute sm:inset-x-auto sm:right-4 sm:top-full sm:bottom-auto
          sm:z-20 sm:mt-2 sm:max-h-none sm:w-80 sm:rounded-xl sm:bg-white/95
          sm:backdrop-blur-sm
        "
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Filters</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Status
          </label>
          <select
            value={draft.status}
            onChange={setStatus}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
          >
            <option value={0}>All</option>
            <option value={1}>Active</option>
            <option value={2}>Inactive</option>
          </select>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Join Date From
            </label>
            <input
              type="date"
              value={draft.joinDateFrom}
              onChange={set("joinDateFrom")}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Join Date To
            </label>
            <input
              type="date"
              value={draft.joinDateTo}
              onChange={set("joinDateTo")}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Category
          </label>
          <select
            value={draft.categoryId}
            onChange={set("categoryId")}
            disabled={isCategoriesLoading}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">
              {isCategoriesLoading ? "Loading categories..." : "All categories"}
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.enName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            Specialist
          </label>
          <select
            value={draft.specialistId}
            onChange={set("specialistId")}
            disabled={isSpecialistsLoading}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="">
              {isSpecialistsLoading ? "Loading specialists..." : "All specialists"}
            </option>
            {specialists.map((spec) => (
              <option key={spec.id} value={spec.id}>
                {spec.enName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            onClick={onClear}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Clear all
          </button>
          <button
            onClick={onApply}
            className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  );
}
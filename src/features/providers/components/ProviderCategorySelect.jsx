import { useProviderCategoriesLookup } from "../hooks/useProviderLookups";

export default function ProviderCategorySelect({
  value,
  onChange,
  placeholder = "All categories",
  disabled,
}) {
  const { categories, isLoading } = useProviderCategoriesLookup();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || isLoading}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 disabled:bg-slate-50 disabled:text-slate-400"
    >
      <option value="">{isLoading ? "Loading categories..." : placeholder}</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.enName} - {category.arName}
        </option>
      ))}
    </select>
  );
}
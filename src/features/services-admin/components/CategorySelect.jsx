import { forwardRef } from "react";

const CategorySelect = forwardRef(function CategorySelect(
  { categories, placeholder, className, ...rest },
  ref
) {
  return (
    <select ref={ref} className={className} {...rest}>
      <option value="">{placeholder}</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.enName}
        </option>
      ))}
    </select>
  );
});

export default CategorySelect;
export function countActiveFilters(filters) {
  let count = 0;

  if (filters.status !== 0) count++;
  if (filters.joinDateFrom) count++;
  if (filters.joinDateTo) count++;
  if (filters.categoryId) count++;
  if (filters.specialistId) count++;

  return count;
}
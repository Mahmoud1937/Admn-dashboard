export const countActiveInvoiceFilters = (filters) => {
  const fields = ["clientId", "providerId", "providerBranchId", "status", "fromDate", "toDate", "isCash"];
  return fields.reduce((count, key) => (filters[key] ? count + 1 : count), 0);
};

export function countActiveTicketFilters(filters) {
  return [
    filters.ticketTypeId,
    filters.providerId,
    filters.employeeGroupId,
    filters.priority,
    filters.isClosed,
  ].filter((value) => value !== "" && value !== undefined && value !== null).length;
}

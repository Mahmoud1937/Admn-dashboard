import axiosInstance from "../../../shared/api/axiosInstance";

export async function getTickets({
  pageNumber = 1,
  pageSize,
  searchTerm = "",
  filters = {},
} = {}) {
  const { data } = await axiosInstance.get("/admin/tickets", {
    params: {
      SearchTerm: searchTerm || undefined,
      TicketTypeId: filters.ticketTypeId || undefined,
      ProviderId: filters.providerId || undefined,
      EmployeeGroupId: filters.employeeGroupId || undefined,
      Priority: filters.priority === "" ? undefined : filters.priority,
      IsClosed: filters.isClosed === "" ? undefined : filters.isClosed,
      PageNumber: pageNumber,
      PageSize: pageSize || undefined,
    },
  });

  return data;
}

export async function createTicket(payload) {
  const { data } = await axiosInstance.post("/admin/tickets", {
    ticketTypeId: payload.ticketTypeId,
    userId: payload.userId,
    providerId: payload.providerId ?? null,
    assignedToGroupId: payload.assignedToGroupId ?? null,
    userPhoneNumber: payload.userPhoneNumber,
    priority: payload.priority,
    description: payload.description,
  });

  return data;
}

const hasPayloadValue = (value) =>
  value !== "" && value !== null && value !== undefined;

export async function updateTicket({ id, payload }) {
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => hasPayloadValue(value))
  );

  const { data } = await axiosInstance.put(`/admin/tickets/${id}`, cleanPayload);

  return data;
}

export async function getTicketById(id) {
  const { data } = await axiosInstance.get(`/admin/tickets/${id}`);

  return data;
}

export async function getEmployeeGroups(pageNumber = 1, pageSize, searchTerm = "") {
  const { data } = await axiosInstance.get("/AdminLookup/employee-groups", {
    params: {
      SearchTerm: searchTerm || undefined,
      PageNumber: pageNumber,
      PageSize: pageSize || undefined,
    },
  });

  return data;
}

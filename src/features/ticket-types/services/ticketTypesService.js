import axiosInstance from "../../../shared/api/axiosInstance";

export async function getTicketTypes(pageNumber = 1, pageSize, search = "") {
  const { data } = await axiosInstance.get("/ticket-types", {
    params: {
      Search: search || undefined,
      PageNumber: pageNumber,
      PageSize: pageSize || undefined,
    },
  });

  return data;
}

export async function createTicketType(payload) {
  const { data } = await axiosInstance.post("/ticket-types", {
    arName: payload.arName,
    enName: payload.enName,
  });

  return data;
}

export async function updateTicketType(payload) {
  const { data } = await axiosInstance.put(`/ticket-types/${payload.id}`, {
    arName: payload.arName,
    enName: payload.enName,
  });

  return data;
}

export async function deleteTicketType(id) {
  const { data } = await axiosInstance.delete(`/ticket-types/${id}`);

  return data;
}

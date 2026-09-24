import axiosInstance from "../../../shared/api/axiosInstance";

export const getClients = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );

  const { data } = await axiosInstance.get("/ClientAdmin", {
    params: cleanParams,
  });

  return data;
};

export const exportClients = async (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );

  const response = await axiosInstance.get("/ClientAdmin/export", {
    params: cleanParams,
    responseType: "blob",
  });

  return response.data;
};

export const blockClient = async ({ userId, isBlocked }) => {
  // NOTE: assumed PUT since this updates a resource's state — swap to
  // axiosInstance.post(...) if your backend actually expects POST here.
  const { data } = await axiosInstance.put("/ClientAdmin/block", {
    userId,
    isBlocked,
  });

  return data;
};

export const getClientById = async (id) => {
  const { data } = await axiosInstance.get(`/ClientAdmin/${id}`);
  return data;
};

const toIsoDateTime = (dateStr, isEndOfDay = false) => {
  if (!dateStr) return undefined;
  const time = isEndOfDay ? "23:59:59.999Z" : "00:00:00.000Z";
  return `${dateStr}T${time}`;
};

export async function getOrderHistory({
  userId,
  providerId,
  status,
  fromDate,
  toDate,
  pageNumber = 1,
  pageSize = 15,
} = {}) {
  const { data } = await axiosInstance.get("/ClientAdmin/order-history", {
    params: {
      UserId: userId,
      ProviderId: providerId || undefined,
      Status: status || undefined,
      FromDate: toIsoDateTime(fromDate),
      ToDate: toIsoDateTime(toDate, true),
      PageNumber: pageNumber,
      PageSize: pageSize,
    },
  });

  return data;
}
export async function getFamilyMembers(clientId) {
  const { data } = await axiosInstance.get(`/ClientAdmin/${clientId}/family-members`);
  return data;
}
export const getInvoiceDetails = async (invoiceId) => {
  const { data } = await axiosInstance.get(
    `/ProviderBranchView/invoices/${invoiceId}/details`
  );

  return data;
};

export const clientsService = {
  getClients,
  exportClients,
  getClientById,
  blockClient,
  getOrderHistory,
  getInvoiceDetails,
};
export const getClientsLookup = async ({ pageNumber = 1, pageSize = 20, searchTerm = "" } = {}) => {
  const res = await axiosInstance.get("/AdminLookup/clients", {
    params: {
      SearchTerm: searchTerm,
      PageNumber: pageNumber,
      PageSize: pageSize,
    },
  });
  // Keep the same response shape expected by SearchableAsyncSelect:
  // { data: { items, pageNumber, pageSize, totalCount, totalPages } }.
  return res.data;
};
export default clientsService;

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
      FromDate: fromDate || undefined,
      ToDate: toDate || undefined,
      PageNumber: pageNumber,
      PageSize: pageSize,
    },
  });

  return data;
}

export const clientsService = { getClients, getClientById, blockClient, getOrderHistory };
export default clientsService;
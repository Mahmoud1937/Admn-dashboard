import axiosInstance from "../../../shared/api/axiosInstance";

const BASE = "/BrokerAdmin";

export async function getBrokers({ pageNumber, pageSize, searchTerm }) {
  const { data } = await axiosInstance.get(BASE, {
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize,
      SearchTerm: searchTerm || undefined,
    },
  });
  return data;
}

export async function createBroker(payload) {
  const { data } = await axiosInstance.post(BASE, payload);
  return data;
}

export async function updateBroker({ id, ...payload }) {
  const { data } = await axiosInstance.put(`${BASE}/${id}`, payload);
  return data;
}

export async function deleteBroker(id) {
  const { data } = await axiosInstance.delete(`${BASE}/${id}`);
  return data;
}

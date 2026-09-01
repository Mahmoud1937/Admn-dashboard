import axiosInstance from "../../../shared/api/axiosInstance";

const BASE_URL = "/admin/card-solds";

// GET /api/admin/card-solds?SearchTerm=&PageNumber=&PageSize=
export const getCardSolds = async ({ searchTerm, pageNumber, pageSize }) => {
  const response = await axiosInstance.get(BASE_URL, {
    params: {
      SearchTerm: searchTerm || undefined,
      PageNumber: pageNumber,
      PageSize: pageSize,
    },
  });
  return response.data.data; // { items, pageNumber, pageSize, totalCount, totalPages }
};

// POST /api/admin/card-solds/by-count  (multipart/form-data)
export const createCardSoldByCount = async ({

  count,
  clientName,
  clientPhone,
  proofPayment,
}) => {
  const formData = new FormData();

  formData.append("Count", count);
  formData.append("ClientName", clientName);
  formData.append("ClientPhone", clientPhone);
  formData.append("ProofPayment", proofPayment);

  const response = await axiosInstance.post(`${BASE_URL}/by-count`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

// POST /api/admin/card-solds/by-numbers  (multipart/form-data)
export const createCardSoldByNumbers = async ({
  cardNumbers,
  clientName,
  clientPhone,
  proofPayment,
}) => {
  const formData = new FormData();
  cardNumbers.forEach((num) => formData.append("CardNumbers", num));
  formData.append("ClientName", clientName);
  formData.append("ClientPhone", clientPhone);
  formData.append("ProofPayment", proofPayment);

  const response = await axiosInstance.post(`${BASE_URL}/by-numbers`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

// GET /api/admin/card-solds/{id}/export -> Excel blob
export const exportCardSold = async (id) => {
  const response = await axiosInstance.get(`${BASE_URL}/${id}/export`, {
    responseType: "blob",
  });
  return response.data;
};

// DELETE /api/admin/card-solds/{id}
export const deleteCardSold = async (id) => {
  const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
  return response.data;
};
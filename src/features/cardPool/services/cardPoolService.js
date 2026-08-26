import axiosInstance from "../../../shared/api/axiosInstance";


const BASE_URL = "/CardPoolAdmin";

// GET /api/CardPoolAdmin?SearchTerm=&PageNumber=&PageSize=
export const getCardPools = async ({ searchTerm, pageNumber, pageSize }) => {
  const response = await axiosInstance.get(BASE_URL, {
    params: {
      SearchTerm: searchTerm || undefined,
      PageNumber: pageNumber,
      PageSize: pageSize,
    },
  });
  return response.data.data; // { items, pageNumber, pageSize, totalCount, totalPages }
};

// POST /api/CardPoolAdmin  { count }
export const createCardPool = async (payload) => {
  const formData = new URLSearchParams();
  formData.append("count", payload.count);
 
  const response = await axiosInstance.post(BASE_URL, formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data.data; // { id, from, to, createdAt, cardSold, cardMissed }
};
// GET /api/CardPoolAdmin/{id}/export -> returns the Excel file as a blob
export const exportCardPool = async (id) => {
  const response = await axiosInstance.get(`${BASE_URL}/${id}/export`, {
    responseType: "blob",
  });
  return response.data;
};

// DELETE /api/CardPoolAdmin/{id}
export const deleteCardPool = async (id) => {
  const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
  return response.data;
};
import axiosInstance from "../../../shared/api/axiosInstance";

const BASE_URL = "/CardPoolAdmin";

// Converts a plain date string ("2026-08-26") to ISO 8601 UTC datetime.
// isEndOfDay=true pushes ToDate to the end of that day so the range is inclusive.
const toIsoDateTime = (dateStr, isEndOfDay = false) => {
  if (!dateStr) return undefined;
  const time = isEndOfDay ? "23:59:59.999Z" : "00:00:00.000Z";
  return `${dateStr}T${time}`;
};

// GET /api/CardPoolAdmin?SearchTerm=&FromDate=&ToDate=&PageNumber=&PageSize=
export const getCardPools = async ({ searchTerm, fromDate, toDate, pageNumber, pageSize }) => {
  const response = await axiosInstance.get(BASE_URL, {
    params: {
      SearchTerm: searchTerm || undefined,
      FromDate: toIsoDateTime(fromDate),
      ToDate: toIsoDateTime(toDate, true),
      PageNumber: pageNumber,
      PageSize: pageSize,
    },
  });
  return response.data.data; // { items, pageNumber, pageSize, totalCount, totalPages }
};
export const getSoldCards = async ({ cardPoolId, searchTerm, pageNumber, pageSize }) => {
  const response = await axiosInstance.get(`${BASE_URL}/sold-cards`, {
    params: {
      CardPoolId: cardPoolId,
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
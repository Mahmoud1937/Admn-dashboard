import axiosInstance from "../../../shared/api/axiosInstance";

const BASE_URL = "/CardMissedAdmin";

// GET /api/CardMissedAdmin?SearchTerm=&PageNumber=&PageSize=
export const getCardMisseds = async ({ searchTerm, pageNumber, pageSize }) => {
  const response = await axiosInstance.get(BASE_URL, {
    params: {
      SearchTerm: searchTerm || undefined,
      PageNumber: pageNumber,
      PageSize: pageSize,
    },
  });
  return response.data.data; // { items, pageNumber, pageSize, totalCount, totalPages }
};

// POST /api/CardMissedAdmin  { cardNumber, missingType }
export const createCardMissed = async (payload) => {
  const response = await axiosInstance.post(BASE_URL, {
    cardNumber: payload.cardNumber,
    missingType: payload.missingType, // 0 = Missed, 1 = Damaged
  });
  return response.data.data; // { id, cardNumber, cardPoolId, missingType, createdAt, createdBy }
};

// DELETE /api/CardMissedAdmin/{id}
export const deleteCardMissed = async (id) => {
  const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
  return response.data;
};
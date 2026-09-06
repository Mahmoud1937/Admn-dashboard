import axiosInstance from "../../../shared/api/axiosInstance";

const BASE_URL = "/CardMissedAdmin";
//https://medicard-api-v2.medicardeg.com/api/CardMissedAdmin
// GET /api/CardMissedAdmin?CardPoolId=&SearchTerm=&PageNumber=&PageSize=
export const getCardMisseds = async ({
  cardPoolId,
  searchTerm,
  fromDate,
  toDate,
  pageNumber,
  pageSize,
}) => {
  const response = await axiosInstance.get(BASE_URL, {
    params: {
      CardPoolId: cardPoolId || undefined,
      SearchTerm: searchTerm || undefined,
      FromDate: fromDate || undefined,
      ToDate: toDate || undefined,
      PageNumber: pageNumber,
      PageSize: pageSize,
    },
  });
  return response.data.data;
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
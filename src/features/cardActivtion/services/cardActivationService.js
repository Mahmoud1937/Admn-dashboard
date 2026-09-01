import axiosInstance from "../../../shared/api/axiosInstance";

const BASE_URL = "/CardAdmin";

// GET /api/CardAdmin?Id=&SourceType=&PageNumber=&PageSize=
export const getActivatedCards = async ({ id, sourceType, pageNumber, pageSize }) => {
  const response = await axiosInstance.get(BASE_URL, {
    params: {
      Id: id,
      SourceType: sourceType,
      PageNumber: pageNumber,
      PageSize: pageSize,
    },
  });
  return response.data.data; // { items, pageNumber, pageSize, totalCount, totalPages }
};
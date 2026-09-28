import axiosInstance from "../../../shared/api/axiosInstance";

const BASE_URL = "/CardAdmin";
export const getNotActivatedCards = async ({ id, sourceType, searchTerm, pageNumber, pageSize }) => {
  const response = await axiosInstance.get(`${BASE_URL}/not-activated`, {
    params: {
      Id: id,
      SourceType: sourceType,
      SearchTerm: searchTerm || undefined,
      PageNumber: pageNumber,
      PageSize: pageSize,
    },
  });
  return response.data.data;
};
export const exportNotActivatedCards = async ({
  id,
  sourceType,
  searchTerm,
  pageNumber,
  pageSize,
} = {}) => {
  const response = await axiosInstance.get(
    "/CardAdmin/not-activated-cards/export",
    {
      params: {
        Id: id || undefined,
        SourceType: sourceType || undefined,
        SearchTerm: searchTerm || undefined,
        PageNumber: pageNumber || undefined,
        PageSize: pageSize || undefined,
      },
      responseType: "blob",
    }
  );

  return response;
};
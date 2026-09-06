import axiosInstance from "../../../shared/api/axiosInstance";

const BASE_URL = "/CardAdmin";

// GET /api/CardAdmin/activated?Id=&SourceType=&PageNumber=&PageSize=
// export const getActivatedCards = async ({ id, sourceType, pageNumber, pageSize }) => {
//   const response = await axiosInstance.get(`${BASE_URL}/activated`, {
//     params: {
//       Id: id,
//       SourceType: sourceType,
//       PageNumber: pageNumber,
//       PageSize: pageSize,
//     },
//   });
//   return response.data.data;
// };

// GET /api/CardAdmin/not-activated?Id=&SourceType=&SearchTerm=&PageNumber=&PageSize=
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
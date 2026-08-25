import axiosInstance from "../../../shared/api/axiosInstance";


const BASE_URL = "/SliderAdmin";

// GET /api/SliderAdmin
export const getSliders = async ({ pageNumber = 1, pageSize = 15, search = "" } = {}) => {
  const { data } = await axiosInstance.get(BASE_URL, {
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize,
      ProviderName: search || undefined,
    },
  });
  return data.data; // { items, pageNumber, pageSize, totalCount, totalPages }
};

// GET /api/SliderAdmin/{id}
export const getSliderById = async (id) => {
  const { data } = await axiosInstance.get(`${BASE_URL}/${id}`);
  return data.data; // { id, providerId, providerNameEn, providerNameAr, enImageUrl, arImageUrl, createdAt }
};

// POST /api/SliderAdmin (multipart لأن فيه صورتين EN/AR)
export const createSlider = async (payload) => {
  const formData = new FormData();
  formData.append("ProviderId", String(payload.providerId));
  if (payload.enImageFile) formData.append("EnImage", payload.enImageFile);
  if (payload.arImageFile) formData.append("ArImage", payload.arImageFile);

  const { data } = await axiosInstance.post(BASE_URL, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};

export const updateSlider = async (payload) => {
  const formData = new FormData();

  formData.append("Id", String(payload.id));
  formData.append("ProviderId", String(payload.providerId));
  formData.append("IsUpdatedImageEn",String(payload.isUpdatedImageEn));
  formData.append( "IsUpdatedImageAr",String(payload.isUpdatedImageAr));

  if (payload.isUpdatedImageEn && payload.enImageFile) {
    formData.append("EnImage", payload.enImageFile);
  }

  if (payload.isUpdatedImageAr && payload.arImageFile) {
    formData.append("ArImage", payload.arImageFile);
  }

const { data } = await axiosInstance.put(BASE_URL, formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});
  return data.data;
};
// DELETE /api/SliderAdmin/{id}
export const deleteSlider = async (id) => {
  const { data } = await axiosInstance.delete(`${BASE_URL}/${id}`);
  return data.data;
};
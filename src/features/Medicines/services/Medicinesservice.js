import axiosInstance from "../../../shared/api/axiosInstance";

export async function getMedicines({
  pageNumber = 1,
  pageSize,
  searchTerm = "",
} = {}) {
  const { data } = await axiosInstance.get("/MedicineAdmin/medicines", {
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize || undefined,
      SearchTerm: searchTerm || undefined,
    },
  });

  return data;
}

export async function getMedicineById(id) {
  const { data } = await axiosInstance.get(`/MedicineAdmin/medicines/${id}`);
  return data;
}

export async function createMedicine(payload) {
  const formData = new FormData();

  formData.append("arName", payload.arName);
  formData.append("enName", payload.enName);
  formData.append("medicinePrice", payload.medicinePrice);
  formData.append("medicineForm", payload.medicineForm);

  if (payload.imageFile) {
    formData.append("medicineImageUrl", payload.imageFile);
  }

  const { data } = await axiosInstance.post(
    "/MedicineAdmin/medicines",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return data;
}

export async function updateMedicine(id, payload) {
  const formData = new FormData();

  formData.append("arName", payload.arName);
  formData.append("enName", payload.enName);
  formData.append("medicinePrice", payload.medicinePrice);
  formData.append("medicineForm", payload.medicineForm);
  formData.append("isUpdatedImage", payload.isUpdatedImage);

  if (payload.isUpdatedImage && payload.imageFile) {
    formData.append("medicineImageUrl", payload.imageFile);
  }

  const { data } = await axiosInstance.put(
    `/MedicineAdmin/medicines/${id}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return data;
}

export async function deleteMedicine(id) {
  const { data } = await axiosInstance.delete(`/MedicineAdmin/medicines/${id}`);
  return data;
}
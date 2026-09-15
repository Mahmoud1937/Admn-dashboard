import axiosInstance from "../../../shared/api/axiosInstance";

export async function getSubscriptionTypes(pageNumber = 1, pageSize, searchTerm = "") {
  const { data } = await axiosInstance.get("/PlanTypeAdmin", {
    params: {
      SearchTerm: searchTerm || undefined,
      PageNumber: pageNumber,
      PageSize: pageSize || undefined,
    },
  });

  return data;
}

export async function createSubscriptionType(payload) {
  const { data } = await axiosInstance.post("/PlanTypeAdmin", {
    nameAr: payload.nameAr,
    nameEn: payload.nameEn,
    priceBefore: payload.priceBefore,
    discountPercentage: payload.discountPercentage,
    descriptionAr: payload.descriptionAr,
    descriptionEn: payload.descriptionEn,
  });

  return data;
}

export async function updateSubscriptionType(payload) {
  const { data } = await axiosInstance.put(`/PlanTypeAdmin/${payload.id}`, {
    nameAr: payload.nameAr,
    nameEn: payload.nameEn,
    priceBefore: payload.priceBefore,
    discountPercentage: payload.discountPercentage,
    descriptionAr: payload.descriptionAr,
    descriptionEn: payload.descriptionEn,
  });

  return data;
}

export async function deleteSubscriptionType(id) {
  const { data } = await axiosInstance.delete(`/PlanTypeAdmin/${id}`);

  return data;
}

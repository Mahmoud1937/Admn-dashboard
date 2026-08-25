import axiosInstance from "../../../shared/api/axiosInstance";

const BASE_URL = "/RefundPolicyAdmin";

export const getRefundPolicy = async () => {
  const { data } = await axiosInstance.get(BASE_URL);
  return data;
};

export const updateRefundPolicy = async ({
  descriptionEn,
  descriptionAr,
}) => {
  const { data } = await axiosInstance.post(BASE_URL, {
    descriptionEn,
    descriptionAr,
  });
  return data;
};

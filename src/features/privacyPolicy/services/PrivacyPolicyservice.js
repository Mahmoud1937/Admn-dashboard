import axiosInstance from "../../../shared/api/axiosInstance";

const BASE_URL = "/PrivacyPolicyAdmin";

export const getPrivacyPolicy = async () => {
  const { data } = await axiosInstance.get(BASE_URL);
  return data;
};

export const updatePrivacyPolicy = async ({
  descriptionEn,
  descriptionAr,
}) => {
  const { data } = await axiosInstance.post(BASE_URL, {
    descriptionEn,
    descriptionAr,
  });
  return data;
};

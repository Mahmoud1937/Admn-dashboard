import axiosInstance from "../../../shared/api/axiosInstance";

const BASE_URL = "/TermsAndConditionsAdmin";

export const getTermsAndConditions = async () => {
  const { data } = await axiosInstance.get(BASE_URL);

  return data;
};

export const updateTermsAndConditions = async ({
  descriptionEn,
  descriptionAr,
}) => {
  const { data } = await axiosInstance.post(BASE_URL, {
    descriptionEn,
    descriptionAr,
  });

  return data;
};
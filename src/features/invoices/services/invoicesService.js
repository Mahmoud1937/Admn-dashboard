import axiosInstance from "../../../shared/api/axiosInstance";

const BASE_URL = "/admin/invoices";
const TIMELINE_BASE_URL = "/ApprovalHistory/invoices";

export const getInvoices = async (params) => {
  const { data } = await axiosInstance.get(BASE_URL, { params });
  return data.data;
};

export const exportInvoices = async (params) => {
  const response = await axiosInstance.get(`${BASE_URL}/export`, {
    params,
    responseType: "blob",
  });
  return response.data;
};

export const getInvoiceTimeline = async ({ orderNo, signal }) => {
  const { data } = await axiosInstance.get(`${TIMELINE_BASE_URL}/${orderNo}/timeline`, {
    signal,
  });

  if (!data.succeeded) {
    throw new Error(data.message || "Failed to retrieve timeline");
  }

  return data.data;
};
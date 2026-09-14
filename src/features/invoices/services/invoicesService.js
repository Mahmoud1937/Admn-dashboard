import axiosInstance from "../../../shared/api/axiosInstance";

const BASE_URL = "/admin/invoices";

export const getInvoices = async (params) => {
  const { data } = await axiosInstance.get(BASE_URL, { params });
  return data.data; // { items, pageNumber, pageSize, totalCount, totalPages }
};
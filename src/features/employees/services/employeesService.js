
import axiosInstance from "../../../shared/api/axiosInstance";

export const getEmployees = async ({
  pageNumber = 1,
  pageSize = 20,
  searchTerm,
  employeeGroupId,
  signal,
} = {}) => {
  const { data } = await axiosInstance.get("/EmployeeAdmin", {
    params: {
      PageNumber: pageNumber,
      PageSize: pageSize,
      SearchTerm: searchTerm || undefined,
      EmployeeGroupId: employeeGroupId || undefined,
    },
    signal,
  });
  if (!data.succeeded) throw new Error(data.message);
  return data.data; // { items, pageNumber, pageSize, totalCount, totalPages }
};

export const getEmployeeById = async (employeeId) => {
  const { data } = await axiosInstance.get(`/EmployeeAdmin/${employeeId}`);

  if (data?.succeeded === false) {
    throw new Error(data?.message || "Failed to load employee.");
  }

  const employee = data?.data ?? data;
  if (!employee || typeof employee !== "object") {
    throw new Error("Employee data is unavailable.");
  }

  return employee;
};

export const toggleEmployeeActive = async (employeeId) => {
  const { data } = await axiosInstance.patch(
    `/EmployeeAdmin/${employeeId}/toggle-active`
  );

  if (!data?.succeeded) {
    throw new Error(data?.message || "Failed to update employee status.");
  }

  return data;
};

export const updateEmployee = async ({ employeeId, payload }) => {
  const { data } = await axiosInstance.put(`/EmployeeAdmin/${employeeId}`, {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    employeeGroupId: Number(payload.employeeGroupId),
  });

  if (!data?.succeeded) {
    throw new Error(data?.message || "Failed to update employee.");
  }

  return data;
};

export const registerEmployee = async (payload) => {
  const { data } = await axiosInstance.post("/AuthAdmin/register", {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phoneNumber: payload.phoneNumber,
    employeeMemberId: Number(payload.employeeMemberId),
  });

  if (!data?.success) {
    throw new Error(data?.message || "Failed to register employee.");
  }

  return data;
};
export const resetEmployeePassword = async ({ employeeId }) => {
  const { data } = await axiosInstance.patch(
    `AuthAdmin/employees/${employeeId}/reset-password`
  );
  return data;
};

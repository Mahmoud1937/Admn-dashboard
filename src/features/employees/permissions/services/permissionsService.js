import axiosInstance from "../../../../shared/api/axiosInstance";


// GET /api/PermissionAdmin
export const getPermissions = async () => {
  const { data } = await axiosInstance.get("PermissionAdmin");
  if (!data?.succeeded) {
    throw new Error(data?.message || "Failed to load permissions.");
  }
  return data?.data ?? [];
};
export const updateEmployeePermissions = async ({ employeeId, permissionIds }) => {
  const { data } = await axiosInstance.put(
    `PermissionAdmin/employees/${employeeId}`,
    { permissionIds }
  );
  if (!data?.succeeded) {
    throw new Error(data?.message || "Failed to update permissions.");
  }
  return data;
};

export const normalizePermissions = (permissions) => {
  if (!Array.isArray(permissions)) return [];

  return [
    ...new Set(
      permissions
        .map((permission) =>
          typeof permission === "string" ? permission : permission?.code
        )
        .filter((code) => typeof code === "string" && code.trim())
        .map((code) => code.trim())
    ),
  ];
};
export const resolvePermissionCodes = (permissionIds, permissionCatalog) => {
  if (!Array.isArray(permissionIds)) {
    throw new Error("Employee permissions are missing from the response.");
  }

  if (!Array.isArray(permissionCatalog)) {
    throw new Error("Permission catalog is unavailable.");
  }
  const codesById = new Map(
    permissionCatalog
      .filter(
        (permission) =>
          permission?.id != null &&
          typeof permission?.code === "string" &&
          permission.code.trim()
      )
      .map((permission) => [String(permission.id), permission.code.trim()])
  );

  const unresolvedIds = permissionIds.filter(
    (permissionId) => !codesById.has(String(permissionId))
  );

  if (unresolvedIds.length) {
    throw new Error("Some employee permissions could not be resolved.");
  }

  return normalizePermissions(
    permissionIds.map((permissionId) => codesById.get(String(permissionId)))
  );
};


export const clearPersistedPermissions = () => {
  localStorage.removeItem("permissions");
  localStorage.removeItem("permissionCodes");
};

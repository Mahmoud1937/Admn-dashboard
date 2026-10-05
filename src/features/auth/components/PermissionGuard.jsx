import usePermission from "../hooks/usePermission";

export default function PermissionGuard({
  permission,
  children,
  fallback = null,
}) {
  const isAllowed = usePermission(permission);
  return isAllowed ? children : fallback;
}

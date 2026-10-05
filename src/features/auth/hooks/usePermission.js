import { useAuth } from "../context/Authcontext";

export default function usePermission(permissionCode) {
  const { hasPermission } = useAuth();
  return hasPermission(permissionCode);
}

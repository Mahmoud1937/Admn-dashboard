import AccessDeniedPage from "../../../shared/components/AccessDeniedPage";
import usePermission from "../hooks/usePermission";

export default function PermissionRoute({ permission, children }) {
  const isAllowed = usePermission(permission);
  return isAllowed ? children : <AccessDeniedPage />;
}

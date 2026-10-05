import { Navigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import ChangePasswordModal from "../components/ChangePasswordModal";

export default function ForceChangePasswordPage() {
  const { isAuthenticated, mustChangePassword, isAuthInitializing } = useAuth();

  if (isAuthInitializing) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!mustChangePassword) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-slate-100">
      <ChangePasswordModal forced />
    </div>
  );
}

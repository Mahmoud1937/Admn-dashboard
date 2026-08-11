import Logo from "../assets/Logo.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

export default function SidebarHeader({ collapsed, setCollapsed }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 p-4">
      {!collapsed && (
        <div className="flex flex-1 justify-center p-3">
          <img
            src={Logo}
            alt="Medicard Logo"
            className="h-14 w-auto object-contain"
          />
        </div>
      )}

      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-all hover:bg-slate-50 hover:text-heading"
        title={collapsed ? "فتح القائمة" : "إغلاق القائمة"}
      >
        <FontAwesomeIcon icon={faBars} className="w-5" />
      </button>
    </div>
  );
}
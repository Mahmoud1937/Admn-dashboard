import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

export default function SidebarItem({ title, path, icon, collapsed }) {
  const { t } = useTranslation("sidebar");
  const label = t(path, { defaultValue: title });
  return (
    <NavLink
      to={path}
      end={path === "/"}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all
        ${collapsed ? "justify-center" : ""}
        ${
          isActive
            ? "bg-primary-600/10 text-primary-600"
            : "text-muted hover:bg-slate-50 hover:text-heading"
        }`
      }
    >
      <FontAwesomeIcon icon={icon} className="w-5 shrink-0" />

      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

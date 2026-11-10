import Logo from "../assets/Logo.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

export default function SidebarHeader({ collapsed, setCollapsed }) {
  const { t } = useTranslation("sidebar");
  const toggleLabel = t(collapsed ? "openMenu" : "closeMenu");
  return (
    <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
      {!collapsed && (
        <div className="flex flex-1 justify-center">
          <img
            src={Logo}
            alt={t("logoAlt")}
            className="h-9 w-auto object-contain"
          />
        </div>
      )} 

      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-all hover:bg-slate-50 hover:text-heading"
        title={toggleLabel}
        aria-label={toggleLabel}
      >
        <FontAwesomeIcon icon={faBars} className="w-5" />
      </button>
    </div>
  );
}

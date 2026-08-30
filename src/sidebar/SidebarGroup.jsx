import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

export default function SidebarGroup({ title, path, icon, children, collapsed }) {
  const location = useLocation();
  const isChildActive = children.some((child) =>
    location.pathname.startsWith(child.path)
  );
  const [open, setOpen] = useState(isChildActive);

  useEffect(() => {
    if (isChildActive) setOpen(true);
  }, [isChildActive]);

  // In collapsed mode (icons only), clicking the parent icon reveals the
  // children as icon-only rows stacked underneath it - sidebar width
  // itself never changes
  if (collapsed) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          title={title}
          className={`flex w-full cursor-pointer items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition-all
          ${
            isChildActive
              ? "bg-primary-600/10 text-primary-600"
              : "text-muted hover:bg-slate-50 hover:text-heading"
          }`}
        >
          <FontAwesomeIcon icon={icon} className="w-5 shrink-0" />
        </button>

        {open && (
          <div className="mt-1 space-y-1">
            {children.map((child) => (
              <NavLink
                key={child.path}
                to={child.path}
                title={child.title}
                className={({ isActive }) =>
                  `flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition-all
                  ${
                    isActive
                      ? "bg-primary-600/10 text-primary-600"
                      : "text-muted hover:bg-slate-50 hover:text-heading"
                  }`
                }
              >
                <FontAwesomeIcon icon={child.icon} className="w-4 shrink-0" />
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        className={`flex items-center rounded-xl text-sm font-medium transition-all
        ${
          isChildActive
            ? "bg-primary-600/10 text-primary-600"
            : "text-muted hover:bg-slate-50 hover:text-heading"
        }`}
      >
        <NavLink
          to={path}
          end
          onClick={() => setOpen((prev) => !prev)}
          className="flex flex-1 cursor-pointer items-center gap-3 px-4 py-3"
        >
          <FontAwesomeIcon icon={icon} className="w-5 shrink-0" />
          <span>{title}</span>
        </NavLink>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="cursor-pointer px-3 py-3"
          title={open ? "Collapse" : "Expand"}
        >
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`w-3 shrink-0 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {open && (
        <div className="mt-1 ms-4 space-y-1 border-s border-slate-200 ps-3">
          {children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all
                ${
                  isActive
                    ? "bg-primary-600/10 text-primary-600"
                    : "text-muted hover:bg-slate-50 hover:text-heading"
                }`
              }
            >
              <FontAwesomeIcon icon={child.icon} className="w-4 shrink-0" />
              <span>{child.title}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
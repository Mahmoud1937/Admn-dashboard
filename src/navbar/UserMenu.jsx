import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faGear,
  faRightFromBracket,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!menuRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-slate-100"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
          A
        </div>

        <div className="hidden text-left md:block">
          <p className="text-sm font-semibold text-slate-900">
            Admin User
          </p>

          <span className="text-xs text-slate-500">
            Super Admin
          </span>
        </div>

        <FontAwesomeIcon
          icon={faChevronDown}
          className={`text-xs text-slate-400 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <button className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50">
            <FontAwesomeIcon icon={faUser} />
            Profile
          </button>

          <button className="flex w-full items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50">
            <FontAwesomeIcon icon={faGear} />
            Settings
          </button>

          <div className="border-t" />

          <button className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50">
            <FontAwesomeIcon icon={faRightFromBracket} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
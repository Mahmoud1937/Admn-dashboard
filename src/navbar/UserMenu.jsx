import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../features/auth/context/Authcontext";
import { splitEmployeeName } from "../shared/utils/jwt";

const getDisplayValue = (value, fallback) =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { englishName, arabicName } = splitEmployeeName(user?.employeeName);
  const employeeNameEn = getDisplayValue(englishName, "Admin");
  const employeeNameAr = getDisplayValue(arabicName, "");
  const accountType = getDisplayValue(
    user?.accountType,
    "Account type unavailable"
  );
  const employeeGroupName = getDisplayValue(
    user?.employeeGroupName,
    "Group unavailable"
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    queryClient.cancelQueries();
    queryClient.clear();
    logout();
    setOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1 transition hover:bg-slate-100"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900 font-semibold text-white">
          {employeeNameEn.charAt(0).toUpperCase()}
        </div>

        <div className="hidden w-[220px] flex-col items-start leading-tight md:flex">
          <p className="w-full truncate text-left text-sm font-semibold text-slate-900">
            {employeeNameEn}
          </p>
          {employeeNameAr && (
            <p
              className="mt-0.5 w-full truncate text-left text-[11px] text-slate-500"
              dir="rtl"
              style={{ unicodeBidi: "isolate" }}
              title={employeeNameAr}
            >
              {employeeNameAr}
            </p>
          )}
          <span className="mt-0.5 w-full truncate text-left text-[10px] text-slate-400">
            {accountType} <span className="px-1 text-slate-300">&bull;</span>{" "}
            {employeeGroupName}
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
          <div className="flex flex-col items-start border-b border-slate-100 px-4 py-3">
            <p className="w-full truncate text-left text-sm font-semibold text-slate-900">
              {employeeNameEn}
            </p>
            {employeeNameAr && (
              <p
                className="mt-0.5 w-full truncate text-left text-xs text-slate-500"
                dir="rtl"
                style={{ unicodeBidi: "isolate" }}
                title={employeeNameAr}
              >
                {employeeNameAr}
              </p>
            )}
            <p className="mt-1 w-full truncate text-left text-xs text-slate-500">
              {accountType}
            </p>
            <p className="mt-0.5 w-full truncate text-left text-xs text-slate-400">
              {employeeGroupName}
            </p>
          </div>

          <div className="border-t" />

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

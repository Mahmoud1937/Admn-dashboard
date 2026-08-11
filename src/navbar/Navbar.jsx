import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faBell } from "@fortawesome/free-solid-svg-icons";
import UserMenu from "./UserMenu";

export default function Navbar({ onOpenSidebar }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
      <button
        onClick={onOpenSidebar}
        className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 lg:hidden"
      >
        <FontAwesomeIcon icon={faBars} />
      </button>

      <div className="hidden lg:block" />

      <div className="ml-auto flex items-center gap-5">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100">
          <FontAwesomeIcon icon={faBell} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <UserMenu />
      </div>
    </header>
  );
}
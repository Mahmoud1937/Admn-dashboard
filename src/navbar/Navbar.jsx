import UserMenu from "./UserMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import useLanguage from "../localization/useLanguage";

export default function Navbar() {
  const { language, direction } = useLanguage();
  return (
    <header lang={language} dir={direction} className="sticky top-0 z-30 flex h-16 items-center justify-end border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-5">
        <LanguageSwitcher />
        <UserMenu />
      </div>
    </header>
  );
}

import useLanguage from "./useLanguage";

export default function LocalizedPage({ children, className = "" }) {
  const { language, direction } = useLanguage();
  return <div className={className} lang={language} dir={direction}>{children}</div>;
}

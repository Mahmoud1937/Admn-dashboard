import { useTranslation } from "react-i18next";

export default function ProviderAttachmentFileInput({
  className,
  dimDisabled = true,
  ...props
}) {
  const { t } = useTranslation("common");
  const inputClassName = className ?? "block w-full rounded-lg border border-slate-200 bg-white text-sm text-slate-600 file:mr-3 file:cursor-pointer file:border-0 file:bg-blue-50 file:px-3 file:py-2.5 file:font-medium file:text-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
    + (dimDisabled ? " disabled:opacity-50" : "");
  return (
    <label className={`${inputClassName} relative cursor-pointer rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-300`}>
      <span>{t("Choose file")}</span>
      <input type="file" className="sr-only" {...props} />
    </label>
  );
}

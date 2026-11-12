import { useTranslation } from "react-i18next";
import useContentLanguage from "../../../localization/useContentLanguage";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faChevronDown, faPenToSquare, faPowerOff, faSpinner } from "@fortawesome/free-solid-svg-icons";
import TableEmptyState from "../../../shared/components/TableEmptyState";
import LazyImageCell from "../../../shared/components/LazyImageCell";
import ImageLightbox from "../../../shared/components/ImageLightbox";
import EventBadge from "../../../shared/components/StatusBadge";
import { resolveNotificationEvent } from "../constants/notificationEvents";

const MESSAGE_LANGUAGES = [
  { key: "messageEn", label: "EN", fullLabel: "English", lang: "en", dir: "ltr" },
  { key: "messageAr", label: "AR", fullLabel: "Arabic", lang: "ar", dir: "rtl" },
];

function StatusBadge({ isDeleted }) {
  const { t } = useTranslation("adminPages");
  if (typeof isDeleted !== "boolean") return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
        isDeleted ? "bg-slate-50 text-slate-500 ring-slate-500/15" : "bg-emerald-50 text-emerald-700 ring-emerald-600/15"
      }`}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${isDeleted ? "bg-slate-400" : "bg-emerald-500"}`} />
      {isDeleted ? t("Inactive") : t("Active")}
    </span>
  );
}

function LanguageToggle({ value, onChange }) {
  const { t } = useTranslation("adminPages");
  return (
    <div role="group" aria-label={t("Preview language")} className="inline-flex rounded-lg bg-slate-200/60 p-0.5">
      {MESSAGE_LANGUAGES.map(({ key, label, fullLabel }) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            aria-pressed={active}
            title={t(fullLabel)}
            onClick={() => onChange(key)}
            className={`rounded-md px-2.5 py-0.5 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${
              active ? "bg-white text-blue-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function TemplateCard({
  template,
  canEdit,
  onEdit,
  editDisabled,
  canToggle,
  onToggleActive,
  toggleDisabled,
  isToggling,
  togglingId,
  onPreviewImage,
}) {
  const { t } = useTranslation("adminPages");
  const [contentLanguage, setContentLanguage] = useContentLanguage();
  const langKey = contentLanguage === "ar" ? "messageAr" : "messageEn";
  const setLangKey = (key) => setContentLanguage(key === "messageAr" ? "ar" : "en");
  const [expanded, setExpanded] = useState(false);

  const language = MESSAGE_LANGUAGES.find((l) => l.key === langKey);
  const message = template[langKey];
  const title = template.title || t("Untitled template");
  const inactive = template.isDeleted === true;
  const event = resolveNotificationEvent(template.notificationEvent);
  const eventLabel = event?.label ? t(event.label) : template.notificationEvent ?? "—";
  const toggleLabel = inactive ? t("Activate template") : template.isDeleted === false ? t("Deactivate template") : t("Toggle template status");
  const isTogglingThis = isToggling && togglingId === template.id;
  const detailsId = `template-message-${template.id}`;
  const isLong = (message || "").length > 110;

  return (
    <article
      className={`flex h-full w-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md ${
        inactive ? "opacity-75" : ""
      }`}
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-3 px-5 pt-4">
        <EventBadge
          tone={event?.tone}
          className="min-w-0 max-w-[65%] gap-1.5"
        >
          {event?.icon && <FontAwesomeIcon icon={event.icon} className="shrink-0" aria-hidden="true" />}
          <span title={eventLabel} className="truncate">{eventLabel}</span>
        </EventBadge>
        <StatusBadge isDeleted={template.isDeleted} />
      </header>

      {/* Notification preview */}
      <div className="flex-1 px-5 pb-4 pt-4">
        <div className="rounded-xl bg-slate-100/80 p-3 ring-1 ring-inset ring-slate-200/70">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{t("Preview")}</span>
            <LanguageToggle value={langKey} onChange={setLangKey} />
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200/60">
            <div className="shrink-0">
              {template.imageUrl ? (
                <LazyImageCell
                  url={template.imageUrl}
                  label={template.title || t("Notification template")}
                  size="h-11 w-11"
                  onPreview={onPreviewImage}
                />
              ) : (
                <span
                  aria-label={t("No image")}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-900 text-white"
                >
                  <FontAwesomeIcon icon={faBell} aria-hidden="true" />
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{t("Notification")}</span>
                <span className="text-[10px] text-slate-400">{t("now")}</span>
              </div>
              <p dir="auto" title={title} className="mt-0.5 line-clamp-1 break-words text-sm font-semibold text-slate-900">
                {title}
              </p>
              <p
                id={detailsId}
                dir={language.dir}
                lang={language.lang}
                className={`mt-0.5 break-words text-[13px] leading-5 text-slate-600 ${
                  expanded ? "whitespace-pre-wrap" : "line-clamp-3 min-h-[3.75rem]"
                } ${language.dir === "rtl" ? "text-right" : "text-left"}`}
              >
                {message || "—"}
              </p>
            </div>
          </div>

          {isLong && (
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={detailsId}
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-800 hover:text-blue-950 focus-visible:outline-2 focus-visible:outline-blue-600"
            >
              {expanded ? t("Show less") : t("Show full message")}
              <FontAwesomeIcon icon={faChevronDown} className={`text-[10px] transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-3">
        <span className="text-xs tabular-nums text-slate-400">{t("Template #")}{template.id}</span>
        <div className="flex items-center gap-0.5">
          {canEdit && (
            <button
              type="button"
              aria-label={t("Edit template {{name}}", { name: template.title || template.id })}
              title={t("Edit template")}
              disabled={editDisabled}
              onClick={() => onEdit(template)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
            </button>
          )}
          {canToggle && (
            <button
              type="button"
              aria-label={`${toggleLabel}: ${template.title || template.id}`}
              title={toggleLabel}
              aria-busy={isTogglingThis}
              disabled={toggleDisabled || isToggling}
              onClick={() => onToggleActive(template)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50 ${
                inactive
                  ? "text-slate-400 hover:bg-emerald-50 hover:text-emerald-700"
                  : "text-blue-700 hover:bg-amber-50 hover:text-amber-700"
              }`}
            >
              <FontAwesomeIcon icon={isTogglingThis ? faSpinner : faPowerOff} spin={isTogglingThis} className="text-xs" />
            </button>
          )}
        </div>
      </footer>
    </article>
  );
}

export default function NotificationTemplatesTable({
  templates,
  canEdit = false,
  onEdit,
  editDisabled = false,
  canToggle = false,
  onToggleActive,
  toggleDisabled = false,
  isToggling = false,
  togglingId,
}) {
  const { t } = useTranslation("adminPages");
  const [previewImage, setPreviewImage] = useState(null);

  if (templates.length === 0) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <TableEmptyState
          icon={faBell}
          title={t("No notification templates found")}
          emptyMessage={t("There are no notification templates to display.")}
        />
      </div>
    );
  }

  return (
    <>
      <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3" aria-label={t("Notification templates")}>
        {templates.map((template) => (
          <li key={template.id} className="flex">
            <TemplateCard
              template={template}
              canEdit={canEdit}
              onEdit={onEdit}
              editDisabled={editDisabled}
              canToggle={canToggle}
              onToggleActive={onToggleActive}
              toggleDisabled={toggleDisabled}
              isToggling={isToggling}
              togglingId={togglingId}
              onPreviewImage={(url, label) => setPreviewImage({ url, label })}
            />
          </li>
        ))}
      </ul>
      <ImageLightbox image={previewImage} onClose={() => setPreviewImage(null)} />
    </>
  );
}
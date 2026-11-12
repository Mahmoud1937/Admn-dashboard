import i18n from "./i18n";

// Schemas and API helpers use message keys without a React translation hook.
// Resolve known messages at display time so existing errors follow language changes.
// Unknown backend content remains intact.
export default function localizeMessage(message) {
  if (typeof message !== "string" || !message) return message;
  const namespaces = ["common", "adminPages", ...i18n.options.ns];
  const namespace = namespaces.find((ns) =>
    i18n.exists(message, { ns, keySeparator: false, fallbackLng: false })
  );
  return namespace
    ? i18n.t(message, { ns: namespace, keySeparator: false })
    : message;
}

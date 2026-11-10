export default function localizeFormError(error, t) {
  if (!error?.message) return undefined;
  return error.type === "server" ? error.message : t(error.message);
}

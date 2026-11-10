export default function localizeAttachmentError(message, tr) {
  if (!message) return message;
  const namedMessages = [
    [/^"(.+)" is empty\. Choose a non-empty file\.$/, '"{{name}}" is empty. Choose a non-empty file.'],
    [/^"(.+)" exceeds the 5 MB limit per file\.$/, '"{{name}}" exceeds the 5 MB limit per file.'],
    [/^"(.+)" must be an image, PDF, or Excel \(\.xls, \.xlsx\) file\.$/, '"{{name}}" must be an image, PDF, or Excel (.xls, .xlsx) file.'],
  ];
  for (const [pattern, key] of namedMessages) {
    const match = message.match(pattern);
    if (match) return tr(key, { name: match[1] });
  }
  return tr(message);
}

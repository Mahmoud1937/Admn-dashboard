export function sanitizeNameInput(value) {
  return value
    .replace(/^\s+/, "")    
    .replace(/\s{2,}/g, " ");  
}
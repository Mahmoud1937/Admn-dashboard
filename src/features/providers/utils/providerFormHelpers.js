import { sanitizeNameInput as sharedSanitizeNameInput } from "../../../shared/utils/sanitizeInput";

export function sanitizeNameInput(value) {
  return sharedSanitizeNameInput(value).slice(0, 100);
}

export function buildProviderFormValues(provider) {
  return {
    arName: sanitizeNameInput(provider.arName ?? ""),
    enName: sanitizeNameInput(provider.enName ?? ""),
    hotLine: (provider.hotLine ?? "").replace(/\D/g, ""),
    phoneNumber: (provider.phoneNumber ?? "").replace(/\D/g, ""),
    landline: (provider.landline ?? "").replace(/\D/g, ""),
    providerCategoryId: provider.providerCategoryId ?? "",
    specialistId: provider.specialistId ?? "",
    isActive: provider.isActive,
    joinDate: provider.createdAt ? provider.createdAt.slice(0, 10) : "",
  };
}

export const emptyProviderForm = {
  arName: "",
  enName: "",
  hotLine: "",
  phoneNumber: "",
  landline: "",
  providerCategoryId: "",
  specialistId: "",
  joinDate: "",
  isActive: true,
};
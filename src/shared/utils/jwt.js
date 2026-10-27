import { jwtDecode } from "jwt-decode";

// npm install jwt-decode

/**
 * Safely decodes a JWT. Returns null instead of throwing on a malformed token.
 */
export const decodeToken = (token) => {
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

/** Returns the JWT exp claim in milliseconds, or null for invalid claims. */
export const getTokenExpiryTime = (token) => {
  const exp = decodeToken(token)?.exp;
  return typeof exp === "number" && exp > 0 && Number.isFinite(exp * 1000)
    ? exp * 1000
    : null;
};

/**
 * Invalid claims are rejected. Expiration is checked only against known server
 * time; an unknown clock defers validity to the backend instead of Date.now().
 */
export const isTokenExpired = (token, serverNow = null) => {
  const expiresAt = getTokenExpiryTime(token);
  return expiresAt === null || (serverNow !== null && expiresAt <= serverNow);
};

const ARABIC_TEXT_PATTERN = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;

export const splitEmployeeName = (employeeName) => {
  const fullName = typeof employeeName === "string" ? employeeName.trim() : "";

  if (!fullName) {
    return { englishName: "", arabicName: "" };
  }

  const words = fullName.split(/\s+/);
  const arabicName = words.filter((word) => ARABIC_TEXT_PATTERN.test(word)).join(" ");
  const englishName = words
    .filter((word) => !ARABIC_TEXT_PATTERN.test(word))
    .join(" ");

  return {
    englishName: englishName || (arabicName ? "" : fullName),
    arabicName: arabicName || (englishName ? "" : fullName),
  };
};

/**
 * Maps the AuthAdmin JWT payload (sub, jti, employeeName, employeeGroupId,
 * email, employeeId, accountType, exp, ...) to a plain user object.
 */
export const getUserFromToken = (token) => {
  const payload = decodeToken(token);
  if (!payload) return null;

  return {
    id: payload.sub,
    employeeId: payload.employeeId,
    employeeName: payload.employeeName,
    employeeGroupId: payload.employeeGroupId,
    employeeGroupName: payload.employeeGroupName,
    email: payload.email,
    accountType: payload.accountType,
    exp: payload.exp,
  };
};

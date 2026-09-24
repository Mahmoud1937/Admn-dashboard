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

/**
 * true if the token is missing, malformed, or past its `exp` claim.
 */
export const isTokenExpired = (token) => {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now();
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

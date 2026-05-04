export const PHONE_VALIDATION_MESSAGE = "Phone number must be exactly 10 digits.";
export const PASSWORD_VALIDATION_MESSAGE =
  "Password must be at least 6 characters and include at least 1 number and 1 special character.";

const PHONE_REGEX = /^\d{10}$/;
const STRONG_PASSWORD_REGEX = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

export function isValidPhone(phone) {
  return PHONE_REGEX.test(String(phone || "").trim());
}

export function isStrongPassword(password) {
  return STRONG_PASSWORD_REGEX.test(String(password || ""));
}

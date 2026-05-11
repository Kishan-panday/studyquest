/**
 * Email validation using RFC 5322 simplified regex
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Password strength validation
 * Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number
 */
export function validatePassword(password) {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  return { valid: true, message: "" };
}

/**
 * Name validation
 */
export function validateName(name) {
  if (!name || name.trim().length < 2) {
    return { valid: false, message: "Name must be at least 2 characters long" };
  }
  return { valid: true, message: "" };
}

/**
 * College name validation
 */
export function validateCollege(college) {
  if (!college || college.trim().length < 2) {
    return { valid: false, message: "College name must be at least 2 characters long" };
  }
  return { valid: true, message: "" };
}

/**
 * Sanitize user input to prevent basic XSS
 */
export function sanitizeInput(input) {
  if (typeof input !== "string") return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

// ============================================================================
// GrowEasy CRM - Utility Helpers
// ============================================================================

/**
 * Sanitize a string by trimming whitespace and removing control characters
 * (except newlines and tabs which may appear in notes/descriptions).
 */
export function sanitizeString(str: string): string {
  if (!str || typeof str !== 'string') return '';
  // Remove control chars (U+0000–U+001F) except \t (0x09), \n (0x0A), \r (0x0D)
  // Then trim leading/trailing whitespace
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

/**
 * Basic email validation using a pragmatic regex.
 * Checks for a standard user@domain.tld pattern.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Basic phone number validation.
 * Strips non-digit characters first, then checks length (7–15 digits).
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

/**
 * Format a byte count into a human-readable file size string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${size} ${units[i]}`;
}

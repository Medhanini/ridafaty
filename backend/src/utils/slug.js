'use strict'

/**
 * Generate an SEO-friendly slug from any string (supports fr, en, ar).
 *
 * Strategy:
 *  1. Normalise to NFC (keeps Arabic/accented chars intact)
 *  2. Map common accented Latin chars to ASCII equivalents
 *  3. Transliterate Arabic chars to their Latin counterparts (basic)
 *  4. Lowercase, replace non-alphanumeric sequences with hyphens
 *  5. Trim leading/trailing hyphens
 *
 * @param {string} text
 * @returns {string}
 */
function generateSlug(text) {
  if (!text) return ''

  let s = text.normalize('NFC')

  // ── Accented Latin → ASCII ─────────────────────────────────────────────────
  const latinMap = {
    à: 'a', á: 'a', â: 'a', ã: 'a', ä: 'a', å: 'a', æ: 'ae',
    ç: 'c',
    è: 'e', é: 'e', ê: 'e', ë: 'e',
    ì: 'i', í: 'i', î: 'i', ï: 'i',
    ñ: 'n',
    ò: 'o', ó: 'o', ô: 'o', õ: 'o', ö: 'o', ø: 'o',
    ù: 'u', ú: 'u', û: 'u', ü: 'u',
    ý: 'y', ÿ: 'y',
    ß: 'ss',
  }

  // ── Basic Arabic transliteration ───────────────────────────────────────────
  const arabicMap = {
    'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'a', 'ء': '',
    'ب': 'b', 'ت': 't', 'ث': 'th',
    'ج': 'j', 'ح': 'h', 'خ': 'kh',
    'د': 'd', 'ذ': 'th',
    'ر': 'r', 'ز': 'z',
    'س': 's', 'ش': 'sh',
    'ص': 's', 'ض': 'd',
    'ط': 't', 'ظ': 'z',
    'ع': '', 'غ': 'gh',
    'ف': 'f', 'ق': 'q', 'ك': 'k',
    'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
    'ة': 'a', 'ئ': 'y', 'ؤ': 'w',
    'لا': 'la',
    // Diacritics (tashkeel) – remove
    '\u064B': '', '\u064C': '', '\u064D': '',
    '\u064E': '', '\u064F': '', '\u0650': '',
    '\u0651': '', '\u0652': '',
  }

  // Apply Latin map
  s = s.replace(/[^\u0000-\u007E]/g, (ch) => latinMap[ch] || ch)

  // Apply Arabic map (multi-char first, then single)
  for (const [ar, lat] of Object.entries(arabicMap)) {
    s = s.split(ar).join(lat)
  }

  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove remaining non-alphanumeric
    .trim()
    .replace(/[\s_]+/g, '-')       // spaces/underscores → hyphens
    .replace(/-+/g, '-')           // collapse multiple hyphens
    .replace(/^-+|-+$/g, '')       // trim leading/trailing hyphens
}

/**
 * Make a slug unique by appending a numeric suffix.
 * Calls the provided `existsFn(candidate)` which should resolve to true if
 * the candidate slug is already taken.
 *
 * @param {string} base         - the base slug (already generated)
 * @param {function} existsFn   - async (slug: string) => boolean
 * @returns {Promise<string>}
 */
async function uniqueSlug(base, existsFn) {
  let candidate = base
  let counter = 1

  while (await existsFn(candidate)) {
    candidate = `${base}-${counter}`
    counter++
  }

  return candidate
}

module.exports = { generateSlug, uniqueSlug }

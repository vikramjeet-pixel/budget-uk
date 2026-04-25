/**
 * Spam detection for user-submitted content.
 * Returns an array of reasons if the text looks spammy (empty = clean).
 */

// ─── Patterns ────────────────────────────────────────────────────────────────

/** URLs (http, https, www) */
const URL_PATTERN = /https?:\/\/|www\./i;

/** Repeated characters (same char 5+ times in a row, e.g. "aaaaaa") */
const REPEATED_CHARS = /(.)\1{4,}/;

/** All caps words (3+ consecutive uppercase words) */
const ALL_CAPS_WORDS = /\b[A-Z]{3,}\b.*\b[A-Z]{3,}\b.*\b[A-Z]{3,}\b/;

/** Common spam keywords and phrases */
const SPAM_KEYWORDS = [
  // Commercial spam
  "buy now",
  "order now",
  "limited offer",
  "act now",
  "click here",
  "visit our website",
  "free trial",
  "make money",
  "earn money",
  "work from home",
  "no obligation",
  "risk free",
  "double your",
  "guaranteed",
  "winner",
  "congratulations",
  // Pharmaceutical spam
  "viagra",
  "cialis",
  "pharmacy",
  "diet pills",
  "weight loss",
  // SEO spam
  "backlink",
  "seo service",
  "rank higher",
  "google ranking",
  // Crypto/financial spam
  "crypto invest",
  "bitcoin profit",
  "forex signal",
  "binary option",
  // Adult spam
  "18+",
  "xxx",
  "adult content",
  // Misc
  "telegram",
  "whatsapp group",
  "join now",
  "dm me",
  "follow me",
];

const SPAM_KEYWORD_PATTERN = new RegExp(
  SPAM_KEYWORDS.map((kw) => kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
  "i"
);

/** Excessive emoji (10+ in one string) */
const EXCESSIVE_EMOJI =
  /(?:[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2702}-\u{27B0}\u{24C2}-\u{1F251}].*){10,}/u;

// ─── Public API ──────────────────────────────────────────────────────────────

export interface SpamCheckResult {
  isSpam: boolean;
  reasons: string[];
}

/**
 * Check a submission's text fields for spam patterns.
 * Returns reasons if spam is detected; empty reasons = clean.
 */
export function checkSpam(fields: {
  name: string;
  description: string;
  tips?: string[];
}): SpamCheckResult {
  const reasons: string[] = [];
  const allText = [fields.name, fields.description, ...(fields.tips || [])].join(
    " "
  );

  if (URL_PATTERN.test(allText)) {
    reasons.push("Contains URLs");
  }

  if (REPEATED_CHARS.test(allText)) {
    reasons.push("Contains excessive repeated characters");
  }

  if (ALL_CAPS_WORDS.test(allText)) {
    reasons.push("Contains excessive capitalization");
  }

  const keywordMatch = allText.match(SPAM_KEYWORD_PATTERN);
  if (keywordMatch) {
    reasons.push(`Contains spam keyword: "${keywordMatch[0]}"`);
  }

  if (EXCESSIVE_EMOJI.test(allText)) {
    reasons.push("Contains excessive emoji");
  }

  // Very short description (likely low-effort or test submission)
  if (fields.description.trim().length < 20) {
    reasons.push("Description too short (< 20 characters)");
  }

  return {
    isSpam: reasons.length > 0,
    reasons,
  };
}

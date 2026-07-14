/**
 * ::neup.documentation::display-image-module
 * ::title Display Image Resolution Helpers
 *
 * Centralizes platform fallback display-image selection and profile-image normalization.
 *
 * ::public
 *
 * Use this module to resolve a final display image URL from account type, gender, login state, and any stored custom display image.
 *
 * ::public end
 *
 * ::private
 *
 * The fallback map is shared across APIs and interfaces so avatar behavior stays identical everywhere in the account app.
 *
 * ::private end
 *
 * ::end
 */
const DISPLAY_IMAGE_FALLBACK = {
  male: 'https://cdn.neupgroup.com/neupaccount/assets/displayImage/_plain_male.svg',
  female: 'https://cdn.neupgroup.com/neupaccount/assets/displayImage/_plain_female.svg',
  custom: 'https://cdn.neupgroup.com/neupaccount/assets/displayImage/_plain_custom.svg',
  guest: 'https://cdn.neupgroup.com/neupaccount/assets/displayImage/_plain_guest.svg',
} as const;

type DisplayImageInput = {
  displayImage?: string | null;
  accountType?: string | null;
  gender?: string | null;
  isLoggedIn?: boolean;
};

function normalizeGender(value?: string | null): 'male' | 'female' | 'custom' {
  const gender = (value ?? '').trim().toLowerCase();
  if (gender === 'male') return 'male';
  if (gender === 'female') return 'female';
  return 'custom';
}

/**
 * ::neup.documentation::display-image-get-fallback
 * ::function getFallbackDisplayImage(accountType, gender, isLoggedIn)
 *
 * Returns the platform fallback display image for the supplied account shape.
 *
 * ::public
 *
 * Guests always resolve to the guest fallback, brands and other custom account types resolve to the custom fallback, and individual/dependent accounts can resolve to male or female fallbacks when gender is known.
 *
 * ::public end
 *
 * ::private
 *
 * Unknown, unset, or non-binary gender values intentionally fall back to the custom display image.
 *
 * ::private end
 *
 * ::end
 */
export function getFallbackDisplayImage(input: Omit<DisplayImageInput, 'displayImage'>): string {
  const accountType = (input.accountType ?? '').trim().toLowerCase();
  if (input.isLoggedIn === false || accountType === 'guest') {
    return DISPLAY_IMAGE_FALLBACK.guest;
  }

  if (accountType === 'brand' || accountType === 'subbrand') {
    return DISPLAY_IMAGE_FALLBACK.custom;
  }

  const gender = normalizeGender(input.gender);
  if (gender === 'male') return DISPLAY_IMAGE_FALLBACK.male;
  if (gender === 'female') return DISPLAY_IMAGE_FALLBACK.female;
  return DISPLAY_IMAGE_FALLBACK.custom;
}

/**
 * ::neup.documentation::display-image-resolve
 * ::function resolveDisplayImage(input)
 *
 * Returns the stored display image when present or the platform fallback when it is missing.
 *
 * ::public
 *
 * This helper is the default entry point for APIs and interfaces that need a final avatar URL.
 *
 * ::public end
 *
 * ::private
 *
 * It delegates fallback selection to `getFallbackDisplayImage` so every caller stays aligned on the same platform defaults.
 *
 * ::private end
 *
 * ::end
 */
export function resolveDisplayImage(input: DisplayImageInput): string {
  const image = input.displayImage?.trim();
  if (image) return image;

  return getFallbackDisplayImage(input);
}

/**
 * ::neup.documentation::display-image-extract-gender
 * ::function extractGenderFromDetails(input)
 *
 * Extracts a normalized gender source value from account or individual detail payloads.
 *
 * ::public
 *
 * Account-level gender takes precedence, then the helper falls back to the individual profile details object.
 *
 * ::public end
 *
 * ::private
 *
 * The raw string is returned as stored so upstream callers can decide how aggressively to normalize or reinterpret it.
 *
 * ::private end
 *
 * ::end
 */
export function extractGenderFromDetails(input: {
  accountDetails?: unknown;
  individualDetails?: unknown;
}): string | null {
  const accountDetails =
    input.accountDetails && typeof input.accountDetails === 'object'
      ? (input.accountDetails as Record<string, unknown>)
      : {};
  const individualDetails =
    input.individualDetails && typeof input.individualDetails === 'object'
      ? (input.individualDetails as Record<string, unknown>)
      : {};

  const fromAccount = accountDetails.gender;
  if (typeof fromAccount === 'string' && fromAccount.trim()) return fromAccount.trim();

  const fromIndividual = individualDetails.gender;
  if (typeof fromIndividual === 'string' && fromIndividual.trim()) return fromIndividual.trim();

  return null;
}

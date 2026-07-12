import type { SearchCountry } from '@/constants';

/** Loose adapter around i18next `t` for dynamic keys (country names, error codes). */
function asTranslate(
  t: unknown,
): (key: string, options?: Record<string, unknown>) => string {
  return t as (key: string, options?: Record<string, unknown>) => string;
}

const ROLE_KEYS: Record<string, string> = {
  'Main Role': 'common:mainRole',
  'Support Role': 'common:supportRole',
};

export function translateCountry(
  t: unknown,
  country: SearchCountry | string,
): string {
  return asTranslate(t)(`filters:countries.${country}`, {
    defaultValue: country,
  });
}

export function translateRole(t: unknown, role: string): string {
  const key = ROLE_KEYS[role];
  return key ? asTranslate(t)(key) : role;
}

export function translateErrorMessage(
  t: unknown,
  errorKeyOrMessage: string,
): string {
  if (errorKeyOrMessage.includes(' ')) {
    return errorKeyOrMessage;
  }
  return asTranslate(t)(`errors:${errorKeyOrMessage}`, {
    defaultValue: errorKeyOrMessage,
  });
}

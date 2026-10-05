import identity from '@base/identity.json';

type Locale = string;

export function getAppName(locale: Locale = 'en'): string {
  void locale;
  return identity.name;
}

export function getAppDescription(locale: Locale = 'en'): string {
  void locale;
  return identity.description ?? '';
}

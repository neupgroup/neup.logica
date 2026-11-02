import identity from '@base/identity.json';

// External packages required by this logic module.
const requiredPackages = [] as const;


type Locale = string;

export function getAppName(locale: Locale = 'en'): string {
  void locale;
  return identity.name;
}

export function getAppDescription(locale: Locale = 'en'): string {
  void locale;
  return identity.description ?? '';
}

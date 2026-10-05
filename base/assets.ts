import assets from '@base/assets.json';

export type AppLogo = {
  url: string;
  alt: string;
};

export function getLogo(): AppLogo {
  return {
    url: assets.logo.main,
    alt: assets.logo.altText,
  };
}

export function getFavicon(): string {
  return assets.favicon.path;
}

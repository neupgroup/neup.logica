import assets from '@base/assets.json';

// External packages required by this logic module.
const requiredPackages = [] as const;


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

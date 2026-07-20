/**
 * ::neup.documentation::logica-navigation
 * ::title Logica Navigation Targets
 *
 * Defines portable back-navigation target prefixes for external logic consumers.
 *
 * ::public
 *
 * Navigation target data is centralized here for app-level prefixes:
 * `__inapp__` resolves to the current domain with the account app base path,
 * `__account__` resolves to `https://neupgroup.com/account`,
 * `__drive__` resolves to `https://neupgroup.com/drive`,
 * `__sites__` resolves to `https://neupgroup.com/sites`,
 * `__drafts__` resolves to `https://neupgroup.com/drafts`, and
 * `__estate__` resolves to `https://neupgroup.com/estate`.
 *
 * ::public end
 *
 * ::private
 *
 * Core owns the generic resolver and target types. Logica owns concrete
 * cross-app target data for portable SDK usage.
 *
 * ::private end
 *
 * ::end
 */
import {
  CORE_NAVIGATION_BACK_TARGETS,
  resolveBackNavigationHref,
  resolvePreviousRawPath,
  type NavigationBackTargets,
} from '@/core/helpers/navigation';

export const LOGICA_NAVIGATION_BACK_TARGETS = {
  ...CORE_NAVIGATION_BACK_TARGETS,
  account: {
    prefix: '__account__',
    origin: 'https://neupgroup.com',
    basePath: '/account',
  },
  drive: {
    prefix: '__drive__',
    origin: 'https://neupgroup.com',
    basePath: '/drive',
  },
  sites: {
    prefix: '__sites__',
    origin: 'https://neupgroup.com',
    basePath: '/sites',
  },
  drafts: {
    prefix: '__drafts__',
    origin: 'https://neupgroup.com',
    basePath: '/drafts',
  },
  estate: {
    prefix: '__estate__',
    origin: 'https://neupgroup.com',
    basePath: '/estate',
  },
} as const satisfies NavigationBackTargets;

export function resolveLogicaBackNavigationHref(
  input: Omit<Parameters<typeof resolveBackNavigationHref>[0], 'targets' | 'defaultTarget'>,
) {
  return resolveBackNavigationHref({
    ...input,
    targets: LOGICA_NAVIGATION_BACK_TARGETS,
    defaultTarget: 'inapp',
  });
}

export {
  CORE_NAVIGATION_BACK_TARGETS,
  resolveBackNavigationHref,
  resolvePreviousRawPath,
};
export type { NavigationBackTargetConfig, NavigationBackTargets } from '@/core/helpers/navigation';

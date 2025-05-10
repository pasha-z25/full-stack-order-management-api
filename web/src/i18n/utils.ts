import { Lang } from '@/utils/types';

export const fallbackLng = Lang.UA;
export const languages = [fallbackLng, Lang.EN, Lang.RU];
export const defaultNS = 'translation';
export const cookieName = 'i18next';

export function getOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}

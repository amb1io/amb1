import { getRelativeLocaleUrl } from "astro:i18n";
import { defaultLocale, isLocale, type Locale } from "./locales";
import { ui, type UiKey } from "./ui";

export function useTranslations(locale: string | undefined) {
  const lang: Locale = isLocale(locale) ? locale : defaultLocale;

  return function t(key: UiKey): string {
    return ui[lang][key] ?? ui[defaultLocale][key];
  };
}

export function getLocaleHome(locale: string | undefined): string {
  const lang: Locale = isLocale(locale) ? locale : defaultLocale;
  return getRelativeLocaleUrl(lang);
}

export const locales = ["en-us", "pt-br"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en-us";

export const localeLabels: Record<Locale, string> = {
  "pt-br": "PT",
  "en-us": "EN",
};

export const htmlLang: Record<Locale, string> = {
  "pt-br": "pt-BR",
  "en-us": "en-US",
};

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (locales as readonly string[]).includes(value);
}

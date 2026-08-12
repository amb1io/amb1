// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://amb1.io",
  i18n: {
    defaultLocale: "pt-br",
    locales: ["pt-br", "en-us"],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
});

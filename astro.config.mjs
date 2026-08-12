// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://amb1.io",
  i18n: {
    defaultLocale: "en-us",
    locales: ["en-us", "pt-br"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});

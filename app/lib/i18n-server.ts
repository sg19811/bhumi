import { cookies } from "next/headers";
import { locales, type Locale } from "./i18n";

// Read the locale cookie in server components. Defaults to English.
export async function getLocale(): Promise<Locale> {
  const v = (await cookies()).get("locale")?.value as Locale | undefined;
  return v && (locales as readonly string[]).includes(v) ? v : "en";
}

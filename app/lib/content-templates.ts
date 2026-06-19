// Content templates — fetch + render. SERVER-ONLY (imports the service-role
// client). Mirrors content_templates (template_name / template_type /
// template_body). See growth-engine-spec-aggressive-v2.md §9.

import { supabaseAdmin } from "@/app/lib/supabase-server";
import type { ContentTemplate } from "./growth-types";

/**
 * Substitute {{key}} placeholders in a template body. Pure.
 * - Keys present in `vars` are replaced (null/undefined → empty string).
 * - Unknown placeholders are left intact, so missing wiring is visible.
 */
export function renderTemplate(body: string, vars: Record<string, string | null | undefined>): string {
  return body.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key] ?? "") : match
  );
}

/**
 * Fetch one active template by name, preferring `language` and falling back
 * to English. Returns null if neither exists.
 */
export async function getTemplate(templateName: string, language = "en"): Promise<ContentTemplate | null> {
  const { data } = await supabaseAdmin
    .from("content_templates")
    .select("*")
    .eq("template_name", templateName)
    .eq("language", language)
    .eq("is_active", true)
    .maybeSingle();
  if (data) return data as ContentTemplate;

  if (language !== "en") {
    const { data: en } = await supabaseAdmin
      .from("content_templates")
      .select("*")
      .eq("template_name", templateName)
      .eq("language", "en")
      .eq("is_active", true)
      .maybeSingle();
    if (en) return en as ContentTemplate;
  }
  return null;
}

/** Fetch + render in one call. Returns null if the template is missing. */
export async function renderNamedTemplate(
  templateName: string,
  vars: Record<string, string | null | undefined>,
  language = "en"
): Promise<string | null> {
  const tpl = await getTemplate(templateName, language);
  return tpl ? renderTemplate(tpl.template_body, vars) : null;
}

/**
 * Substitutes `{name}` placeholders in a UiStrings template with `vars`.
 * Deliberately simple — no ICU plural rules (see ./types.ts). An unmatched
 * placeholder is left as-is rather than silently dropped, so a missing var
 * is obvious in the rendered output instead of vanishing.
 */
export function formatUiString(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match,
  );
}

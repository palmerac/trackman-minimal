const SPREADSHEET_FORMULA_PREFIXES: Record<string, true> = {
  "=": true,
  "+": true,
  "-": true,
  "@": true,
  "\t": true,
  "\r": true,
};

/**
 * Prefixes formula-like spreadsheet cells with an apostrophe so exports are
 * treated as literal text rather than executable formulas.
 */
export function neutralizeSpreadsheetFormula(value: string): string {
  if (value.length === 0) return value;
  return SPREADSHEET_FORMULA_PREFIXES[value[0]] === true ? `'${value}` : value;
}

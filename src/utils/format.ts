export function formatNumber(value: string): string {
  return value.replace(".", ",");
}

export function formatUnit(unit: string | undefined): string {
  const trimmed = unit?.trim();
  if (!trimmed || trimmed === "st. (1-9)") return "";
  return " " + trimmed;
}

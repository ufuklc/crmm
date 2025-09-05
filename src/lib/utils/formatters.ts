export function formatCurrency(value: number, currency: string = "TRY"): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency }).format(value);
}

export function formatNumberGroups(value: number | string): string {
  const n = typeof value === "number" ? value : Number(String(value).replace(/\D/g, ""));
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat("tr-TR").format(n);
}


export function formatPhone(value: string): string {
  const digits: string = value.replace(/\D/g, "");
  if (digits.length <= 10) return digits;
  return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
}



export function formatCurrency(
  amount?: number | null,
  options?: { suffix?: boolean }
): string {
  if (amount == null) return "Rp 0,00";

  const formatted = amount.toLocaleString("id-ID");
  return options?.suffix === false
    ? `Rp ${formatted}`
    : `Rp ${formatted},00`;
}

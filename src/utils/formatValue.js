export function formatRM(amount, decimals = 2) {
  const value = amount.toLocaleString("en-MY", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `RM ${value}`;
}

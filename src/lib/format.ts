export function formatPrice(price?: number, currency = "BDT") {
  if (price == null || isNaN(price)) return "Ask for quote";
  const num = Math.round(price).toLocaleString("en-US");
  return `${currency} ${num}`;
}

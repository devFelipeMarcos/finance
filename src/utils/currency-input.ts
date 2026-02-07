export function formatCurrencyBRLInput(raw: string) {
  const onlyDigits = raw.replace(/\D/g, "");
  const number = Number(onlyDigits || "0") / 100;
  return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function parseCurrencyBRL(raw: string) {
  const onlyDigits = raw.replace(/\D/g, "");
  const number = Number(onlyDigits || "0") / 100;
  return number;
}

export function formatCurrencyBRL(amount: number) {
  return (amount ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

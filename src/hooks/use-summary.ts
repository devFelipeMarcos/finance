import { useMemo } from "react";
import { useTransactions } from "@/hooks/use-transactions";
import { usePeriod } from "@/context/period-context";

export function useSummary(walletIds?: string[]) {
  const { mode, startDate, endDate, showRecurringOnly } = usePeriod();

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { transactions } = useTransactions({
    month: mode === "month" ? month : undefined,
    year: mode === "month" ? year : undefined,
    walletIds,
    startDate: mode === "custom" ? startDate : undefined,
    endDate: mode === "custom" ? endDate : undefined,
    recurringOnly: showRecurringOnly,
  });

  const summary = useMemo(() => {
    const filtered = transactions ?? [];

    const income =
      filtered
        .filter((t) => t.type === "income")
        .reduce((acc, t) => acc + t.value, 0) ?? 0;

    const expense =
      filtered
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => acc + t.value, 0) ?? 0;

    const toReceive =
      filtered
        .filter((t) => t.type === "to_receive")
        .reduce((acc, t) => acc + t.value, 0) ?? 0;

    const toPay =
      filtered
        .filter((t) => t.type === "to_pay")
        .reduce((acc, t) => acc + t.value, 0) ?? 0;

    const balance = income - expense;
    const economy = balance > 0 ? balance : 0;

    return { income, expense, balance, economy, toReceive, toPay };
  }, [transactions]);

  return summary;
}

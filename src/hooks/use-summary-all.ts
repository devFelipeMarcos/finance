import { useTransactions } from "@/hooks/use-transactions";

export function useSummaryAll(walletIds?: string[]) {
  const { transactions } = useTransactions({ walletIds });

  const incomeAll =
    transactions
      ?.filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.value, 0) ?? 0;

  const expenseAll =
    transactions
      ?.filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.value, 0) ?? 0;

  const toReceiveAll =
    transactions
      ?.filter((t) => t.type === "to_receive")
      .reduce((acc, t) => acc + t.value, 0) ?? 0;

  const toPayAll =
    transactions
      ?.filter((t) => t.type === "to_pay")
      .reduce((acc, t) => acc + t.value, 0) ?? 0;

  const balanceAll = incomeAll - expenseAll;
  const economyAll = balanceAll > 0 ? balanceAll : 0;

  return { incomeAll, expenseAll, balanceAll, economyAll, toReceiveAll, toPayAll };
}

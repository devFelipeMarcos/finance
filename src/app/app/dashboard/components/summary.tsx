"use client";
import { useSummaryAll } from "@/hooks/use-summary-all";
import { formatCurrency } from "@/utils/format-currency";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartNoAxesCombined,
  CircleDollarSign,
  DollarSign,
  TrendingDown,
} from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import { Skeleton } from "@/components/ui/skeleton";
import { useSummaryMonth } from "@/hooks/use-summary-month";
import { usePeriod } from "@/context/period-context";

type SummaryProps = { walletIds?: string[] };
const Summary = ({ walletIds }: SummaryProps) => {
  const { mode } = usePeriod();

  const { incomeAll, expenseAll, balanceAll, economyAll, toReceiveAll, toPayAll } = useSummaryAll(walletIds);
  const { incomeMonth, expenseMonth, economyMonth, toReceiveMonth, toPayMonth } = useSummaryMonth(walletIds);

  // Escolhe qual conjunto de dados exibir com base no modo
  const income = mode === "month" ? incomeMonth : incomeAll;
  const expense = mode === "month" ? expenseMonth : expenseAll;
  const balance = mode === "month" ? balanceAll : balanceAll;
  const economy = mode === "month" ? economyMonth : economyAll;
  const toReceive = mode === "month" ? toReceiveMonth : toReceiveAll;
  const toPay = mode === "month" ? toPayMonth : toPayAll;
  const futureBalance = toReceive - toPay;

  const { isLoading } = useTransactions();

  if (isLoading) {
    return <Skeleton className="w-full h-52 rounded-xl animate-pulse" />;
  }

  const dateToday = new Date().toLocaleString("pt-BR", { month: "long" });

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Saldo Atual</CardTitle>
          <CardDescription>Receita total</CardDescription>
          <CardAction>
            <CircleDollarSign />
          </CardAction>
        </CardHeader>
        <CardContent>
          <p
            className={`text-4xl font-bold break-words ${
              balance < 0 ? "text-red-500" : "text-green-500"
            }`}
          >
            {formatCurrency(balance)}
          </p>
        </CardContent>
        <CardFooter>
          <p>Tendências em todo o período</p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Entradas</CardTitle>
          <CardDescription>
            {mode === "month" ? (
              <p>Total recebido no mês atual</p>
            ) : (
              <p>Total recebido em todo o período</p>
            )}
          </CardDescription>
          <CardAction>
            <ChartNoAxesCombined />
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold break-words">
            {formatCurrency(income)}
          </p>
        </CardContent>
        <CardFooter>
          {mode === "month" ? (
            <p>Tendências no mês de {dateToday}</p>
          ) : (
            <p>Tendências em todo o período</p>
          )}
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Saídas</CardTitle>
          <CardDescription>
            {mode === "month" ? (
              <p>Total gastos no mês atual</p>
            ) : (
              <p>Total gastos em todo o período</p>
            )}
          </CardDescription>
          <CardAction>
            <TrendingDown />
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold break-words">
            {formatCurrency(expense)}
          </p>
        </CardContent>
        <CardFooter>
          {mode === "month" ? (
            <p> Tendências no mês de {dateToday}</p>
          ) : (
            <p>Tendências em todo o período</p>
          )}
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Economia</CardTitle>
          <CardDescription>
            {mode === "month" ? (
              <p>Total economizado no mês atual</p>
            ) : (
              <p>Total economizado em todo o período</p>
            )}
          </CardDescription>
          <CardAction>
            <DollarSign />
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold break-words">
            {formatCurrency(economy)}
          </p>
        </CardContent>
        <CardFooter>
          {mode === "month" ? (
            <p>Tendências no mês de {dateToday}</p>
          ) : (
            <p>Tendências em todo o período</p>
          )}
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Valor a Receber</CardTitle>
          <CardDescription>
            {mode === "month" ? (
              <p>Total previsto para receber no mês</p>
            ) : (
              <p>Total previsto para receber no período</p>
            )}
          </CardDescription>
          <CardAction>
            <DollarSign />
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold break-words text-green-500">
            {formatCurrency(toReceive)}
          </p>
        </CardContent>
        <CardFooter>
          {mode === "month" ? (
            <p>Tendências no mês de {dateToday}</p>
          ) : (
            <p>Tendências em todo o período</p>
          )}
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Valor a Pagar</CardTitle>
          <CardDescription>
            {mode === "month" ? (
              <p>Total previsto para pagar no mês</p>
            ) : (
              <p>Total previsto para pagar no período</p>
            )}
          </CardDescription>
          <CardAction>
            <TrendingDown />
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold break-words text-red-500">
            {formatCurrency(toPay)}
          </p>
        </CardContent>
        <CardFooter>
          {mode === "month" ? (
            <p>Tendências no mês de {dateToday}</p>
          ) : (
            <p>Tendências em todo o período</p>
          )}
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Saldo Futuro</CardTitle>
          <CardDescription>
            {mode === "month" ? (
              <p>Valor previsto que vai sobrar neste mês</p>
            ) : (
              <p>Valor previsto que vai sobrar no período</p>
            )}
          </CardDescription>
          <CardAction>
            <DollarSign />
          </CardAction>
        </CardHeader>
        <CardContent>
          <p
            className={`text-4xl font-bold break-words ${
              futureBalance < 0 ? "text-red-500" : "text-green-500"
            }`}
          >
            {formatCurrency(futureBalance)}
          </p>
        </CardContent>
        <CardFooter>
          {mode === "month" ? (
            <p>Baseado em Valor a Receber - Valor a Pagar do mês</p>
          ) : (
            <p>Baseado em Valor a Receber - Valor a Pagar do período</p>
          )}
        </CardFooter>
      </Card>
    </section>
  );
};

export default Summary;

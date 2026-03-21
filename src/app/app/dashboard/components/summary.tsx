"use client";
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
import { useSummary } from "@/hooks/use-summary";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePeriod } from "@/context/period-context";

type SummaryProps = { walletIds?: string[] };

const Summary = ({ walletIds }: SummaryProps) => {
  const { mode, startDate, endDate } = usePeriod();
  const { income, expense, balance, economy, toReceive, toPay } = useSummary(walletIds);
  const { isLoading } = useTransactions();

  if (isLoading) {
    return <Skeleton className="w-full h-52 rounded-xl animate-pulse" />;
  }

  const futureBalance = toReceive - toPay;

  const getPeriodLabel = () => {
    if (mode === "month") {
      return format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });
    }
    if (mode === "custom" && startDate && endDate) {
      return `${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}`;
    }
    return "Todo o período";
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Saldo Atual</CardTitle>
          <CardDescription>Receita - Despesas</CardDescription>
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
          <p>Período: {getPeriodLabel()}</p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Entradas</CardTitle>
          <CardDescription>Total recebido</CardDescription>
          <CardAction>
            <ChartNoAxesCombined />
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold break-words text-green-500">
            {formatCurrency(income)}
          </p>
        </CardContent>
        <CardFooter>
          <p>Período: {getPeriodLabel()}</p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saídas</CardTitle>
          <CardDescription>Total gastos</CardDescription>
          <CardAction>
            <TrendingDown />
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold break-words text-red-500">
            {formatCurrency(expense)}
          </p>
        </CardContent>
        <CardFooter>
          <p>Período: {getPeriodLabel()}</p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Economia</CardTitle>
          <CardDescription>Valor economizado</CardDescription>
          <CardAction>
            <DollarSign />
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold break-words text-[#00FF7F]">
            {formatCurrency(economy)}
          </p>
        </CardContent>
        <CardFooter>
          <p>Período: {getPeriodLabel()}</p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Valor a Receber</CardTitle>
          <CardDescription>Previsto para receber</CardDescription>
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
          <p>Período: {getPeriodLabel()}</p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Valor a Pagar</CardTitle>
          <CardDescription>Previsto para pagar</CardDescription>
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
          <p>Período: {getPeriodLabel()}</p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saldo Futuro</CardTitle>
          <CardDescription>Previsto a receber - a pagar</CardDescription>
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
          <p>Período: {getPeriodLabel()}</p>
        </CardFooter>
      </Card>
    </section>
  );
};

export default Summary;

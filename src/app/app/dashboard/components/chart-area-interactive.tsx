"use client";

import { Transaction } from "@/types/transaction";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTransactions } from "@/hooks/use-transactions";
import { usePeriod } from "@/context/period-context";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/format-currency";

const months = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function groupTransactionsByMonth(transactions: Transaction[]) {
  const grouped = transactions.reduce((acc, curr) => {
    const date = new Date(curr.date);
    const monthIndex = date.getMonth();
    const month = months[monthIndex];
    const monthKey = `${monthIndex}-${date.getFullYear()}`;

    if (!acc[monthKey]) {
      acc[monthKey] = {
        month,
        monthIndex,
        year: date.getFullYear(),
        entrada: 0,
        saida: 0,
      };
    }

    if (curr.type === "income" || curr.type === "to_receive") {
      acc[monthKey].entrada += curr.value;
    } else if (curr.type === "expense" || curr.type === "to_pay") {
      acc[monthKey].saida += curr.value;
    }

    return acc;
  }, {} as Record<string, { month: string; monthIndex: number; year: number; entrada: number; saida: number }>);

  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    const [monthA, yearA] = a.split("-").map(Number);
    const [monthB, yearB] = b.split("-").map(Number);
    return (yearA - yearB) || (monthA - monthB);
  });

  let cumulative = 0;
  return sortedKeys.map((key) => {
    const data = grouped[key];
    cumulative += data.entrada - data.saida;
    return {
      ...data,
      saldo: cumulative,
    };
  });
}

export function ChartAreaFinance({ walletIds }: { walletIds?: string[] }) {
  const { mode, startDate, endDate, showRecurringOnly } = usePeriod();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { transactions, isLoading } = useTransactions(
    mode === "month"
      ? { month, year, walletIds, recurringOnly: showRecurringOnly }
      : mode === "custom"
      ? { walletIds, startDate, endDate, recurringOnly: showRecurringOnly }
      : { walletIds, recurringOnly: showRecurringOnly }
  );

  const chartData = groupTransactionsByMonth(transactions || []);

  const totalEntradas = chartData.reduce((acc, d) => acc + d.entrada, 0);
  const totalSaidas = chartData.reduce((acc, d) => acc + d.saida, 0);
  const saldoFinal = chartData.length > 0 ? chartData[chartData.length - 1].saldo : 0;

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-xl animate-pulse" />;
  }

  if (chartData.length === 0) {
    return (
      <Card className="h-full w-full">
        <CardHeader className="items-center pb-0">
          <CardTitle>Evolução Financeira</CardTitle>
          <CardDescription>Sem dados no período</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center pb-0">
          <div className="text-center text-muted-foreground">
            <Wallet className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p>Nenhuma transação encontrada</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Evolução Financeira</CardTitle>
            <CardDescription>
              Entradas, saídas e saldo acumulado
            </CardDescription>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Entradas</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Saídas</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#00FF7F]" />
              <span className="text-muted-foreground">Saldo</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-xs text-muted-foreground mb-1">Total Entradas</p>
            <p className="text-lg font-bold text-green-500">
              {formatCurrency(totalEntradas)}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-muted-foreground mb-1">Total Saídas</p>
            <p className="text-lg font-bold text-red-500">
              {formatCurrency(totalSaidas)}
            </p>
          </div>
          <div className="text-center p-3 rounded-lg bg-[#00FF7F]/10 border border-[#00FF7F]/20">
            <p className="text-xs text-muted-foreground mb-1">Saldo Final</p>
            <p className={`text-lg font-bold ${saldoFinal >= 0 ? "text-[#00FF7F]" : "text-red-500"}`}>
              {formatCurrency(saldoFinal)}
            </p>
          </div>
        </div>

        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSaida" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF7F" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00FF7F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) =>
                  new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    notation: "compact",
                  }).format(value)
                }
                className="text-xs"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
                      <p className="font-semibold mb-2">{data.month}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between gap-4">
                          <span className="text-green-500 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> Entradas
                          </span>
                          <span className="font-medium">
                            {formatCurrency(data.entrada)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-red-500 flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" /> Saídas
                          </span>
                          <span className="font-medium">
                            {formatCurrency(data.saida)}
                          </span>
                        </div>
                        <div className="border-t pt-1 mt-1 flex justify-between gap-4">
                          <span className="text-[#00FF7F]">Saldo</span>
                          <span className={`font-bold ${data.saldo >= 0 ? "text-[#00FF7F]" : "text-red-500"}`}>
                            {formatCurrency(data.saldo)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="entrada"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#colorEntrada)"
              />
              <Area
                type="monotone"
                dataKey="saida"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#colorSaida)"
              />
              <Area
                type="monotone"
                dataKey="saldo"
                stroke="#00FF7F"
                strokeWidth={2}
                fill="url(#colorSaldo)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <p className="text-xs text-muted-foreground">
          Dados acumulados desde a primeira transação • Clique nos meses para ver detalhes
        </p>
      </CardFooter>
    </Card>
  );
}

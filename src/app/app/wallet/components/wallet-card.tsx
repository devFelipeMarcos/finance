import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Wallet, CreditCard } from "lucide-react";
import { EditWalletDialog } from "@/app/app/wallet/components/edit-wallet-dialog";
import { formatCurrency } from "@/utils/format-currency";
import { DeleteWalletDialog } from "./delete-wallet-dialog";
import Image from "next/image";

type WalletCardProps = {
  id: string;
  name: string;
  type?: "wallet" | "credit_card";
  brand?: "visa" | "mastercard" | "amex" | "elo" | "hipercard" | "diners" | "discover";
  color?: string;
  limit?: number;
  billingDay?: number | null;
  displayNumber?: string | null;
  balance: number;
  lastTransaction: {
    amount: number;
    date: string;
    type: "income" | "expense";
  };
  totalIncome: number;
  totalExpense: number;
};

export default function WalletCard({
  id,
  name,
  type,
  brand,
  color,
  limit,
  billingDay,
  displayNumber,
  balance,
  lastTransaction,
  totalExpense,
}: WalletCardProps) {
  const isCard = type === "credit_card";
  if (isCard) {
    const creditBalance = (limit ?? 0) - totalExpense;
    return (
      <Card className="w-full bg-transparent border-none shadow-none p-0">
        <CardContent className="p-0">
          <div
            className="relative w-full rounded-2xl p-6 text-white flex flex-col gap-4 min-h-[220px]"
            style={{ background: color ?? "#6b21a8" }}
          >
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center gap-2">
                {brand === "visa" || brand === "mastercard" ? (
                  <div className="relative h-6 w-14">
                    <Image
                      src={brand === "visa" ? "/visa.png" : "/mastercard.png"}
                      alt={brand ?? ""}
                      fill
                      className="object-contain"
                      sizes="56px"
                      priority={false}
                    />
                  </div>
                ) : (
                  <span className="uppercase tracking-widest text-sm">{brand ?? ""}</span>
                )}
                <span className="text-sm opacity-90">{name}</span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <CreditCard className="w-5 h-5 opacity-80" />
                <span className="text-xs">{billingDay ? `Venc: ${billingDay}` : ""}</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 whitespace-nowrap">
              <EditWalletDialog wallets={{ id, name, type, brand, color, limit, billingDay: billingDay ?? undefined }} />
              <DeleteWalletDialog id={id} />
            </div>
            <div className="text-2xl font-mono tracking-widest">
              {displayNumber ?? "1234 5678 9876 5432"}
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Fatura {formatCurrency(totalExpense)}</span>
              <span>Limite {formatCurrency(limit ?? 0)}</span>
            </div>
            <div className="flex justify-end items-center text-sm">
              <span>Saldo {formatCurrency(creditBalance)}</span>
            </div>
          </div>
        </CardContent>
        {/* Sem entradas/saídas no cartão */}
      </Card>
    );
  }
  return (
    <Card className="w-full rounded-2xl shadow-md border min-h-[220px]">
      <CardHeader className="flex flex-row  justify-between ">
        <div className="flex items-center gap-3">
          <Wallet className="w-8 h-8" />

          <div>
            <CardTitle className="text-lg font-semibold">{name}</CardTitle>
            <CardDescription className="text-sm">Saldo atual</CardDescription>
          </div>
        </div>
        <div>
          <EditWalletDialog wallets={{ id, name, type, brand, color, limit, billingDay: billingDay ?? undefined }} />
          <DeleteWalletDialog id={id} />
        </div>
      </CardHeader>

      <CardContent className="space-y-2 flex flex-col justify-between ">
        <p className="text-3xl font-bold break-words">
          {formatCurrency(balance)}
        </p>
        <p className="text-sm text-muted-foreground">
          Última movimentação:{" "}
          {lastTransaction ? (
            <span
              className={`font-semibold ${
                lastTransaction.type === "income"
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {formatCurrency(lastTransaction.amount)}
            </span>
          ) : (
            <span className="text-muted-foreground italic">
              Nenhuma movimentação
            </span>
          )}
        </p>
      </CardContent>

      {/* Rodapé removido para manter altura igual aos cartões */}
    </Card>
  );
}

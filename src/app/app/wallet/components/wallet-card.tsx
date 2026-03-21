import { CreditCard, Calendar } from "lucide-react";
import { EditWalletDialog } from "@/app/app/wallet/components/edit-wallet-dialog";
import { formatCurrency } from "@/utils/format-currency";
import { DeleteWalletDialog } from "./delete-wallet-dialog";

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

const brandLogos: Record<string, string> = {
  visa: "VISA",
  mastercard: "MC",
  amex: "AMEX",
  elo: "ELO",
  hipercard: "HIPER",
  diners: "DINERS",
  discover: "DISC",
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
    const cardNumber = displayNumber ?? "**** **** **** 1234";
    const finalDigits = cardNumber.slice(-4);

    return (
      <div
        className="relative w-full rounded-2xl p-6 text-white overflow-hidden min-h-[200px] flex flex-col justify-between"
        style={{
          background: `linear-gradient(135deg, ${color ?? "#6366f1"} 0%, ${color ?? "#6366f1"}dd 50%, ${color ?? "#6366f1"}99 100%)`,
        }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="flex justify-between items-start relative z-10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 opacity-90" />
              <span className="text-sm font-medium opacity-90">{name}</span>
            </div>
            <div className="flex items-center gap-1 text-xs opacity-75">
              <Calendar className="w-3 h-3" />
              <span>Vencimento: dia {billingDay}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <EditWalletDialog wallets={{ id, name, type, brand, color, limit, billingDay: billingDay ?? undefined }} />
            <DeleteWalletDialog id={id} />
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-75 mb-1">Número do cartão</p>
              <p className="font-mono text-lg tracking-widest">
                •••• •••• •••• {finalDigits}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
              <p className="text-xs opacity-75">Bandeira</p>
              <p className="font-bold text-sm uppercase">{brandLogos[brand ?? ""] || brand}</p>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="flex gap-6">
              <div>
                <p className="text-xs opacity-75">Fatura atual</p>
                <p className="font-semibold">{formatCurrency(totalExpense)}</p>
              </div>
              <div>
                <p className="text-xs opacity-75">Limite disponível</p>
                <p className={`font-semibold ${creditBalance < 0 ? "text-red-300" : ""}`}>
                  {formatCurrency(creditBalance)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-75">Limite total</p>
              <p className="font-semibold">{formatCurrency(limit ?? 0)}</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-3 right-6">
          <div className={`font-bold text-xl tracking-wider ${brand === "amex" ? "text-yellow-300" : "text-white"}`}>
            {brandLogos[brand ?? ""] || "CARD"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border bg-card shadow-md min-h-[200px] flex flex-col p-5">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-sm text-muted-foreground">Carteira</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <EditWalletDialog wallets={{ id, name, type, brand, color, limit, billingDay: billingDay ?? undefined }} />
          <DeleteWalletDialog id={id} />
        </div>
      </div>

      <div className="mt-auto space-y-3">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Saldo atual</p>
          <p className={`text-3xl font-bold ${balance >= 0 ? "text-[#00FF7F]" : "text-red-500"}`}>
            {formatCurrency(balance)}
          </p>
        </div>

        {lastTransaction && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Última movimentação:
              <span
                className={`font-semibold ml-1 ${
                  lastTransaction.type === "income"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {formatCurrency(lastTransaction.amount)}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

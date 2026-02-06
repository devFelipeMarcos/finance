export type Wallets = {
  id: string;
  name: string;
  type?: "wallet" | "credit_card";
  brand?: "visa" | "mastercard" | "amex" | "elo" | "hipercard" | "diners" | "discover";
  color?: string;
  limit?: number;
  billingDay?: number | null;
  displayNumber?: string | null;
  relationship: string[];
  balance: number;
  number: number;
  lastTransaction: {
    amount: number;
    date: string;
    type: "income" | "expense";
  };
  totalIncome: number;
  totalExpense: number;
};

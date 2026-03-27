export type Category = {
  id: string;
  name: string;
  emoji: string | null;
  color: string;
  userId: string | null;
};

export type Wallet = {
  id: string;
  name: string;
  userId: string | null;
};

export type Transaction = {
  id: string;
  description: string;
  value: number;
  type: "income" | "expense" | "to_receive" | "to_pay";
  date: Date;
  categoryId: string;
  category: Category;
  walletId: string;
  wallet: Wallet;
  isRecurring: boolean;
  recurringUntil: Date | null;
  recurringId: string | null;
};

export type TransactionType = {
  month: string;
  income: number;
  expense: number;
};

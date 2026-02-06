import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth/next";
import { walletSchema } from "@/lib/schemas/wallet-schema";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "select";
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const phone = searchParams.get("phone");

    if (phone) {
      const user = await prisma.user.findUnique({
        where: { phone },
      });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (type === "summary") {
        const wallets = await prisma.wallet.findMany({
          where: { userId: user.id },
          include: {
            transactions: {
              select: { value: true, description: true, date: true, type: true },
              orderBy: { date: "asc" },
            },
          },
        });

        const result = wallets.map((wallet) => {
          const w = wallet as {
            type?: "wallet" | "credit_card";
            brand?: "visa" | "mastercard" | "amex" | "elo" | "hipercard" | "diners" | "discover";
            color?: string | null;
            limit?: number | null;
            billingDay?: number | null;
            displayNumber?: string | null;
          };
          const filteredTransactions =
            month && year
              ? walletsFilterByMonthYear(wallet.transactions, month, year)
              : wallet.transactions;

          const totalIncomePeriod = filteredTransactions
            .filter((t) => t.type === "income")
            .reduce((acc, t) => acc + t.value, 0);

          const totalExpensePeriod = filteredTransactions
            .filter((t) => t.type === "expense")
            .reduce((acc, t) => acc + t.value, 0);

          const totalIncomeAllTime = wallet.transactions
            .filter((t) => t.type === "income")
            .reduce((acc, t) => acc + t.value, 0);

          const totalExpenseAllTime = wallet.transactions
            .filter((t) => t.type === "expense")
            .reduce((acc, t) => acc + t.value, 0);

          const lastTransaction = wallet.transactions.length
            ? wallet.transactions[wallet.transactions.length - 1]
            : null;

          return {
            id: wallet.id,
            name: wallet.name,
            type: w.type,
            brand: w.brand,
            color: w.color ?? undefined,
            limit: (w.limit ?? 0) as number,
            billingDay: (w.billingDay ?? null) as number | null,
            displayNumber: (w.displayNumber ?? null) as string | null,
            totalIncome: totalIncomePeriod,
            totalExpense: totalExpensePeriod,
            balance: totalIncomeAllTime - totalExpenseAllTime,
            lastTransaction: lastTransaction
              ? {
                  amount: lastTransaction.value,
                  date: lastTransaction.date.toISOString(),
                  type: lastTransaction.type,
                }
              : null,
          };
        });

        return NextResponse.json(result);
      }

      const wallets = await prisma.wallet.findMany({
        where: { userId: user.id },
        select: { id: true, name: true },
      });
      return NextResponse.json(wallets);
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (type === "summary") {
      const wallets = await prisma.wallet.findMany({
        where: { userId: user.id },
        include: {
          transactions: {
            select: { value: true, description: true, date: true, type: true },
            orderBy: { date: "asc" },
          },
        },
      });

      const result = wallets.map((wallet) => {
        const w = wallet as {
          type?: "wallet" | "credit_card";
          brand?: "visa" | "mastercard" | "amex" | "elo" | "hipercard" | "diners" | "discover";
          color?: string | null;
          limit?: number | null;
          billingDay?: number | null;
          displayNumber?: string | null;
        };
        const filteredTransactions =
          month && year
            ? walletsFilterByMonthYear(wallet.transactions, month, year)
            : wallet.transactions;

        const totalIncomePeriod = filteredTransactions
          .filter((t) => t.type === "income")
          .reduce((acc, t) => acc + t.value, 0);

        const totalExpensePeriod = filteredTransactions
          .filter((t) => t.type === "expense")
          .reduce((acc, t) => acc + t.value, 0);

        const totalIncomeAllTime = wallet.transactions
          .filter((t) => t.type === "income")
          .reduce((acc, t) => acc + t.value, 0);

        const totalExpenseAllTime = wallet.transactions
          .filter((t) => t.type === "expense")
          .reduce((acc, t) => acc + t.value, 0);

        const lastTransaction = wallet.transactions.length
          ? wallet.transactions[wallet.transactions.length - 1]
          : null;

        return {
          id: wallet.id,
          name: wallet.name,
          type: w.type,
          brand: w.brand,
          color: w.color ?? undefined,
          limit: (w.limit ?? 0) as number,
          billingDay: (w.billingDay ?? null) as number | null,
          displayNumber: (w.displayNumber ?? null) as string | null,
          totalIncome: totalIncomePeriod,
          totalExpense: totalExpensePeriod,
          balance: totalIncomeAllTime - totalExpenseAllTime,
          lastTransaction: lastTransaction
            ? {
                amount: lastTransaction.value,
                date: lastTransaction.date.toISOString(),
                type: lastTransaction.type,
              }
            : null,
        };
      });

      return NextResponse.json(result);
    }

    // Default: select mode
    const wallets = await prisma.wallet.findMany({
      where: { userId: user.id },
      select: { id: true, name: true },
    });

    return NextResponse.json(wallets);
  } catch (err) {
    console.error("Erro ao buscar carteiras:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = walletSchema.parse(body);

    const existingWallet = await prisma.wallet.findFirst({
      where: {
        name: parsed.name,
        userId: user.id,
      },
    });

    if (existingWallet) {
      return NextResponse.json(
        { error: "Você já tem uma categoria com esse nome" },
        { status: 400 }
      );
    }

    const isCard = (parsed as any).type === "credit_card";
    const cardData = isCard
      ? {
          type: "credit_card" as const,
          brand: (parsed as any).brand,
          color: (parsed as any).color,
          limit: (parsed as any).limit,
          billingDay: (parsed as any).billingDay,
          displayNumber: generateCardDisplayNumber(),
        }
      : { type: "wallet" as const };

    const wallet = await prisma.wallet.create({
      data: {
        name: parsed.name,
        userId: user.id,
        ...cardData,
      },
    });

    return NextResponse.json(wallet, { status: 201 });
  } catch (err) {
    console.error("Erro ao criar carteira:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateCardDisplayNumber() {
  const segments = Array.from({ length: 4 }).map(() =>
    Math.floor(1000 + Math.random() * 9000).toString()
  );
  return segments.join(" ");
}
function walletsFilterByMonthYear<T extends { date: Date | string }>(
  transactions: T[],
  month: string | null,
  year: string | null
): T[] {
  return transactions.filter((t) => {
    const d = new Date(t.date as Date | string);
    return d.getMonth() + 1 === Number(month) && d.getFullYear() === Number(year);
  });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth/next";
import { transactionSchema } from "@/lib/schemas/transaction-schema";
import { addMonths } from "date-fns";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const phone = searchParams.get("phone");
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const recurringOnly = searchParams.get("recurringOnly");

  let dateFilter = {};
  if (month && year) {
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

    dateFilter = {
      date: {
        gte: startDate,
        lte: endDate,
      },
    };
  } else if (startDateParam && endDateParam) {
    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);
    endDate.setHours(23, 59, 59, 999);

    dateFilter = {
      date: {
        gte: startDate,
        lte: endDate,
      },
    };
  }

  const recurringFilter = recurringOnly === "true" ? { isRecurring: true } : {};

  if (phone) {
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        ...dateFilter,
        ...recurringFilter,
      },
      include: {
        category: true,
        wallet: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(transactions);
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      user: { email: session.user.email },
      ...dateFilter,
      ...recurringFilter,
    },
    include: {
      category: true,
      wallet: true,
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(transactions);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const phone = body.phone as string | undefined;

    if (phone) {
      const description = body.description as string | undefined;
      const rawValue = body.value;
      const value =
        typeof rawValue === "number" ? rawValue : Number(rawValue ?? NaN);
      const categoryId = body.categoryId as string | undefined;

      if (!description || typeof description !== "string") {
        return NextResponse.json(
          { error: "Descrição inválida" },
          { status: 400 }
        );
      }

      if (!Number.isFinite(value) || value <= 0) {
        return NextResponse.json(
          { error: "Valor inválido" },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { phone },
      });

      if (!user) {
        return NextResponse.json(
          { error: "Usuário não encontrado" },
          { status: 404 }
        );
      }

      const walletIdInput = body.walletId as string | undefined;
      let wallet: { id: string; userId: string } | null = null;
      if (walletIdInput) {
        const w = await prisma.wallet.findUnique({ where: { id: walletIdInput } });
        if (w && w.userId === user.id) {
          wallet = w;
        }
      }
      if (!wallet) {
        wallet = await prisma.wallet.findFirst({
          where: {
            userId: user.id,
            name: "Carteira Padrão",
          },
        });
        if (!wallet) {
          wallet = await prisma.wallet.create({
            data: {
              name: "Carteira Padrão",
              userId: user.id,
            },
          });
        }
      }

      let resolvedCategoryId: string | null = null;

      if (categoryId) {
        const existingCategory = await prisma.category.findUnique({
          where: { id: categoryId },
        });

        if (existingCategory && existingCategory.userId === user.id) {
          resolvedCategoryId = existingCategory.id;
        }
      }

      if (!resolvedCategoryId) {
        let otherCategory = await prisma.category.findFirst({
          where: {
            userId: user.id,
            name: "Outros",
          },
        });

        if (!otherCategory) {
          otherCategory = await prisma.category.create({
            data: {
              name: "Outros",
              color: "#cccccc",
              userId: user.id,
            },
          });
        }

        resolvedCategoryId = otherCategory.id;
      }

      const typeRaw = String(body.typeTransaction ?? body.type ?? "").toLowerCase();
      const type: "income" | "expense" | "to_receive" | "to_pay" =
        typeRaw === "income" || typeRaw === "receita"
          ? "income"
          : typeRaw === "expense" || typeRaw === "despesa"
          ? "expense"
          : typeRaw === "to_receive" || typeRaw === "a_receber" || typeRaw === "receber"
          ? "to_receive"
          : typeRaw === "to_pay" || typeRaw === "a_pagar" || typeRaw === "pagar"
          ? "to_pay"
          : "expense";

      const transaction = await prisma.transaction.create({
        data: {
          description,
          categoryId: resolvedCategoryId,
          walletId: wallet.id,
          value,
          type,
          date: new Date(),
          userId: user.id,
        },
      });

      return NextResponse.json(transaction, { status: 201 });
    }

    body.date = new Date(body.date);
    if (body.recurringUntil) {
      body.recurringUntil = new Date(body.recurringUntil);
    }

    const { description, value, categoryId, walletId, type, date, isRecurring, recurringUntil } =
      transactionSchema.parse(body);

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const recurringId = isRecurring ? crypto.randomUUID() : null;

    const transaction = await prisma.transaction.create({
      data: {
        description,
        categoryId,
        walletId,
        value,
        type,
        date: new Date(date),
        userId: user.id,
        isRecurring,
        recurringUntil: recurringUntil ? new Date(recurringUntil) : null,
        recurringId,
      } as never,
    });

    if (isRecurring && recurringUntil) {
      const recurringUntilDate = new Date(recurringUntil);
      const firstDate = new Date(date);
      const dayOfMonth = firstDate.getDate();
      let nextDate = addMonths(new Date(firstDate.getFullYear(), firstDate.getMonth(), dayOfMonth), 1);

      while (nextDate <= recurringUntilDate) {
        await prisma.transaction.create({
          data: {
            description,
            categoryId,
            walletId,
            value,
            type,
            date: nextDate,
            userId: user.id,
            isRecurring: true,
            recurringUntil: recurringUntilDate,
            recurringId,
          } as never,
        });

        nextDate = addMonths(nextDate, 1);
      }
    }

    return NextResponse.json(transaction, { status: 201 });
  } catch (err) {
    console.error("Erro no POST /api/transactions:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

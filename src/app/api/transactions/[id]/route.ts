import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth/next";
import { z } from "zod";

const updateTransactionSchema = z.object({
  description: z
    .string()
    .trim()
    .min(3, "A descrição deve ter pelo menos 3 caracteres")
    .max(100, "A descrição pode ter no máximo 100 caracteres"),
  value: z
    .number()
    .positive()
    .max(999999999),
  categoryId: z.string().min(1),
  walletId: z.string().min(1),
  type: z.enum(["income", "expense", "to_receive", "to_pay"]),
  date: z.coerce.date(),
  isRecurring: z.boolean().optional(),
  recurringUntil: z.union([z.coerce.date(), z.null()]).nullable().optional(),
  recurringId: z.string().nullable().optional(),
});

// GET - detalhe de uma transação
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id },
  });

  if (!transaction) {
    return NextResponse.json(
      { error: "Transação não encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json(transaction);
}

// PUT - atualizar transação
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const parsed = updateTransactionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { description, categoryId, walletId, value, type, date, isRecurring, recurringUntil, recurringId } = parsed.data;

  try {
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        description,
        categoryId,
        walletId,
        value,
        type,
        date,
        isRecurring,
        recurringUntil,
        recurringId,
      } as never,
    });

    return NextResponse.json(transaction, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Erro ao atualizar transação" },
      { status: 500 }
    );
  }
}

// DELETE - remover transação
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Transação removida com sucesso" });
  } catch {
    return NextResponse.json(
      { error: "Transação não encontrada" },
      { status: 404 }
    );
  }
}

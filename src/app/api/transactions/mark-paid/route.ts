import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth/next";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { transactionId } = body;

  if (!transactionId) {
    return NextResponse.json(
      { error: "ID da transação não fornecido" },
      { status: 400 }
    );
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { user: true },
  });

  if (!transaction) {
    return NextResponse.json(
      { error: "Transação não encontrada" },
      { status: 404 }
    );
  }

  if (transaction.user.email !== session.user.email) {
    return NextResponse.json(
      { error: "Transação não pertence ao usuário" },
      { status: 403 }
    );
  }

  if (transaction.type !== "to_pay") {
    return NextResponse.json(
      { error: "Apenas transações a pagar podem ser marcadas como pagas" },
      { status: 400 }
    );
  }

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      type: "expense",
    },
    include: {
      category: true,
      wallet: true,
    },
  });

  return NextResponse.json(updated);
}

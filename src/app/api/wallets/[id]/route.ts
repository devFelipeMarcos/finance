import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth/next";
import { walletSchema, WalletsFormData } from "@/lib/schemas/wallet-schema";

// GET - detalhe de uma cartira
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const wallets = await prisma.wallet.findUnique({
    where: { id },
  });

  if (!wallets) {
    return NextResponse.json(
      { error: "Categoria não encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json(wallets);
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
  const parsed = walletSchema.parse(body) as WalletsFormData;

  try {
    const wallets = await prisma.wallet.update({
      where: { id },
      data: {
        name: parsed.name,
        ...(("type" in parsed && parsed.type === "credit_card")
          ? {
              type: "credit_card" as const,
              brand: (parsed as Extract<WalletsFormData, { type: "credit_card" }>).brand,
              color: (parsed as Extract<WalletsFormData, { type: "credit_card" }>).color,
              limit: (parsed as Extract<WalletsFormData, { type: "credit_card" }>).limit,
              billingDay: (parsed as Extract<WalletsFormData, { type: "credit_card" }>).billingDay,
            }
          : {
              type: "wallet" as const,
              brand: null,
              color: null,
              limit: null,
              billingDay: null,
            })
      },
    });

    return NextResponse.json(wallets, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar carteira" },
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
    await prisma.wallet.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Carteira removida com sucesso" });
  } catch {
    return NextResponse.json(
      { error: "Carteira não encontrada" },
      { status: 404 }
    );
  }
}

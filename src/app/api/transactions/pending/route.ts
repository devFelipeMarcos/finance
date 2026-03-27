import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth/next";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const pendingTransactions = await prisma.transaction.findMany({
    where: {
      user: { email: session.user.email },
      type: "to_pay",
      date: {
        lte: tomorrow,
      },
    },
    include: {
      category: true,
      wallet: true,
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(pendingTransactions);
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { AuthBranding } from "@/components/auth/auth-branding";

export const metadata = {
  title: "Criar Conta | Balancefy",
  description:
    "Crie sua conta gratuita e comece a organizar suas finanças de forma inteligente. Leve o controle do seu dinheiro para o próximo nível.",
};

export default async function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/app/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <AuthBranding
        title="Comece a organizar suas finanças hoje"
        description="Crie sua conta gratuita e descubra como é fácil controlar seus gastos, poupar dinheiro e alcançar seus objetivos financeiros."
      />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        {children}
      </div>
    </div>
  );
}

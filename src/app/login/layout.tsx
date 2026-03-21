import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { AuthBranding } from "@/components/auth/auth-branding";

export const metadata = {
  title: "Entrar | Balancefy",
  description:
    "Acesse sua conta Balancefy e retome o controle das suas finanças pessoais com segurança e praticidade.",
};

export default async function LoginLayout({
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
        title="Gerencie suas finanças com inteligência"
        description="Acompanhe seus gastos, defina metas e tome decisões financeiras mais inteligentes com o Balancefy."
      />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        {children}
      </div>
    </div>
  );
}

"use client";

import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormData } from "@/lib/schemas/auth-schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, Mail, Phone, UserPlus } from "lucide-react";
import { AuthCard, AuthHeader, AuthFooter, AuthDivider, SocialButton } from "@/components/auth/auth-card";
import { FormField } from "@/components/auth/auth-card";
import { Input, PasswordInput } from "@/components/ui/animated-input";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        redirect: false,
      }),
    });

    const responseData = await res.json();

    if (res.ok) {
      toast.success("Conta criada com sucesso!");
      router.push("/login");
    } else {
      toast.error(responseData.error || "Erro ao criar usuário");
    }
  };

  return (
    <AuthCard>
      <AuthHeader
        icon={UserPlus}
        title="Criar conta"
        description="Preencha seus dados para começar"
      />

      <div className="px-6 pb-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField>
            <Label htmlFor="name" className="text-sm font-medium">
              Nome completo
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="João Silva"
              icon={User}
              error={errors.name?.message}
              {...register("name")}
            />
          </FormField>

          <FormField>
            <Label htmlFor="phone" className="text-sm font-medium">
              Telefone
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              icon={Phone}
              error={errors.phone?.message}
              {...register("phone")}
            />
          </FormField>

          <FormField>
            <Label htmlFor="email" className="text-sm font-medium">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              icon={Mail}
              error={errors.email?.message}
              {...register("email")}
            />
          </FormField>

          <FormField>
            <Label htmlFor="password" className="text-sm font-medium">
              Senha
            </Label>
            <PasswordInput
              id="password"
              placeholder="Mínimo 6 caracteres"
              error={errors.password?.message}
              {...register("password")}
            />
          </FormField>

          <AnimatedButton
            type="submit"
            variant="gradient"
            className="w-full mt-6"
            isLoading={isSubmitting}
          >
            Criar conta
          </AnimatedButton>
        </form>

        <AuthDivider label="ou cadastre-se com" />

        <SocialButton
          onClick={() => signIn("google", { callbackUrl: "/app/dashboard" })}
          label="Google"
          icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          }
        />
      </div>

      <AuthFooter className="border-t bg-muted/30">
        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#00FF7F] hover:text-[#00FF7F]/80 transition-colors"
          >
            Fazer login
          </Link>
        </p>
      </AuthFooter>
    </AuthCard>
  );
}

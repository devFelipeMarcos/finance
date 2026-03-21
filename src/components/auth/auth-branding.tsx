"use client";

interface AuthBrandingProps {
  title?: string;
  description?: string;
}

export function AuthBranding({
  title = "Bem-vindo ao Balancefy",
  description = "Gerencie suas finanças de forma inteligente e alcance seus objetivos financeiros com facilidade.",
}: AuthBrandingProps) {
  return (
    <div className="hidden lg:flex relative w-1/2 bg-black items-center justify-center">
      <div className="relative z-10 max-w-md text-center text-white px-8">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00FF7F] rounded-3xl mb-6 shadow-2xl shadow-[#00FF7F]/20">
            <svg
              className="w-10 h-10 text-black"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">{title}</h2>
          <p className="text-lg text-white/70 leading-relaxed">{description}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-12">
          <FeatureCard
            icon={
              <svg className="w-6 h-6 text-[#00FF7F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            title="Gráficos"
            description="Visualize gastos"
          />
          <FeatureCard
            icon={
              <svg className="w-6 h-6 text-[#00FF7F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="Controle"
            description="Gerencie carteiras"
          />
          <FeatureCard
            icon={
              <svg className="w-6 h-6 text-[#00FF7F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            title="Seguro"
            description="Dados protegidos"
          />
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="border border-white/10 rounded-2xl p-4 text-center transition-all hover:border-[#00FF7F]/30">
      <div className="mx-auto w-12 h-12 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-xs text-white/50">{description}</p>
    </div>
  );
}

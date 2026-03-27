import { useQuery } from "@tanstack/react-query";

export function usePendingCount() {
  const { data, isLoading } = useQuery({
    queryKey: ["pending-count"],
    queryFn: async () => {
      const res = await fetch("/api/transactions/pending");
      if (!res.ok) throw new Error("Erro ao buscar pendências");
      const data = await res.json();
      return data.length;
    },
    refetchInterval: 60000,
  });

  return {
    count: data ?? 0,
    isLoading,
  };
}

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { Wallet, Briefcase, ArrowRight, TrendingUp, ListChecks } from "lucide-react";

export default async function HubPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Resumo financeiro: soma dos saldos de todas as entidades
  const { data: entities } = await supabase
    .from("entities")
    .select("current_balance")
    .eq("user_id", user.id);

  const totalBalance =
    entities?.reduce((sum, e) => sum + Number(e.current_balance ?? 0), 0) ?? 0;

  // Resumo de tarefas pendentes com prazo hoje ou já vencidas
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const { data: pendingTasks } = await supabase
    .from("work_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("type", "todo")
    .eq("is_completed", false)
    .lte("due_date", today.toISOString());

  const pendingCount = pendingTasks?.length ?? 0;

  const displayName =
    (user.user_metadata?.full_name as string | undefined)?.split(" ")[0] ||
    user.email?.split("@")[0] ||
    "usuário";

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 md:py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-textMuted text-sm">Bem-vindo(a) de volta,</p>
          <h1 className="text-2xl md:text-3xl font-bold text-textMain">
            {displayName} 👋
          </h1>
        </div>
        <LogoutButton />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link
          href="/finances"
          className="card hover:border-primary transition-colors group relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="bg-primary/10 p-3 rounded-xl">
              <Wallet className="text-primary" size={26} />
            </div>
            <ArrowRight
              className="text-textMuted group-hover:text-primary group-hover:translate-x-1 transition-all"
              size={20}
            />
          </div>
          <h2 className="text-xl font-bold mt-6 text-textMain">
            Módulo Finances
          </h2>
          <p className="text-textMuted text-sm mt-1">
            Gerencie contas, transações e gráficos
          </p>

          <div className="mt-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-textMuted" />
            <span className="text-textMuted text-sm">Saldo total acumulado</span>
          </div>
          <p
            className={`text-3xl font-bold mt-1 ${
              totalBalance >= 0 ? "text-textMain" : "text-red-400"
            }`}
          >
            {totalBalance.toLocaleString("pt-PT", {
              style: "currency",
              currency: "EUR",
            })}
          </p>
        </Link>

        <Link
          href="/work"
          className="card hover:border-primary transition-colors group relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div className="bg-primary/10 p-3 rounded-xl">
              <Briefcase className="text-primary" size={26} />
            </div>
            <ArrowRight
              className="text-textMuted group-hover:text-primary group-hover:translate-x-1 transition-all"
              size={20}
            />
          </div>
          <h2 className="text-xl font-bold mt-6 text-textMain">
            Módulo Work
          </h2>
          <p className="text-textMuted text-sm mt-1">
            Tarefas, projetos e ideias
          </p>

          <div className="mt-6 flex items-center gap-2">
            <ListChecks size={16} className="text-textMuted" />
            <span className="text-textMuted text-sm">Tarefas pendentes até hoje</span>
          </div>
          <p className="text-3xl font-bold mt-1 text-textMain">
            {pendingCount}
          </p>
        </Link>
      </div>
    </div>
  );
}

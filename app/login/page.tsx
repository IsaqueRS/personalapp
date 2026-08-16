"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Wallet, Mail, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        setInfo(
          "Conta criada! Verifique seu e-mail para confirmar (se a confirmação estiver ativa) ou faça login."
        );
        setMode("login");
      }
    } catch (err: any) {
      setError(err.message ?? "Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 p-4 rounded-2xl mb-4">
            <Wallet className="text-primary" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-textMain">
            Organizador Pessoal
          </h1>
          <p className="text-textMuted text-sm mt-1">
            Finanças e produtividade em um só lugar
          </p>
        </div>

        <div className="card">
          <div className="flex mb-6 bg-[#262626] rounded-xl p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "login"
                  ? "bg-primary text-white"
                  : "text-textMuted"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "signup"
                  ? "bg-primary text-white"
                  : "text-textMuted"
              }`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="label-field">Nome completo</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field"
                  placeholder="Seu nome"
                />
              </div>
            )}

            <div>
              <label className="label-field flex items-center gap-1.5">
                <Mail size={14} /> E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="voce@email.com"
              />
            </div>

            <div>
              <label className="label-field flex items-center gap-1.5">
                <Lock size={14} /> Senha
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {info && (
              <p className="text-green-400 text-sm bg-green-950/40 border border-green-900 rounded-lg px-3 py-2">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              {mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

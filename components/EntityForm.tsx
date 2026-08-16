"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function EntityForm({ onDone }: { onDone: () => void }) {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Sessão expirada. Faça login novamente.");
      setLoading(false);
      return;
    }

    const balance = parseFloat(initialBalance.replace(",", ".")) || 0;

    const { error } = await supabase.from("entities").insert({
      user_id: user.id,
      name: name.trim(),
      initial_balance: balance,
      current_balance: balance,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label-field">Nome da entidade</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
          placeholder="Ex: Santander, Revolut, Dinheiro"
        />
      </div>
      <div>
        <label className="label-field">Saldo inicial (€)</label>
        <input
          type="number"
          step="0.01"
          required
          value={initialBalance}
          onChange={(e) => setInitialBalance(e.target.value)}
          className="input-field"
          placeholder="0.00"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Salvando..." : "Cadastrar entidade"}
      </button>
    </form>
  );
}

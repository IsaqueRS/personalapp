"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Entity } from "@/lib/types";
import { Trash2 } from "lucide-react";

export default function EditEntityForm({
  entity,
  onDone,
}: {
  entity: Entity;
  onDone: () => void;
}) {
  const supabase = createClient();
  const [name, setName] = useState(entity.name);
  const [balance, setBalance] = useState(String(entity.current_balance));
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const newBalance = parseFloat(balance.replace(",", "."));
    if (Number.isNaN(newBalance)) {
      setError("Informe um valor de saldo válido.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("entities")
      .update({
        name: name.trim(),
        current_balance: newBalance,
      })
      .eq("id", entity.id);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    onDone();
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Excluir "${entity.name}"? Isso também apaga todas as transações vinculadas a ela. Essa ação não pode ser desfeita.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);

    const { error } = await supabase
      .from("entities")
      .delete()
      .eq("id", entity.id);

    setDeleting(false);

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
        />
      </div>

      <div>
        <label className="label-field">Saldo atual (€)</label>
        <input
          type="number"
          step="0.01"
          required
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          className="input-field"
        />
        <p className="text-textMuted text-xs mt-1.5">
          Use isso apenas para corrigir divergências. Lançamentos normais
          devem ser feitos como Transações, para manter o histórico correto.
        </p>
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || deleting}
          className="btn-primary flex-1"
        >
          {loading ? "Salvando..." : "Salvar alterações"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading || deleting}
          className="bg-red-950/40 border border-red-900 text-red-400 hover:bg-red-950/70 rounded-xl px-4 py-2.5 transition-colors disabled:opacity-50"
          title="Excluir entidade"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </form>
  );
}

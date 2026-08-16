"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Entity, TransactionType } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";

export default function TransactionForm({
  entities,
  onDone,
}: {
  entities: Entity[];
  onDone: () => void;
}) {
  const supabase = createClient();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>("saida");
  const [entityId, setEntityId] = useState(entities[0]?.id ?? "");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!entityId) {
      setError("Cadastre uma entidade/banco antes de lançar transações.");
      return;
    }

    const value = parseFloat(amount.replace(",", "."));
    if (!value || value <= 0) {
      setError("Informe um valor válido maior que zero.");
      return;
    }

    setLoading(true);

    // Chama a função no banco (RPC) que insere a transação
    // e atualiza o saldo da entidade de forma atômica.
    const { error } = await supabase.rpc("register_transaction", {
      p_entity_id: entityId,
      p_amount: value,
      p_type: type,
      p_category: category,
      p_description: description.trim() || null,
      p_transaction_date: date,
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
      <div className="flex bg-[#262626] rounded-xl p-1">
        <button
          type="button"
          onClick={() => setType("entrada")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            type === "entrada" ? "bg-primary text-white" : "text-textMuted"
          }`}
        >
          Entrada
        </button>
        <button
          type="button"
          onClick={() => setType("saida")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            type === "saida" ? "bg-primary text-white" : "text-textMuted"
          }`}
        >
          Saída
        </button>
      </div>

      <div>
        <label className="label-field">Valor (€)</label>
        <input
          type="number"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input-field"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="label-field">Entidade / Banco</label>
        <select
          required
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
          className="input-field"
        >
          {entities.length === 0 && <option value="">Nenhuma entidade</option>}
          {entities.map((ent) => (
            <option key={ent.id} value={ent.id}>
              {ent.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-field">Categoria</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input-field"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-field">Descrição (opcional)</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field"
          placeholder="Ex: Jantar com amigos"
        />
      </div>

      <div>
        <label className="label-field">Data</label>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || entities.length === 0}
        className="btn-primary w-full"
      >
        {loading ? "Salvando..." : "Registrar transação"}
      </button>
    </form>
  );
}

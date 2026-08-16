"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import type { Entity, Transaction } from "@/lib/types";
import Modal from "@/components/Modal";
import EntityForm from "@/components/EntityForm";
import TransactionForm from "@/components/TransactionForm";
import {
  BalanceByEntityChart,
  IncomeExpenseChart,
} from "@/components/FinanceCharts";
import {
  ArrowLeft,
  Plus,
  Wallet,
  Landmark,
  ArrowUpCircle,
  ArrowDownCircle,
  Loader2,
} from "lucide-react";

export default function FinancesPage() {
  const supabase = createClient();

  const [entities, setEntities] = useState<Entity[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);

  const loadData = useCallback(async () => {
    const [{ data: ent }, { data: tx }] = await Promise.all([
      supabase.from("entities").select("*").order("created_at"),
      supabase
        .from("transactions")
        .select("*, entities(name)")
        .order("transaction_date", { ascending: false })
        .limit(50),
    ]);

    setEntities((ent as Entity[]) ?? []);
    setTransactions((tx as Transaction[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalBalance = entities.reduce(
    (sum, e) => sum + Number(e.current_balance),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 pb-24">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/"
          className="text-textMuted hover:text-primary transition-colors"
        >
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-2xl font-bold text-textMain flex items-center gap-2">
          <Wallet className="text-primary" size={24} /> Finances
        </h1>
      </div>

      {/* Saldo total */}
      <div className="card mb-6">
        <p className="text-textMuted text-sm">Saldo Total Acumulado</p>
        <p
          className={`text-4xl font-bold mt-1 ${
            totalBalance >= 0 ? "text-textMain" : "text-red-400"
          }`}
        >
          {totalBalance.toLocaleString("pt-PT", {
            style: "currency",
            currency: "EUR",
          })}
        </p>
      </div>

      {/* Ações rápidas */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setShowTxModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Nova Transação
        </button>
        <button
          onClick={() => setShowEntityModal(true)}
          className="btn-secondary flex items-center gap-2"
        >
          <Landmark size={18} /> Nova Entidade
        </button>
      </div>

      {/* Entidades */}
      <h2 className="text-lg font-semibold text-textMain mb-3">Entidades</h2>
      {entities.length === 0 ? (
        <div className="card text-center text-textMuted mb-8">
          Nenhuma entidade cadastrada ainda. Crie a primeira para começar.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {entities.map((ent) => (
            <div key={ent.id} className="card">
              <p className="text-textMuted text-sm">{ent.name}</p>
              <p
                className={`text-2xl font-bold mt-1 ${
                  Number(ent.current_balance) >= 0
                    ? "text-textMain"
                    : "text-red-400"
                }`}
              >
                {Number(ent.current_balance).toLocaleString("pt-PT", {
                  style: "currency",
                  currency: "EUR",
                })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Gráficos */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="font-semibold text-textMain mb-2">
            Saldo por Entidade
          </h3>
          <BalanceByEntityChart entities={entities} />
        </div>
        <div className="card">
          <h3 className="font-semibold text-textMain mb-2">
            Entradas vs Saídas (mês atual)
          </h3>
          <IncomeExpenseChart transactions={transactions} />
        </div>
      </div>

      {/* Lista de transações */}
      <h2 className="text-lg font-semibold text-textMain mb-3">
        Histórico de Transações
      </h2>
      <div className="card p-0 overflow-hidden">
        {transactions.length === 0 ? (
          <p className="text-textMuted text-center py-8">
            Nenhuma transação registrada ainda.
          </p>
        ) : (
          <ul className="divide-y divide-surfaceAlt">
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {tx.type === "entrada" ? (
                    <ArrowUpCircle
                      className="text-primary shrink-0"
                      size={22}
                    />
                  ) : (
                    <ArrowDownCircle
                      className="text-textMuted shrink-0"
                      size={22}
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-textMain font-medium truncate">
                      {tx.description || tx.category}
                    </p>
                    <p className="text-textMuted text-xs truncate">
                      {tx.entities?.name ?? "—"} • {tx.category} •{" "}
                      {new Date(tx.transaction_date).toLocaleDateString(
                        "pt-PT"
                      )}
                    </p>
                  </div>
                </div>
                <p
                  className={`font-semibold shrink-0 ml-3 ${
                    tx.type === "entrada" ? "text-primary" : "text-textMuted"
                  }`}
                >
                  {tx.type === "entrada" ? "+" : "-"}
                  {Number(tx.amount).toLocaleString("pt-PT", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showEntityModal && (
        <Modal title="Nova Entidade" onClose={() => setShowEntityModal(false)}>
          <EntityForm
            onDone={() => {
              setShowEntityModal(false);
              loadData();
            }}
          />
        </Modal>
      )}

      {showTxModal && (
        <Modal title="Nova Transação" onClose={() => setShowTxModal(false)}>
          <TransactionForm
            entities={entities}
            onDone={() => {
              setShowTxModal(false);
              loadData();
            }}
          />
        </Modal>
      )}
    </div>
  );
}

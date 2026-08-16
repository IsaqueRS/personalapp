"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from "recharts";
import type { Entity, Transaction } from "@/lib/types";

const PIE_COLORS = ["#FF7F11", "#FFA552", "#FFC98B", "#A3A3A3", "#7A7A7A", "#4D4D4D"];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1C1C1C] border border-surfaceAlt rounded-lg px-3 py-2 text-sm shadow-xl">
      {label && <p className="text-textMuted mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill }} className="font-semibold">
          {p.name}:{" "}
          {Number(p.value).toLocaleString("pt-PT", {
            style: "currency",
            currency: "EUR",
          })}
        </p>
      ))}
    </div>
  );
}

export function BalanceByEntityChart({ entities }: { entities: Entity[] }) {
  const data = entities.map((e) => ({
    name: e.name,
    value: Number(e.current_balance),
  }));

  if (data.length === 0) {
    return (
      <p className="text-textMuted text-sm text-center py-10">
        Cadastre uma entidade para ver o gráfico.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          paddingAngle={2}
        >
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={PIE_COLORS[index % PIE_COLORS.length]}
              stroke="#1C1C1C"
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ color: "#A3A3A3", fontSize: 13 }}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function IncomeExpenseChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const now = new Date();
  const monthTx = transactions.filter((t) => {
    const d = new Date(t.transaction_date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });

  const entradas = monthTx
    .filter((t) => t.type === "entrada")
    .reduce((s, t) => s + Number(t.amount), 0);
  const saidas = monthTx
    .filter((t) => t.type === "saida")
    .reduce((s, t) => s + Number(t.amount), 0);

  const data = [
    { name: "Entradas", value: entradas, fill: "#FF7F11" },
    { name: "Saídas", value: saidas, fill: "#4D4D4D" },
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barSize={60}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />
        <XAxis dataKey="name" stroke="#A3A3A3" fontSize={13} />
        <YAxis stroke="#A3A3A3" fontSize={12} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#33333350" }} />
        <Bar dataKey="value" radius={[8, 8, 0, 0]} name="Valor">
          {data.map((d, i) => (
            <Cell key={i} fill={d.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

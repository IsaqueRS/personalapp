export type Entity = {
  id: string;
  user_id: string;
  name: string;
  initial_balance: number;
  current_balance: number;
  created_at: string;
};

export type TransactionType = "entrada" | "saida";

export type Transaction = {
  id: string;
  user_id: string;
  entity_id: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string | null;
  transaction_date: string;
  created_at: string;
  entities?: { name: string } | null;
};

export type WorkItemType = "todo" | "project" | "idea";
export type Priority = "alta" | "media" | "baixa";

export type WorkItem = {
  id: string;
  user_id: string;
  type: WorkItemType;
  title: string;
  content: string | null;
  is_completed: boolean;
  priority: Priority | null;
  due_date: string | null;
  progress: number | null;
  created_at: string;
};

export const CATEGORIES = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Lazer",
  "Salário",
  "Investimentos",
  "Compras",
  "Educação",
  "Outros",
];

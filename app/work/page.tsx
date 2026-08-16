"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import type { WorkItem, Priority } from "@/lib/types";
import Modal from "@/components/Modal";
import {
  ArrowLeft,
  Briefcase,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Loader2,
  ListTodo,
  FolderKanban,
  Lightbulb,
} from "lucide-react";

type Tab = "todo" | "project" | "idea";

const PRIORITY_COLORS: Record<Priority, string> = {
  alta: "text-red-400 bg-red-950/40 border-red-900",
  media: "text-primary bg-primary/10 border-primary/30",
  baixa: "text-textMuted bg-surfaceAlt border-surfaceAlt",
};

export default function WorkPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("todo");
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadData = useCallback(async () => {
    const { data } = await supabase
      .from("work_items")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data as WorkItem[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function toggleTodo(item: WorkItem) {
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, is_completed: !i.is_completed } : i
      )
    );
    await supabase
      .from("work_items")
      .update({ is_completed: !item.is_completed })
      .eq("id", item.id);
  }

  async function deleteItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await supabase.from("work_items").delete().eq("id", id);
  }

  async function updateProgress(item: WorkItem, progress: number) {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, progress } : i))
    );
    await supabase.from("work_items").update({ progress }).eq("id", item.id);
  }

  const todos = items
    .filter((i) => i.type === "todo")
    .sort((a, b) => Number(a.is_completed) - Number(b.is_completed));
  const projects = items.filter((i) => i.type === "project");
  const ideas = items.filter((i) => i.type === "idea");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-8 pb-24">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/"
          className="text-textMuted hover:text-primary transition-colors"
        >
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-2xl font-bold text-textMain flex items-center gap-2">
          <Briefcase className="text-primary" size={24} /> Work
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface border border-surfaceAlt rounded-xl p-1 mb-6">
        <TabButton
          active={tab === "todo"}
          onClick={() => setTab("todo")}
          icon={<ListTodo size={16} />}
          label="To-Do"
        />
        <TabButton
          active={tab === "project"}
          onClick={() => setTab("project")}
          icon={<FolderKanban size={16} />}
          label="Projetos"
        />
        <TabButton
          active={tab === "idea"}
          onClick={() => setTab("idea")}
          icon={<Lightbulb size={16} />}
          label="Ideias"
        />
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="btn-primary flex items-center gap-2 mb-6"
      >
        <Plus size={18} />
        {tab === "todo" && "Nova Tarefa"}
        {tab === "project" && "Novo Projeto"}
        {tab === "idea" && "Nova Ideia"}
      </button>

      {/* TO-DO */}
      {tab === "todo" && (
        <div className="card p-0 overflow-hidden">
          {todos.length === 0 ? (
            <p className="text-textMuted text-center py-8">
              Nenhuma tarefa cadastrada.
            </p>
          ) : (
            <ul className="divide-y divide-surfaceAlt">
              {todos.map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-5 py-3.5">
                  <button onClick={() => toggleTodo(t)} className="shrink-0">
                    {t.is_completed ? (
                      <CheckCircle2 className="text-primary" size={22} />
                    ) : (
                      <Circle className="text-textMuted" size={22} />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-medium truncate ${
                        t.is_completed
                          ? "text-textMuted line-through"
                          : "text-textMain"
                      }`}
                    >
                      {t.title}
                    </p>
                    {t.due_date && (
                      <p className="text-textMuted text-xs">
                        Prazo:{" "}
                        {new Date(t.due_date).toLocaleDateString("pt-PT")}
                      </p>
                    )}
                  </div>
                  {t.priority && (
                    <span
                      className={`text-xs font-medium border rounded-full px-2.5 py-1 shrink-0 ${
                        PRIORITY_COLORS[t.priority]
                      }`}
                    >
                      {t.priority}
                    </span>
                  )}
                  <button
                    onClick={() => deleteItem(t.id)}
                    className="text-textMuted hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 size={17} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* PROJETOS */}
      {tab === "project" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {projects.length === 0 ? (
            <p className="text-textMuted text-center py-8 col-span-2">
              Nenhum projeto cadastrado.
            </p>
          ) : (
            projects.map((p) => (
              <div key={p.id} className="card">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-textMain">{p.title}</h3>
                  <button
                    onClick={() => deleteItem(p.id)}
                    className="text-textMuted hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {p.content && (
                  <p className="text-textMuted text-sm mt-1">{p.content}</p>
                )}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-textMuted mb-1.5">
                    <span>Progresso</span>
                    <span>{p.progress ?? 0}%</span>
                  </div>
                  <div className="w-full bg-surfaceAlt rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${p.progress ?? 0}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={p.progress ?? 0}
                    onChange={(e) =>
                      updateProgress(p, Number(e.target.value))
                    }
                    className="w-full mt-2 accent-primary"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* IDEIAS */}
      {tab === "idea" && (
        <div className="grid sm:grid-cols-2 gap-4">
          {ideas.length === 0 ? (
            <p className="text-textMuted text-center py-8 col-span-2">
              Nenhuma ideia registrada ainda.
            </p>
          ) : (
            ideas.map((idea) => (
              <div key={idea.id} className="card bg-surfaceAlt/40">
                <div className="flex items-start justify-between">
                  <Lightbulb className="text-primary shrink-0" size={18} />
                  <button
                    onClick={() => deleteItem(idea.id)}
                    className="text-textMuted hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="font-semibold text-textMain mt-2">
                  {idea.title}
                </h3>
                {idea.content && (
                  <p className="text-textMuted text-sm mt-1 whitespace-pre-wrap">
                    {idea.content}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <Modal
          title={
            tab === "todo"
              ? "Nova Tarefa"
              : tab === "project"
              ? "Novo Projeto"
              : "Nova Ideia"
          }
          onClose={() => setShowModal(false)}
        >
          <WorkItemForm
            type={tab}
            onDone={() => {
              setShowModal(false);
              loadData();
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
        active ? "bg-primary text-white" : "text-textMuted"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function WorkItemForm({
  type,
  onDone,
}: {
  type: Tab;
  onDone: () => void;
}) {
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<Priority>("media");
  const [dueDate, setDueDate] = useState("");
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

    const payload: Record<string, unknown> = {
      user_id: user.id,
      type,
      title: title.trim(),
      content: content.trim() || null,
    };

    if (type === "todo") {
      payload.priority = priority;
      payload.due_date = dueDate || null;
      payload.is_completed = false;
    }
    if (type === "project") {
      payload.progress = 0;
    }

    const { error } = await supabase.from("work_items").insert(payload);
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
        <label className="label-field">
          {type === "idea" ? "Título da ideia" : "Título"}
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
          placeholder={
            type === "todo"
              ? "Ex: Enviar relatório mensal"
              : type === "project"
              ? "Ex: Reformular site pessoal"
              : "Ex: App de hábitos"
          }
        />
      </div>

      {type !== "todo" && (
        <div>
          <label className="label-field">
            {type === "project" ? "Descrição" : "Anotação"}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-field min-h-[100px] resize-none"
            placeholder="Escreva os detalhes..."
          />
        </div>
      )}

      {type === "todo" && (
        <>
          <div>
            <label className="label-field">Prioridade</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="input-field"
            >
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
          <div>
            <label className="label-field">Data limite</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-field"
            />
          </div>
        </>
      )}

      {error && (
        <p className="text-red-400 text-sm bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}

-- =========================================================
-- ORGANIZADOR PESSOAL & FINANCEIRO — SCRIPT DE BANCO SUPABASE
-- Execute este script inteiro no SQL Editor do seu projeto Supabase
-- =========================================================

-- Extensão para geração de UUID
create extension if not exists "pgcrypto";

-- =========================================================
-- 1. TABELA: profiles
-- Perfil público vinculado a auth.users
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Usuários podem ver o próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuários podem atualizar o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Usuários podem inserir o próprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Cria automaticamente um profile ao registrar um novo usuário
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- =========================================================
-- 2. TABELA: entities (Bancos / Carteiras)
-- =========================================================
create table if not exists public.entities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  initial_balance numeric(14,2) not null default 0,
  current_balance numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_entities_user_id on public.entities(user_id);

alter table public.entities enable row level security;

create policy "Usuários gerenciam suas próprias entidades"
  on public.entities for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- =========================================================
-- 3. TABELA: transactions
-- =========================================================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_id uuid not null references public.entities(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  type text not null check (type in ('entrada', 'saida')),
  category text not null default 'Outros',
  description text,
  transaction_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_entity_id on public.transactions(entity_id);
create index if not exists idx_transactions_date on public.transactions(transaction_date desc);

alter table public.transactions enable row level security;

create policy "Usuários gerenciam suas próprias transações"
  on public.transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- =========================================================
-- 4. TABELA: work_items (To-Do, Projetos, Ideias)
-- =========================================================
create table if not exists public.work_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('todo', 'project', 'idea')),
  title text not null,
  content text,
  is_completed boolean not null default false,
  priority text check (priority in ('alta', 'media', 'baixa')),
  due_date date,
  progress int check (progress between 0 and 100),
  created_at timestamptz not null default now()
);

create index if not exists idx_work_items_user_id on public.work_items(user_id);
create index if not exists idx_work_items_type on public.work_items(type);

alter table public.work_items enable row level security;

create policy "Usuários gerenciam seus próprios itens de trabalho"
  on public.work_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- =========================================================
-- 5. FUNÇÕES RPC — Regra de negócio financeira atômica
-- =========================================================

-- 5.1 Registrar transação e atualizar saldo da entidade
create or replace function public.register_transaction(
  p_entity_id uuid,
  p_amount numeric,
  p_type text,
  p_category text,
  p_description text,
  p_transaction_date date
)
returns public.transactions
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_owns_entity boolean;
  v_transaction public.transactions;
  v_delta numeric;
begin
  if v_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  if p_type not in ('entrada', 'saida') then
    raise exception 'Tipo de transação inválido';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Valor da transação deve ser maior que zero';
  end if;

  -- Garante que a entidade pertence ao usuário autenticado
  select exists(
    select 1 from public.entities
    where id = p_entity_id and user_id = v_user_id
  ) into v_owns_entity;

  if not v_owns_entity then
    raise exception 'Entidade não encontrada ou não pertence ao usuário';
  end if;

  -- Insere a transação
  insert into public.transactions (
    user_id, entity_id, amount, type, category, description, transaction_date
  ) values (
    v_user_id, p_entity_id, p_amount, p_type, coalesce(p_category, 'Outros'),
    p_description, coalesce(p_transaction_date, current_date)
  )
  returning * into v_transaction;

  -- Calcula o delta de saldo (entrada soma, saída subtrai)
  v_delta := case when p_type = 'entrada' then p_amount else -p_amount end;

  update public.entities
  set current_balance = current_balance + v_delta
  where id = p_entity_id and user_id = v_user_id;

  return v_transaction;
end;
$$;

grant execute on function public.register_transaction(uuid, numeric, text, text, text, date) to authenticated;


-- 5.2 Excluir transação e estornar o saldo da entidade
create or replace function public.delete_transaction(p_transaction_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_tx public.transactions;
  v_delta numeric;
begin
  if v_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  select * into v_tx
  from public.transactions
  where id = p_transaction_id and user_id = v_user_id;

  if not found then
    raise exception 'Transação não encontrada';
  end if;

  -- Estorna o efeito da transação no saldo
  v_delta := case when v_tx.type = 'entrada' then -v_tx.amount else v_tx.amount end;

  update public.entities
  set current_balance = current_balance + v_delta
  where id = v_tx.entity_id and user_id = v_user_id;

  delete from public.transactions where id = p_transaction_id;
end;
$$;

grant execute on function public.delete_transaction(uuid) to authenticated;

-- =========================================================
-- FIM DO SCRIPT
-- =========================================================

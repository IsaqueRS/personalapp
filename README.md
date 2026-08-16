# Organizador Pessoal & Financeiro

Web App em Next.js 14 (App Router) + Tailwind + Supabase para gerenciar finanças
pessoais (múltiplas contas/bancos) e produtividade (tarefas, projetos, ideias).

## 1. Configurar o Supabase

1. Crie um projeto em https://supabase.com.
2. Abra **SQL Editor** e execute todo o conteúdo do arquivo `supabase.sql`
   (cria as tabelas `profiles`, `entities`, `transactions`, `work_items`,
   as políticas de RLS e as funções RPC `register_transaction` /
   `delete_transaction`).
3. Em **Project Settings > API**, copie a `Project URL` e a `anon public key`.
4. (Opcional) Em **Authentication > Providers > Email**, desative "Confirm email"
   durante o desenvolvimento para testar login mais rápido.

## 2. Configurar o projeto localmente

```bash
cp .env.local.example .env.local
# edite .env.local e cole a URL e a anon key do seu projeto Supabase
```

## 3. Instalar dependências e rodar

```bash
npm install
npm run dev
```

Acesse http://localhost:3000 — você será redirecionado para `/login`.
Crie uma conta, faça login e comece a usar.

## 4. Estrutura do projeto

```
app/
  layout.tsx            -> layout raiz (dark theme fixo)
  page.tsx               -> Hub / Dashboard (protegido)
  login/page.tsx          -> Login e Cadastro
  finances/page.tsx       -> Módulo Finances completo
  work/page.tsx            -> Módulo Work (To-Do / Projetos / Ideias)
components/
  LogoutButton.tsx
  Modal.tsx
  EntityForm.tsx
  TransactionForm.tsx
  FinanceCharts.tsx        -> gráficos Recharts
lib/
  types.ts                 -> tipos TypeScript compartilhados
utils/supabase/
  client.ts                -> client Supabase (browser)
  server.ts                -> client Supabase (Server Components)
  middleware.ts             -> refresh de sessão + proteção de rotas
middleware.ts               -> aplica a proteção em todas as rotas
supabase.sql                -> script completo do banco (tabelas + RLS + RPC)
```

## 5. Sessão persistente e rotas protegidas

A sessão é gerenciada via cookies HTTP-only pelo `@supabase/ssr`, refrescada
a cada request pelo `middleware.ts`. Isso garante que o usuário permaneça
logado entre recarregamentos e fechamentos do navegador, até clicar em
"Sair" ou limpar os cookies/cache. Qualquer rota fora de `/login` exige
usuário autenticado — caso contrário, é redirecionado automaticamente.

## 6. Regra de negócio financeira

Toda transação é criada através da função de banco `register_transaction`,
que insere o registro em `transactions` **e** atualiza `current_balance` da
entidade correspondente na mesma operação atômica (com verificação de que a
entidade pertence ao usuário autenticado). Isso garante consistência mesmo
com múltiplos lançamentos simultâneos.

## 7. Paleta de cores (fixa, dark theme)

| Uso                  | Cor       |
|-----------------------|-----------|
| Fundo principal        | `#262626` |
| Cards/Superfícies       | `#1C1C1C` / `#333333` |
| Destaque / Primária      | `#FF7F11` |
| Texto principal          | `#FFFFFF` |
| Texto secundário          | `#A3A3A3` |

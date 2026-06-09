# formdepesquisa

Aplicacao React para capturar um formulario de sessao gratuita e persistir os dados no Supabase.

## Como rodar

```bash
npm install
npm run dev
```

## Configurar Supabase

1. Crie um projeto no Supabase.
2. Execute o SQL em `supabase/schema.sql` no SQL Editor do Supabase.
3. Crie um arquivo `.env.local` baseado no `.env.example`.
4. Preencha:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_sua_chave_publica
VITE_SUPABASE_FORM_TABLE=form_submissions
```

A tabela fica com Row Level Security ativa e uma policy permitindo apenas inserts anonimos.

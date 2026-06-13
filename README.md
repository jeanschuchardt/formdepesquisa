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

## Configurar agendamento

O agendamento usa a Google Calendar API para consultar disponibilidade e criar eventos com Google
Meet. Preencha tambem:

```bash
GOOGLE_CLIENT_ID=seu_client_id_google
GOOGLE_CLIENT_SECRET=seu_client_secret_google
GOOGLE_REFRESH_TOKEN=seu_refresh_token_google
GOOGLE_CALENDAR_ID=primary
GOOGLE_CALENDAR_TIME_ZONE=America/Sao_Paulo
GOOGLE_WORK_START=09:00
GOOGLE_WORK_END=18:00
GOOGLE_SLOT_MINUTES=30
GOOGLE_DAYS_AHEAD=14
```

A pagina direta de agendamento fica em `/agendamento`. Depois que o formulario principal for
enviado, a pessoa tambem pode escolher um horario usando a mesma agenda.

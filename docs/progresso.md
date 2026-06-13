# Progresso do projeto

## Estado atual

- Aplicacao React criada com Vite.
- Formulario principal implementado em `src/App.jsx`.
- Persistencia dos dados configurada para Supabase via `src/lib/supabase.js`.
- Schema inicial do Supabase registrado em `supabase/schema.sql`.
- Fluxo apos envio alterado para mostrar um painel de agendamento.
- Pagina direta de agendamento criada em `/agendamento`.
- UI do agendamento direto refinada com fluxo guiado, resumo lateral, estados de carregamento e confirmacao visual.
- APIs serverless criadas em `api/` para consultar disponibilidade e criar eventos no Google Calendar.
- Vite configurado para executar as rotas `/api/availability` e `/api/book` tambem em desenvolvimento local.
- Arquivo `.env.local` criado com placeholders locais. Ele esta ignorado pelo Git.

## Alteracoes locais ainda nao commitadas

- `.env.example`
- `README.md`
- `src/App.jsx`
- `src/styles.css`
- `api/`
- `docs/`

## Agendamento

O projeto esta seguindo a abordagem de integracao direta com Google Calendar.

Arquivos envolvidos:

- `api/googleCalendar.js`: autenticacao OAuth, configuracoes e chamadas ao Google Calendar.
- `api/availability.js`: retorna horarios disponiveis para uma data.
- `api/book.js`: cria evento no Calendar com Google Meet.
- `src/App.jsx`: mostra o painel de horarios apos o envio do formulario.
- `/agendamento`: permite agendar diretamente informando nome, e-mail e WhatsApp.
- `vite.config.js`: executa as funcoes de `api/` localmente durante `npm run dev`.

Variaveis necessarias no ambiente:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_CALENDAR_ID`
- `GOOGLE_CALENDAR_TIME_ZONE`
- `GOOGLE_WORK_START`
- `GOOGLE_WORK_END`
- `GOOGLE_SLOT_MINUTES`
- `GOOGLE_DAYS_AHEAD`

## Validacao feita

- `npm run build` executado com sucesso.
- Credenciais do Google Calendar validadas com sucesso.
- Chamada FreeBusy do Google Calendar validada com sucesso.
- `/api/availability` validado localmente via Vite, retornando JSON.
- Build validado apos refinamento da UI de agendamento.

## Pendencias

- Completar credenciais reais do Supabase no `.env.local`.
- Atualizar `README.md` e `.env.example` para remover a referencia antiga a `VITE_SCHEDULING_URL`.
- Documentar como gerar o `GOOGLE_REFRESH_TOKEN`.
- Testar o fluxo real:
  - envio do formulario;
  - carregamento de horarios disponiveis;
  - criacao do evento no Google Calendar;
  - geracao do link do Google Meet;
  - recebimento do convite por e-mail.
- Testar a pagina direta `/agendamento`.
- Confirmar ambiente de deploy, provavelmente Vercel por causa da estrutura `api/`.
- Fazer commit quando o fluxo estiver validado.

## Proximos passos sugeridos

1. Completar as credenciais no `.env.local`.
2. Corrigir documentacao publica do projeto.
3. Rodar o app localmente e testar o fluxo completo.
4. Ajustar problemas encontrados no teste.
5. Commitar a versao validada.

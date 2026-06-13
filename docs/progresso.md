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
- Commit `14a9d95` criado com a feature basica de agendamento.
- Tag `v1-agendamento-feature-basica` criada e enviada para o remoto.

## Alteracoes locais ainda nao commitadas atuais

- `.gitignore`: adicionado para ignorar `print/` e `docs/.obsidian/`.

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
- Fluxo de agendamento direto testado localmente e aprovado em uso inicial.
- Fluxo completo local validado com sucesso: formulario, Supabase, proxima etapa e agendamento.
- Branch `main` e tag `v1-agendamento-feature-basica` enviadas para o GitHub.
- Deploy na Vercel realizado com sucesso.
- Fluxo em producao validado com sucesso.

## Pendencias

Nenhuma pendencia tecnica aberta para a versao atual validada em producao.

## Evolucao discutida

O produto comecou como um formulario de acolhimento com agendamento, mas a direcao desejada e
evoluir para uma plataforma de workflows para terapeutas.

Decisoes e hipoteses atuais:

- O primeiro uso real sera para um terapeuta especifico, nao para multiusuario imediato.
- A arquitetura deve evitar travar a evolucao para SaaS multiusuario.
- Por enquanto, a configuracao pode ser feita manualmente pelo operador no banco ou ambiente.
- No futuro, o terapeuta deve ter independencia para configurar disponibilidade, tipos de
  atendimento e links.
- O preenchimento do formulario deve acontecer antes da escolha de horario no fluxo inicial.
- Links diferentes podem ter formularios diferentes ou workflows diferentes no futuro.
- A ideia de modulos plugaveis faz sentido: formulario, agendamento, pagamento, pagina e acoes.
- Pagamento deve ser considerado futuramente para alguns tipos de atendimento.
- O diferencial do produto tende a ser a composicao de jornadas/workflows, nao apenas agenda.
- Formularios dinamicos foram aprovados como direcao: perguntas configuradas manualmente no banco,
  sem tela admin inicialmente, e renderizadas dinamicamente no frontend.
- Tabelas de formularios dinamicos foram criadas no Supabase.
- Frontend foi adaptado para carregar `forms` e `form_questions` e salvar em
  `dynamic_form_submissions`.
- Fluxo com formulario dinamico validado localmente com salvamento bem-sucedido no Supabase.

## Proximos passos sugeridos

1. Entrar no Ciclo 2A: ajustes finais de UX publica e confiabilidade.
2. Melhorar a confirmacao final mostrando data, horario e e-mail usado.
3. Adicionar opcao de agendar outro horario.
4. Melhorar mensagens de erro e estados sem horarios.
5. Aplicar limite de datas futuras usando `GOOGLE_DAYS_AHEAD`.
6. Depois iniciar modularizacao tecnica de formulario, agendamento e paginas.
7. Depois mover configuracoes de agenda para dados persistidos, com foco inicial em um terapeuta.

## Marco atual

`v1-agendamento-producao` esta concluida.

O produto ja tem uma primeira versao funcional, publicada e validada:

- formulario base funcionando;
- persistencia no Supabase;
- integracao com Google Calendar;
- criacao de evento com Google Meet;
- pagina direta `/agendamento`;
- fluxo formulario -> agendamento;
- deploy na Vercel;
- validacao local e em producao;
- documentacao base criada.

## Proxima evolucao recomendada

Entrar no Ciclo 2: UX publica e confiabilidade.

Escopo sugerido para o Ciclo 2A:

- Mostrar data e horario escolhidos na confirmacao final.
- Mostrar e-mail usado no agendamento.
- Adicionar botao para agendar outro horario.
- Melhorar mensagem quando nao houver horarios disponiveis.
- Melhorar mensagens de erro do Google Calendar.
- Validar e-mail antes de tentar confirmar agendamento.
- Limitar navegacao futura do calendario usando `GOOGLE_DAYS_AHEAD`.

Depois do Ciclo 2A:

1. Modularizar o codigo.
2. Separar formulario, agendamento, paginas e utilitarios.
3. Criar configuracao por terapeuta no banco.
4. Criar tipos de atendimento e links diferentes.
5. Evoluir para workflows configuraveis.

# Status do projeto

## Resumo executivo

O projeto ja possui uma primeira versao em producao com formulario, agendamento e integracao com
Google Calendar. A evolucao mais recente refinou a UX publica: formulario guiado, agendamento mais
limpo, confirmacao em modal e tela final de sucesso com resumo do agendamento.

## Estado atual

```text
Versao atual: v1-ux-fluxo-agendamento
Ambiente: producao validada anteriormente na Vercel; novo marco pendente de push/deploy
Formulario: dinamico, carregado de forms/form_questions
Agendamento: Google Calendar + Google Meet
Persistencia: Supabase
```

## Marcos concluidos

| Marco | Status | Tag/commit |
| --- | --- | --- |
| Formulario inicial fixo | Concluido | - |
| Supabase configurado | Concluido | - |
| Google Calendar configurado | Concluido | - |
| Pagina direta de agendamento | Concluido | `v1-agendamento-feature-basica` |
| Deploy em producao | Concluido | `v1-agendamento-producao` |
| Fluxo completo em producao | Concluido | `v1-agendamento-producao` |
| Roadmap de produto | Concluido | `0a9d429` |
| Formularios dinamicos no banco | Concluido | `v1-formularios-dinamicos` |
| UX guiada e confirmacao de agendamento | Concluido localmente | `v1-ux-fluxo-agendamento` |

## Tabela visual de progresso

Legenda:

```text
[x] concluido
[~] em andamento
[ ] pendente
```

| Fase | Entrega | Status | Evidencia | Proximo passo | Comentarios |
| --- | --- | --- | --- | --- | --- |
| Base | Projeto React/Vite | [x] | App rodando e build passando | Manter | Base tecnica estavel. |
| Base | Supabase configurado | [x] | URL, anon key e tabela validadas | Manter | Usado para formularios e configuracoes futuras. |
| Base | Google Calendar configurado | [x] | Access token e FreeBusy validados | Manter | Hoje usa uma conta/token fixo. |
| Base | Deploy na Vercel | [x] | Producao validada | Revalidar apos novas features | Revalidar sempre que mudar env ou schema. |
| Agendamento | Pagina `/agendamento` | [x] | Link direto funcionando | Melhorar UX | Pode virar link por tipo de atendimento. |
| Agendamento | Consulta de disponibilidade | [x] | `/api/availability` validado | Limitar dias futuros | Ainda baseada em regras de env. |
| Agendamento | Criacao de evento | [x] | Evento + Meet criados | Melhorar confirmacao | Confirmacao pode mostrar mais detalhes. |
| Agendamento | Fluxo formulario -> agenda | [x] | Testado local e producao | Revalidar apos deploy do novo UX | Principal fluxo de conversao. |
| Agendamento | Modal de revisao antes de confirmar | [x] | Fluxos direto e pos-formulario atualizados | Validar em producao | Reduz envio acidental. |
| Agendamento | Tela final com resumo | [x] | Mostra data, horario, formato e links | Adicionar agendar outro horario | Melhora clareza do pos-submit. |
| Formularios | Formulario fixo inicial | [x] | Primeira versao entregue | Substituido por dinamico | Mantido como marco historico. |
| Formularios | Tabelas dinamicas | [x] | `forms`, `form_questions`, `dynamic_form_submissions` criadas | Manter schema | Primeira base para workflows. |
| Formularios | Perguntas vindas do banco | [x] | Frontend renderiza `form_questions` | Validar producao | Permite iterar sem deploy. |
| Formularios | Salvamento em JSONB | [x] | `dynamic_form_submissions.answers` validado localmente | Validar producao | Flexivel agora, relatorios avancados depois. |
| Formularios | Conversa guiada no formulario | [x] | Uma pergunta por etapa, Enter avanca com foco | Refinar microcopy | Base de experiencia acolhedora. |
| Formularios | Guia para criar perguntas | [x] | `docs/formularios-dinamicos.md` | Usar no piloto | Usar como operacao manual inicial. |
| Documentacao | Progresso e roadmap | [x] | `docs/progresso.md` e `docs/roadmap.md` | Atualizar por marco | Atualizar ao fim de cada marco. |
| Documentacao | Guia Google Calendar | [x] | `docs/google-calendar.md` | Manter | Importante para reproduzir OAuth. |
| Documentacao | Visao executiva de status | [x] | `docs/status.md` atualizado | Atualizar por marco | Este arquivo vira painel de retomada. |
| Produto | UX publica refinada | [x] | Formulario guiado, calendario, modal e sucesso prontos | Validar em producao | Boa o suficiente para piloto. |
| Produto | Confirmacao final completa | [x] | Mostra data/hora/e-mail e links finais | Adicionar agendar outro horario | Melhoria curta concluida. |
| Produto | Botao agendar outro horario | [ ] | Ainda nao existe | Implementar |baixa prioridade  |
| Produto | Limite de datas futuras | [ ] | `GOOGLE_DAYS_AHEAD` ainda nao aplicado na UI/API | Implementar | Evita agendamentos longe demais. |
| Arquitetura | Modularizacao do frontend | [ ] | `App.jsx` ainda concentra muita coisa | Separar modulos | prioridade  |
| Configuracao | Tipos de atendimento | [ ] | Ainda nao existe `appointment_types` | Planejar apos modularizacao | Base para links diferentes. |
| Configuracao | Disponibilidade no banco | [ ] | Horarios ainda via env | Planejar | Remove dependencia de env. |
| Admin | Area do terapeuta | [ ] | Ainda nao existe login/admin | Futuro | So depois de validar config manual. |
| SaaS | Multiusuario e planos | [ ] | Ainda nao iniciado | Futuro | Objetivo futuro, nao imediato. |

## Funcionalidades prontas

- Formulario publico de acolhimento.
- Salvamento de respostas no Supabase.
- Perguntas carregadas dinamicamente do banco.
- Configuracao manual de perguntas via Supabase.
- Formulario guiado em etapas.
- Pagina direta `/agendamento`.
- Consulta de disponibilidade no Google Calendar.
- Criacao de evento no Google Calendar.
- Geracao de link Google Meet.
- Convite por e-mail.
- Modal de revisao antes de confirmar agendamento.
- Tela final de sucesso com resumo.
- Deploy na Vercel.

## Documentacao criada

- `docs/progresso.md`: historico e decisoes do projeto.
- `docs/roadmap.md`: roadmap de evolucao por ciclos.
- `docs/google-calendar.md`: configuracao OAuth e refresh token.
- `docs/formularios-dinamicos.md`: operacao manual de formularios dinamicos.
- `docs/frontend-ux-conceitos.md`: conceitos de frontend, React e UX usados nas proximas decisoes.
- `supabase/dynamic_forms.sql`: schema inicial dos formularios dinamicos.

## Decisoes importantes

- Comecar com um terapeuta real antes de evoluir para multiusuario.
- Manter configuracao manual no Supabase antes de criar area admin.
- Renderizar formularios a partir do banco.
- Salvar respostas dinamicas em JSONB.
- Nao criar editor de perguntas agora.
- Evoluir em ciclos pequenos e validaveis.

## Pendencias imediatas

| Item | Prioridade | Observacao |
| --- | --- | --- |
| Fazer push da tag `v1-ux-fluxo-agendamento` | Alta | Marco atual esta sendo fechado localmente. |
| Deploy/validacao em producao do novo UX | Alta | Testar formulario guiado, modal e sucesso final. |
| Testar formulario -> agendamento em producao | Alta | Garantir que o modal de revisao funciona no fluxo principal. |
| Atualizar status apos validacao | Media | Registrar nos docs se producao passou. |

## Proximo ciclo recomendado

### Ciclo 2A: UX publica e confiabilidade

Objetivo: melhorar a experiencia publica sem adicionar complexidade estrutural.

Escopo sugerido:

- Mostrar data e horario escolhidos na confirmacao final.
- Mostrar e-mail usado no agendamento.
- Adicionar botao para agendar outro horario.
- Melhorar mensagem quando nao houver horarios.
- Melhorar mensagens de erro do Google Calendar.
- Validar e-mail antes de confirmar agendamento.
- Limitar navegacao futura usando `GOOGLE_DAYS_AHEAD`.

## Depois do Ciclo 2A

1. Modularizar o codigo.
2. Separar formulario, agendamento, paginas e utilitarios.
3. Criar configuracao por terapeuta no banco.
4. Criar tipos de atendimento e links diferentes.
5. Evoluir para workflows configuraveis.

## Tags de referencia

```text
v1-agendamento-feature-basica
v1-agendamento-producao
v1-formularios-dinamicos
v1-ux-fluxo-agendamento
```

## Como retomar o projeto

1. Ler este arquivo.
2. Conferir `docs/progresso.md`.
3. Conferir `docs/roadmap.md`.
4. Rodar `npm run build`.
5. Testar localmente `/` e `/agendamento`.
6. Confirmar deploy na Vercel.

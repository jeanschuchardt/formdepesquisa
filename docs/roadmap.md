# Roadmap de evolucao

## Direcao do produto

O produto deve evoluir de um formulario com agendamento para uma plataforma de jornadas para
terapeutas. A agenda e uma parte importante, mas o diferencial pretendido e permitir montar fluxos
como:

- formulario -> agendamento -> pagina de confirmacao;
- formulario -> pagamento -> agendamento;
- agendamento -> formulario -> acao;
- landing page -> formulario -> agendamento -> email;
- workflow customizado com passos em ordens diferentes.

A estrategia recomendada e construir primeiro para um terapeuta real, validando usabilidade e fluxo
em producao, mas com modelagem que possa evoluir para multiusuario.

## Principios de evolucao

- Evoluir em ciclos pequenos, sempre com uma versao usavel ao fim de cada ciclo.
- Validar com um terapeuta real antes de criar area admin completa.
- Comecar com configuracao manual no banco antes de construir telas de configuracao.
- Separar formulario, agendamento, pagamento e paginas como modulos independentes.
- Adiar multiusuario completo ate haver clareza sobre o fluxo principal e o valor do produto.
- Evitar granularidade prematura, como regras complexas de buffer por tipo, antes de validar o uso
  basico.

## Ciclo 1: Deploy e validacao real

Objetivo: colocar a versao atual no ar para testar com um terapeuta real.

Status: concluido em `v1-agendamento-producao`.

Escopo:

- Commitar `.gitignore` com `print/` e `docs/.obsidian/` ignorados.
- Configurar projeto na Vercel.
- Cadastrar variaveis de ambiente na Vercel.
- Confirmar que `/agendamento` abre em producao.
- Confirmar que `/api/availability` retorna horarios em producao.
- Confirmar que `/api/book` cria evento no Google Calendar.
- Completar credenciais do Supabase.
- Testar o fluxo formulario -> Supabase -> agendamento.

Resultado esperado:

- Um terapeuta real consegue compartilhar um link e receber agendamentos.

## Ciclo 2: UX publica e confiabilidade

Objetivo: deixar a experiencia publica mais clara e confiavel.

Status: proximo ciclo recomendado.

Escopo:

- Refinar responsividade do calendario e dos horarios.
- Mostrar data e horario escolhidos na tela de sucesso.
- Adicionar botao para agendar outro horario.
- Melhorar mensagens quando nao houver horarios disponiveis.
- Validar e-mail antes de confirmar agendamento.
- Tratar erros do Google Calendar com mensagens amigaveis.
- Usar `GOOGLE_DAYS_AHEAD` para limitar datas futuras.

Resultado esperado:

- O usuario final entende o fluxo sem orientacao externa.

Primeiro recorte sugerido:

- Confirmacao final com data, horario e e-mail.
- Botao para agendar outro horario.
- Mensagens melhores para estados vazios e erros.
- Validacao simples de e-mail.
- Limite de datas futuras usando `GOOGLE_DAYS_AHEAD`.

## Ciclo 3: Modularizacao tecnica

Objetivo: separar o codigo atual para preparar workflows futuros.

Escopo:

- Criar modulo de formulario.
- Criar modulo de agendamento.
- Criar paginas separadas para formulario e agendamento.
- Remover concentracao excessiva em `src/App.jsx`.
- Isolar chamadas de API/clientes em arquivos proprios.
- Preparar nomes e estruturas para futuros workflows.

Estrutura candidata:

```text
src/pages/
src/modules/forms/
src/modules/scheduling/
src/modules/workflows/
src/lib/
```

Resultado esperado:

- O produto continua igual para o usuario, mas o codigo fica pronto para crescer.

## Ciclo 4: Configuracao para um terapeuta

Objetivo: sair de configuracoes fixas em `.env` e passar para dados configuraveis.

Escopo:

- Criar tabela de terapeuta/configuracao no Supabase.
- Criar tabela de regras simples de disponibilidade.
- Criar tabela de tipos de atendimento.
- Manter configuracao manual pelo operador no banco.
- Permitir duracoes diferentes por tipo de atendimento.
- Criar links diferentes para tipos de atendimento.

Exemplos de links:

```text
/agendar/sessao-gratuita
/agendar/atendimento-30min
/agendar/atendimento-3h
```

Resultado esperado:

- Um terapeuta pode ter mais de um link de agendamento, configurado manualmente.

## Ciclo 5: Workflows simples

Objetivo: permitir sequencias diferentes de passos, ainda com configuracao controlada.

Escopo:

- Criar conceito de workflow.
- Criar passos de workflow.
- Suportar inicialmente `form` e `scheduling`.
- Permitir ordem configuravel.
- Associar um tipo de atendimento a um workflow.

Modelo inicial:

```text
workflows
workflow_steps
forms
appointment_types
```

Tipos de passo iniciais:

```text
form
scheduling
content_page
redirect
```

Resultado esperado:

- O mesmo produto suporta fluxos diferentes sem duplicar codigo.

## Ciclo 6: Area admin para o terapeuta

Objetivo: dar independencia operacional ao terapeuta.

Escopo:

- Login com Supabase Auth.
- Tela para editar dados basicos.
- Tela para editar tipos de atendimento.
- Tela para editar disponibilidade simples.
- Tela para copiar links publicos.
- Tela para visualizar agendamentos.

Resultado esperado:

- O terapeuta consegue operar o basico sem o desenvolvedor editar o banco.

## Ciclo 7: Google OAuth por terapeuta

Objetivo: permitir que cada terapeuta conecte a propria conta Google.

Escopo:

- Fluxo OAuth dentro do app.
- Salvar refresh token associado ao terapeuta.
- Listar calendarios disponiveis.
- Permitir escolher agenda principal ou agenda especifica.
- Renovar/remover conexao.

Decisao incremental:

- Agora: usar `primary` em ambiente.
- Depois: permitir `calendar_id` configurado manualmente.
- Futuro: terapeuta escolhe calendario na area admin.

Resultado esperado:

- O app passa a suportar varios terapeutas conectando seus calendarios.

## Ciclo 8: Pagamentos

Objetivo: permitir atendimentos pagos.

Escopo inicial:

- Pagamento manual ou link externo.
- Registro do status de pagamento no banco.

Escopo futuro:

- Integracao com Stripe, Mercado Pago ou outro provedor.
- Pagamento antes da confirmacao do evento.
- Reserva temporaria de horario com expiracao.
- Confirmacao automatica apos pagamento aprovado.

Fluxo candidato:

```text
formulario -> escolher horario -> pagamento -> criar evento
```

Resultado esperado:

- Alguns tipos de atendimento podem exigir pagamento antes da confirmacao.

## Ciclo 9: SaaS e planos

Objetivo: transformar o produto em plataforma multiusuario.

Escopo:

- Multiplos terapeutas.
- Organizacoes ou contas.
- Planos gratuito, basico, premium e pro.
- Limites por plano.
- Feature flags por plano.
- Billing recorrente.
- Onboarding self-service.

Exemplo de separacao por plano:

- Gratis: um link, agenda basica, marca do produto.
- Basico: multiplos tipos de atendimento.
- Premium: workflows customizados.
- Pro: pagamentos, automacoes, equipe e relatorios.

Resultado esperado:

- Produto pronto para venda como assinatura.

## Questoes em aberto

- Qual sera o primeiro terapeuta piloto e qual fluxo exato ele precisa?
- O primeiro deploy deve ser publico ou protegido por link/senha?
- Quais dois tipos de atendimento fazem sentido para o primeiro teste?
- Quais perguntas do formulario sao obrigatorias para o terapeuta piloto?
- Pagamento deve entrar antes ou depois da area admin?
- O produto sera vendido como agenda terapeutica ou como construtor de jornadas para terapeutas?

## Ramos possiveis de evolucao

Depois da validacao de `v1-agendamento-producao`, existem varios ramos de melhoria. Eles nao devem
ser feitos todos ao mesmo tempo; cada ramo atende um objetivo diferente.

### UX publica

Foco: melhorar a experiencia da pessoa que preenche o formulario e agenda.

Possibilidades:

- Confirmacao final com data, horario e e-mail.
- Botao para agendar outro horario.
- Mensagens melhores de erro.
- Calendario mostrando dias disponiveis com mais clareza.
- Bloqueio de finais de semana, se fizer sentido.
- Limite de datas futuras.
- Melhorias mobile.
- Pagina de obrigado personalizada.

Recomendacao: fazer agora, em recortes pequenos.

### Formularios dinamicos

Foco: sair de um formulario fixo no codigo e permitir selecionar perguntas.

Primeira versao pode ser configurada manualmente no banco, sem tela admin.

Decisao aprovada:

- As perguntas devem ser montadas a partir de dados do banco.
- Nao sera criada uma pagina para editar perguntas neste momento.
- A configuracao inicial sera manual, diretamente no Supabase.
- Isso e importante porque ainda nao sabemos quais perguntas sao as certas.
- O objetivo e permitir iteracao rapida sem criar uma area administrativa prematura.

Modelo recomendado para comecar:

```text
forms
form_questions
form_submissions.answers jsonb
```

Modelo inicial proposto:

```text
forms
- id
- slug
- title
- description
- is_active
- created_at
- updated_at

form_questions
- id
- form_id
- key
- label
- description
- type
- required
- options jsonb
- position
- is_active
- created_at
- updated_at

form_submissions
- id
- form_id
- respondent_name
- respondent_email
- respondent_phone
- answers jsonb
- created_at
```

Tipos de campo iniciais:

```text
short_text
long_text
email
phone
single_choice
multi_choice
yes_no
```

Possibilidades:

- Ativar ou desativar perguntas pelo banco.
- Reordenar perguntas.
- Ter formularios diferentes por tipo de atendimento.
- Salvar respostas em JSONB.
- Futuramente criar regras condicionais.
- Futuramente normalizar respostas para relatorios avancados.

Recomendacao: fazer depois da modularizacao inicial.

Plano incremental:

1. Criar novas tabelas no Supabase.
2. Inserir a configuracao equivalente ao formulario atual.
3. Alterar o frontend para buscar `forms` e `form_questions`.
4. Renderizar perguntas ativas ordenadas por `position`.
5. Salvar respostas em `form_submissions.answers` usando `question.key`.
6. Manter nome, e-mail e telefone tambem em colunas proprias para busca facil.
7. Depois decidir se dados antigos serao migrados ou mantidos na tabela atual.

Arquivo SQL inicial:

```text
supabase/dynamic_forms.sql
```

Esse SQL cria as tabelas `forms`, `form_questions` e `dynamic_form_submissions`, alem de inserir a
configuracao equivalente ao formulario atual como `acolhimento-inicial`.

Observacao de RLS:

- A submissao dinamica permite `insert` anonimo.
- Nao ha policy de leitura anonima para `dynamic_form_submissions`.
- Por isso, o frontend deve fazer `insert` sem retornar a linha inserida.

Guia de operacao manual:

```text
docs/formularios-dinamicos.md
```

### Tipos de atendimento

Foco: permitir links diferentes com duracoes e configuracoes diferentes.

Exemplos:

```text
/agendar/sessao-gratuita
/agendar/atendimento-30min
/agendar/atendimento-3h
```

Cada tipo pode ter:

- titulo;
- descricao;
- duracao;
- formulario associado;
- slug;
- status ativo/inativo;
- buffer futuro.

Recomendacao: fazer depois de modularizar e iniciar formularios dinamicos.

### Disponibilidade configuravel

Foco: tirar horarios fixos do `.env` e mover para regras configuraveis.

Evolucao possivel:

```text
availability_rules
- weekday
- start_time
- end_time
- active
```

Depois:

- bloqueios manuais;
- feriados;
- buffer global;
- buffer por tipo de atendimento;
- disponibilidade por tipo.

Recomendacao: comecar simples, com regras semanais por terapeuta.

### Modularizacao tecnica

Foco: preparar o codigo para crescer sem concentrar tudo em `App.jsx`.

Estrutura candidata:

```text
src/pages/
src/modules/forms/
src/modules/scheduling/
src/modules/workflows/
src/lib/
```

Recomendacao: fazer antes de formularios dinamicos e tipos de atendimento.

### Workflows plugaveis

Foco: montar sequencias diferentes de passos.

Exemplos:

```text
form -> agendamento
form -> pagamento -> agendamento
agendamento -> form -> confirmacao
landing -> form -> agendamento -> email
```

Entidades candidatas:

```text
workflows
workflow_steps
```

Recomendacao: fazer depois de formularios dinamicos e tipos de atendimento.

### Area admin do terapeuta

Foco: dar independencia ao terapeuta sem o desenvolvedor editar banco.

Primeiras telas possiveis:

- login;
- editar perfil;
- ver e copiar links;
- ver agendamentos;
- ativar/desativar perguntas;
- editar disponibilidade simples.

Recomendacao: fazer depois de validar configuracao manual no banco.

### Google OAuth por terapeuta

Foco: cada terapeuta conectar sua propria conta Google.

Fluxo futuro:

- terapeuta loga;
- clica em conectar Google;
- autoriza a aplicacao;
- app salva refresh token associado ao terapeuta;
- app lista calendarios;
- terapeuta escolhe agenda.

Recomendacao: fazer depois de area admin basica.

### Pagamentos

Foco: cobrar por alguns tipos de atendimento.

Caminhos possiveis:

- link de pagamento manual;
- Stripe, Mercado Pago ou outro provedor;
- pagamento antes de confirmar evento;
- reserva temporaria de horario.

Recomendacao: fazer depois de tipos de atendimento.

### SaaS e planos

Foco: vender como assinatura.

Possivel separacao:

- Gratis: um link e agenda basica.
- Basico: varios tipos de atendimento.
- Premium: workflows customizados.
- Pro: pagamentos, automacoes, equipe e relatorios.

Recomendacao: deixar para depois da validacao com terapeutas reais.

## Caminhos possiveis agora

### Caminho A: produto primeiro

Ordem:

```text
UX publica -> teste com terapeuta -> feedback -> ajustes
```

Bom para validar rapido.

### Caminho B: arquitetura primeiro

Ordem:

```text
modularizacao -> formularios dinamicos -> tipos de atendimento
```

Bom para preparar base solida.

### Caminho C: configuracao primeiro

Ordem:

```text
appointment_types -> availability_rules -> formularios dinamicos
```

Bom para criar variacoes de links e regras.

## Recomendacao atual

Seguir uma combinacao controlada:

```text
1. UX publica pequena
2. Modularizacao
3. Formularios dinamicos
4. Tipos de atendimento
5. Disponibilidade configuravel
```

Evitar por enquanto:

```text
area admin completa
OAuth multi-terapeuta
pagamentos integrados
SaaS/planos
```

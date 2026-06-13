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

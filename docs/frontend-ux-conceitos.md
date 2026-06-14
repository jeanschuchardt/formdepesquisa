# Conceitos de frontend e UX para este projeto

Este guia resume termos e padroes que devem aparecer nas decisoes de interface, React e experiencia
do usuario. A ideia e facilitar discussoes futuras para quem vem de backend.

## UX

UX significa User Experience, ou experiencia do usuario.

Nao e apenas visual. Envolve:

- clareza do fluxo;
- facilidade de preencher;
- sensacao de progresso;
- mensagens de erro;
- confianca;
- tempo para concluir;
- o que a pessoa entende que vai acontecer depois.

Neste projeto, UX importa porque o formulario e parte de um acolhimento. A experiencia nao deve
parecer burocratica ou tecnica demais.

## UI

UI significa User Interface, ou interface do usuario.

Inclui:

- botoes;
- inputs;
- cards;
- cores;
- espacamentos;
- tipografia;
- estados visuais;
- responsividade.

UI e a camada visivel. UX e a experiencia completa.

## Fluxo

Fluxo e a sequencia de passos que a pessoa percorre.

Exemplo atual:

```text
formulario -> tela de proximo passo -> agendamento -> confirmacao
```

Quando falamos em melhorar fluxo, estamos falando de reduzir atrito, deixar o proximo passo obvio e
evitar que a pessoa se perca.

## Wizard

Wizard e um fluxo em etapas.

Exemplo:

```text
Etapa 1: contato
Etapa 2: contexto
Etapa 3: expectativas
Etapa 4: agendamento
```

Caracteristicas:

- mostra progresso;
- divide uma tarefa grande em partes menores;
- normalmente tem botoes `Voltar` e `Proxima`;
- bom para formularios longos.

No React, um wizard costuma ser implementado com:

```text
currentStepIndex
steps[]
handleNext()
handlePrevious()
```

## Wizard com blocos leves

E uma versao mais fluida de wizard.

Em vez de cada etapa parecer um formulario grande, cada etapa agrupa perguntas relacionadas em um
bloco visual simples.

Exemplo:

```text
Bloco 1: dados essenciais
- nome
- e-mail
- WhatsApp

Bloco 2: momento atual
- area de atencao
- impacto
- tempo

Bloco 3: expectativas
- o que espera
- experiencia anterior
```

Vantagens:

- menos cansativo que um formulario inteiro;
- menos longo que uma pergunta por tela;
- bom equilibrio entre velocidade e acolhimento.

Risco:

- se o visual for pesado, continua parecendo formulario tradicional.

## Conversa guiada

Conversa guiada e um fluxo que parece uma conversa, mesmo sem ser chat.

Exemplo:

```text
Primeiro, me conta como posso te chamar?
E qual o melhor e-mail para receber o convite?
Agora me ajuda a entender o que esta mais presente hoje.
```

Caracteristicas:

- linguagem mais humana;
- uma pergunta por tela quando fizer sentido;
- opcoes como botoes/cards;
- progresso discreto;
- pouca poluicao visual.

Bom para:

- acolhimento;
- saude;
- terapia;
- onboarding sensivel.

Risco:

- pode ficar longo se cada pergunta virar uma tela.

Mitigacao:

- agrupar perguntas simples;
- usar uma pergunta por tela apenas para perguntas mais importantes;
- testar com usuario real.

## Experiencia tipo intake

Intake e o processo inicial de coleta de informacoes antes de um atendimento.

Em saude, terapia, consultoria e servicos profissionais, intake normalmente significa:

```text
entender quem e a pessoa
entender o problema
entender expectativas
coletar dados essenciais
preparar o atendimento
```

Uma experiencia tipo intake e mais que um formulario. Ela parece uma entrada guiada para o servico.

Caracteristicas:

- tela inicial clara;
- perguntas organizadas por contexto;
- tom acolhedor;
- opcoes faceis de selecionar;
- confirmacao do proximo passo;
- reducao de linguagem burocratica.

Neste projeto, o formulario de acolhimento pode evoluir para uma experiencia tipo intake.

## Card

Card e um bloco visual com conteudo relacionado.

Pode representar:

- uma opcao;
- uma pergunta;
- um resumo;
- uma etapa;
- um item de lista.

Exemplo de uso bom:

```text
[ Ansiedade e sobrecarga emocional ]
[ Relacionamento amoroso ]
[ Trabalho e carreira ]
```

Risco:

- cards demais deixam a tela pesada;
- cards dentro de cards dificultam leitura.

## CTA

CTA significa Call To Action.

E o botao ou acao principal da tela.

Exemplos:

```text
Proxima
Agendar horario
Confirmar horario
Abrir Google Meet
```

Em cada tela deve haver um CTA principal claro.

## Estado visual

Estado visual e como um componente aparece em cada situacao.

Exemplos de estados:

```text
normal
hover
focus
selected
disabled
loading
error
success
empty
```

Um bom fluxo precisa tratar todos esses estados.

## Empty state

Empty state e o estado quando nao ha dados.

Exemplo:

```text
Nao ha horarios disponiveis nesta data.
Escolha outro dia para ver novas opcoes.
```

Empty state ruim:

```text
[]
```

ou tela vazia sem explicacao.

## Loading state

Loading state e o estado enquanto o app carrega dados.

Exemplo:

```text
Buscando horarios...
```

Ou skeleton:

```text
[ bloco cinza animado ]
```

Importante porque chamadas para Supabase e Google Calendar podem demorar.

## Error state

Error state e o estado quando algo falha.

Mensagem ruim:

```text
Failed to fetch
```

Mensagem melhor:

```text
Nao foi possivel salvar suas respostas agora. Tente novamente em alguns instantes.
```

Para desenvolvimento, podemos manter detalhes tecnicos no console. Para usuario final, a mensagem
deve ser simples.

## Microcopy

Microcopy sao pequenos textos da interface.

Exemplos:

- label de campo;
- texto de ajuda;
- mensagem de erro;
- texto de botao;
- explicacao curta.

Neste projeto, microcopy e importante para transformar formulario em acolhimento.

## Progress indicator

Indicador de progresso mostra em que ponto do fluxo a pessoa esta.

Exemplos:

```text
40%
Etapa 2 de 5
barra de progresso
```

Deve ser discreto. Em experiencia sensivel, progresso agressivo pode deixar o fluxo com cara de
checkout ou prova.

## Responsividade

Responsividade e a capacidade da interface funcionar bem em tamanhos diferentes:

- celular;
- tablet;
- desktop;
- telas largas.

No CSS, isso geralmente envolve:

```css
@media (max-width: 760px) {
  /* ajustes mobile */
}
```

Tambem envolve usar:

```css
grid
flex
minmax()
clamp()
max-width
```

## Componentes React

Componente React e uma funcao que retorna UI.

Exemplo:

```jsx
function Button({ children }) {
  return <button>{children}</button>;
}
```

Neste projeto, queremos separar componentes como:

```text
DynamicForm
FormField
SchedulingPanel
CalendarPicker
SlotPicker
SchedulingSummary
```

## Props

Props sao parametros de componentes.

Exemplo:

```jsx
<TextField label=\"Nome\" value={name} onChange={setName} />
```

Aqui `label`, `value` e `onChange` sao props.

## State

State e dado que muda durante o uso da tela.

Exemplos:

```text
currentStepIndex
answers
selectedDate
selectedSlot
isLoading
error
```

Em React, usamos:

```jsx
const [selectedDate, setSelectedDate] = useState('');
```

## Derived state

Derived state e um valor calculado a partir de outro estado.

Exemplo:

```text
progress = currentStepIndex / totalSteps
canConfirm = selectedSlot && email && !isBooking
```

Em React, pode ser calculado direto ou com `useMemo`.

## useEffect

`useEffect` executa efeito colateral.

Exemplos:

- buscar formulario no Supabase;
- buscar horarios na API;
- reagir quando `selectedDate` muda.

Exemplo conceitual:

```jsx
useEffect(() => {
  loadAvailability(selectedDate);
}, [selectedDate]);
```

## Controlled input

Input controlado e um input cujo valor vem do state.

Exemplo:

```jsx
<input value={name} onChange={(event) => setName(event.target.value)} />
```

Vantagem:

- React sabe sempre qual e o valor atual.

## Renderizacao condicional

Renderizacao condicional e mostrar uma UI ou outra dependendo do estado.

Exemplo:

```jsx
{isLoading ? <Loading /> : <Form />}
```

No projeto:

```text
se formulario enviado -> mostrar agendamento
senao -> mostrar formulario
```

## Separacao em modulos

Separar em modulos significa tirar responsabilidades de `App.jsx`.

Estrutura desejada:

```text
src/pages/
src/modules/forms/
src/modules/scheduling/
src/lib/
```

Beneficios:

- codigo mais facil de entender;
- componentes reaproveitaveis;
- menos risco ao mexer em uma parte;
- base melhor para features futuras.

## Design system

Design system e um conjunto de padroes visuais e componentes.

Exemplos:

- cores;
- tamanhos;
- radius;
- botoes;
- campos;
- mensagens;
- estados.

Ainda nao temos um design system formal, mas podemos criar padroes aos poucos.

## Recomendacao para este projeto

Para a proxima etapa, os conceitos mais importantes sao:

1. Conversa guiada.
2. Wizard com blocos leves.
3. Intake.
4. Estados visuais.
5. Microcopy.
6. Componentizacao React.
7. Separacao em modulos.

Esses conceitos ajudam a transformar o formulario atual em uma experiencia mais fluida e mais facil
de manter.

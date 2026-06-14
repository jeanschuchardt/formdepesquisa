# Refinamento das perguntas do funil

Objetivo: transformar o formulario em uma conversa guiada, mantendo informacoes uteis para triagem,
preparacao da conversa gratuita e qualificacao leve do momento da pessoa.

Decisao tecnica: manter os mesmos `keys` atuais para preservar compatibilidade com respostas antigas
em `dynamic_form_submissions.answers`. O SQL abaixo faz upsert: atualiza perguntas existentes ou
insere caso alguma esteja ausente.

## Principios usados

- Comecar com baixa friccao: nome e contato.
- Fechar com uma pergunta aberta, para a pessoa elaborar depois de ter passado pelas opcoes.
- Usar linguagem de conversa, sem parecer anamnese fria.
- Coletar sinais de urgencia, historico, expectativa e prontidao.
- Deixar dados menos essenciais como opcionais.
- Evitar opcoes muito clinicas ou duras para nao afastar a pessoa.

## Comparativo atual x proposta

| Ordem proposta | Key | Atual | Proposta | Tipo | Obrigatoria | Opcoes propostas |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `full_name` | Nome completo | Como posso te chamar? | short_text | Sim | - |
| 2 | `email` | E-mail | Qual e o melhor e-mail para receber o convite? | email | Sim | - |
| 3 | `whatsapp` | WhatsApp | E qual WhatsApp podemos usar se precisarmos falar com voce? | phone | Sim | - |
| 4 | `attention_area` | Qual area da sua vida mais precisa de atencao neste momento? | Qual tema parece mais presente para voce hoje? | single_choice | Sim | Relacionamento amoroso; Familia; Ansiedade, sobrecarga ou emocao intensa; Autoestima e seguranca pessoal; Trabalho, carreira ou dinheiro; Proposito, espiritualidade ou sentido de vida; Decisao importante; Outro |
| 5 | `impact` | Quanto essa situacao impacta sua vida atualmente? | Quanto isso tem pesado na sua rotina? | single_choice | Sim | Leve, consigo lidar; Moderado, aparece com frequencia; Alto, tem afetado bastante; Muito alto, sinto que preciso de ajuda logo |
| 6 | `duration` | Ha quanto tempo essa situacao esta presente? | Ha quanto tempo isso vem acontecendo? | single_choice | Sim | Comecou recentemente; Alguns meses; Mais de um ano; E algo antigo ou repetitivo |
| 7 | `expected_outcomes` | O que voce espera obter com essa conversa? | O que voce gostaria de levar dessa conversa? | multi_choice | Sim | Clareza sobre o que estou vivendo; Entender melhor meus relacionamentos; Olhar para conflitos familiares; Perceber padroes que se repetem; Apoio para tomar uma decisao; Mais autoconhecimento; Mais equilibrio emocional |
| 8 | `previous_process` | Voce ja participou de algum processo terapeutico anteriormente? | Voce ja fez algum processo de cuidado emocional ou autoconhecimento? | single_choice | Sim | Nunca fiz; Ja fiz terapia; Ja participei de constelacao familiar; Ja fiz mentoria, coaching ou algo parecido; Ja fiz mais de um tipo de processo |
| 9 | `online_availability` | Voce possui disponibilidade para realizar sessoes online por video? | Voce consegue participar de uma conversa online por video? | yes_no | Sim | Sim; Nao |
| 10 | `investment_moment` | Caso perceba que um acompanhamento pode ajuda-lo(a), qual opcao melhor representa seu momento atual? | Se depois da conversa fizer sentido continuar, como voce ve esse momento? | single_choice | Sim | Estou aberto(a) a iniciar um acompanhamento; Quero entender melhor antes de decidir; Preciso avaliar investimento e agenda; Preciso conversar com alguem antes; Neste momento busco apenas a conversa gratuita |
| 11 | `referral_source` | Como conheceu meu trabalho? | Como voce chegou ate aqui? | single_choice | Nao | Instagram; Indicacao de alguem; WhatsApp; Evento ou vivencia presencial; Google ou pesquisa online; Outro caminho |
| 12 | `city` | Cidade | Em qual cidade voce esta? | short_text | Nao | - |
| 13 | `state` | Estado | E em qual estado? | short_text | Nao | - |
| 14 | `qualification` | Qualificacao | Se fizer sentido, como voce descreve sua ocupacao hoje? | short_text | Nao | - |
| 15 | `current_situation` | Descreva brevemente o que voce esta vivendo hoje e por que esta sessao gratuita seria importante para voce. | O que fez voce buscar essa conversa agora? | long_text | Sim | - |

## Observacoes de UX

- A pergunta aberta `current_situation` fica no fim do funil. A pessoa chega nela depois de refletir
  sobre tema, impacto, tempo e expectativas.
- `city`, `state` e `qualification` foram para o fim e ficaram opcionais. Esses dados podem ser
  uteis, mas nao devem bloquear a conversao.
- `referral_source` tambem ficou opcional, porque e informacao de marketing, nao essencial para a
  conversa.
- O app hoje tambem possui microcopy no frontend em `getQuestionCopy`. Para o texto aparecer
  exatamente como esta proposta, vale alinhar esse objeto no proximo ajuste de codigo.

## SQL proposto

Execute no SQL Editor do Supabase. O SQL atualiza o formulario `acolhimento-inicial`, reordena as
perguntas, altera textos/opcoes/obrigatoriedade e ativa todas as perguntas listadas.

```sql
with target_form as (
  select id
  from public.forms
  where slug = 'acolhimento-inicial'
),
upsert_questions as (
  insert into public.form_questions (
    form_id,
    key,
    label,
    description,
    type,
    required,
    options,
    position,
    is_active
  )
  select
    target_form.id,
    question.key,
    question.label,
    question.description,
    question.type,
    question.required,
    question.options::jsonb,
    question.position,
    true
  from target_form
  cross join (
    values
      (
        'full_name',
        'Como posso te chamar?',
        'Use o nome que voce prefere que apareca na nossa conversa.',
        'short_text',
        true,
        '[]',
        1
      ),
      (
        'email',
        'Qual e o melhor e-mail para receber o convite?',
        'O link do Google Meet sera enviado para esse e-mail.',
        'email',
        true,
        '[]',
        2
      ),
      (
        'whatsapp',
        'E qual WhatsApp podemos usar se precisarmos falar com voce?',
        'Use DDD e numero.',
        'phone',
        true,
        '[]',
        3
      ),
      (
        'attention_area',
        'Qual tema parece mais presente para voce hoje?',
        'Escolha a opcao que mais se aproxima do que voce esta vivendo.',
        'single_choice',
        true,
        '["Relacionamento amoroso","Familia","Ansiedade, sobrecarga ou emocao intensa","Autoestima e seguranca pessoal","Trabalho, carreira ou dinheiro","Proposito, espiritualidade ou sentido de vida","Decisao importante","Outro"]',
        4
      ),
      (
        'impact',
        'Quanto isso tem pesado na sua rotina?',
        'Essa resposta ajuda a entender a intensidade do momento.',
        'single_choice',
        true,
        '["Leve, consigo lidar","Moderado, aparece com frequencia","Alto, tem afetado bastante","Muito alto, sinto que preciso de ajuda logo"]',
        5
      ),
      (
        'duration',
        'Ha quanto tempo isso vem acontecendo?',
        'Nao precisa ser exato. Escolha a faixa que fizer mais sentido.',
        'single_choice',
        true,
        '["Comecou recentemente","Alguns meses","Mais de um ano","E algo antigo ou repetitivo"]',
        6
      ),
      (
        'expected_outcomes',
        'O que voce gostaria de levar dessa conversa?',
        'Escolha uma ou mais opcoes.',
        'multi_choice',
        true,
        '["Clareza sobre o que estou vivendo","Entender melhor meus relacionamentos","Olhar para conflitos familiares","Perceber padroes que se repetem","Apoio para tomar uma decisao","Mais autoconhecimento","Mais equilibrio emocional"]',
        7
      ),
      (
        'previous_process',
        'Voce ja fez algum processo de cuidado emocional ou autoconhecimento?',
        'Isso ajuda a entender sua familiaridade com esse tipo de trabalho.',
        'single_choice',
        true,
        '["Nunca fiz","Ja fiz terapia","Ja participei de constelacao familiar","Ja fiz mentoria, coaching ou algo parecido","Ja fiz mais de um tipo de processo"]',
        8
      ),
      (
        'online_availability',
        'Voce consegue participar de uma conversa online por video?',
        'A conversa gratuita acontece por Google Meet.',
        'yes_no',
        true,
        '["Sim","Nao"]',
        9
      ),
      (
        'investment_moment',
        'Se depois da conversa fizer sentido continuar, como voce ve esse momento?',
        'Nao existe resposta certa. A ideia e entender seu momento atual.',
        'single_choice',
        true,
        '["Estou aberto(a) a iniciar um acompanhamento","Quero entender melhor antes de decidir","Preciso avaliar investimento e agenda","Preciso conversar com alguem antes","Neste momento busco apenas a conversa gratuita"]',
        10
      ),
      (
        'referral_source',
        'Como voce chegou ate aqui?',
        'Essa informacao ajuda a entender os canais de chegada.',
        'single_choice',
        false,
        '["Instagram","Indicacao de alguem","WhatsApp","Evento ou vivencia presencial","Google ou pesquisa online","Outro caminho"]',
        11
      ),
      (
        'city',
        'Em qual cidade voce esta?',
        'Opcional. Ajuda a entender contexto e fuso.',
        'short_text',
        false,
        '[]',
        12
      ),
      (
        'state',
        'E em qual estado?',
        'Opcional. Pode informar a UF ou o nome do estado.',
        'short_text',
        false,
        '[]',
        13
      ),
      (
        'qualification',
        'Se fizer sentido, como voce descreve sua ocupacao hoje?',
        'Opcional. Pode ser profissao, formacao, ocupacao atual ou area de atuacao.',
        'short_text',
        false,
        '[]',
        14
      ),
      (
        'current_situation',
        'O que fez voce buscar essa conversa agora?',
        'Conte do seu jeito o que esta acontecendo. Pode ser breve.',
        'long_text',
        true,
        '[]',
        15
      )
  ) as question(key, label, description, type, required, options, position)
  on conflict (form_id, key) do update
  set
    label = excluded.label,
    description = excluded.description,
    type = excluded.type,
    required = excluded.required,
    options = excluded.options,
    position = excluded.position,
    is_active = true,
    updated_at = now()
  returning key
)
update public.forms
set
  title = 'Formulario de acolhimento',
  description = 'Perguntas iniciais para preparar sua conversa gratuita.',
  updated_at = now()
where slug = 'acolhimento-inicial';
```

## Verificacao apos executar

```sql
select
  position,
  key,
  label,
  type,
  required,
  options,
  is_active
from public.form_questions
where form_id = (
  select id
  from public.forms
  where slug = 'acolhimento-inicial'
)
order by position;
```

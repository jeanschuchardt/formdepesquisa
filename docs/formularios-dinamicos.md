# Formularios dinamicos

Os formularios sao configurados diretamente no banco de dados. Nesta fase nao existe tela admin para
criar ou editar perguntas.

## Tabelas principais

- `forms`: cadastro do formulario.
- `form_questions`: perguntas do formulario.
- `dynamic_form_submissions`: respostas enviadas.

## Buscar o formulario atual

O formulario atual usa o slug:

```text
acolhimento-inicial
```

Para encontrar o ID:

```sql
select id, slug, title
from public.forms
where slug = 'acolhimento-inicial';
```

## Tipos de pergunta suportados

```text
short_text
long_text
email
phone
single_choice
multi_choice
yes_no
```

## Criar uma nova pergunta

Substitua `FORM_ID_AQUI` pelo `id` retornado na consulta do formulario.

```sql
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
values (
  'FORM_ID_AQUI',
  'motivo_principal',
  'Qual e o principal motivo para buscar essa conversa?',
  null,
  'long_text',
  true,
  '[]'::jsonb,
  16,
  true
);
```

## Criar pergunta de escolha unica

```sql
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
values (
  'FORM_ID_AQUI',
  'preferencia_periodo',
  'Qual periodo voce prefere para atendimentos?',
  null,
  'single_choice',
  true,
  '["Manha", "Tarde", "Noite"]'::jsonb,
  17,
  true
);
```

## Criar pergunta de multipla escolha

```sql
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
values (
  'FORM_ID_AQUI',
  'temas_de_interesse',
  'Quais temas voce gostaria de trabalhar?',
  'Escolha uma ou mais opcoes.',
  'multi_choice',
  false,
  '["Relacionamentos", "Carreira", "Familia", "Autoconhecimento"]'::jsonb,
  18,
  true
);
```

## Ocultar uma pergunta

Use `is_active = false`. A pergunta deixa de aparecer no formulario, mas respostas antigas continuam
salvas.

```sql
update public.form_questions
set is_active = false,
    updated_at = now()
where key = 'motivo_principal'
  and form_id = 'FORM_ID_AQUI';
```

## Reativar uma pergunta

```sql
update public.form_questions
set is_active = true,
    updated_at = now()
where key = 'motivo_principal'
  and form_id = 'FORM_ID_AQUI';
```

## Reordenar perguntas

A ordem e controlada por `position`.

```sql
update public.form_questions
set position = 8,
    updated_at = now()
where key = 'motivo_principal'
  and form_id = 'FORM_ID_AQUI';
```

## Alterar texto da pergunta

```sql
update public.form_questions
set label = 'Qual e o principal desafio que voce quer olhar agora?',
    updated_at = now()
where key = 'motivo_principal'
  and form_id = 'FORM_ID_AQUI';
```

## Alterar opcoes

```sql
update public.form_questions
set options = '["Manha", "Tarde", "Noite", "Fim de semana"]'::jsonb,
    updated_at = now()
where key = 'preferencia_periodo'
  and form_id = 'FORM_ID_AQUI';
```

## Cuidados com o campo `key`

O campo `key` e usado para salvar a resposta dentro de `answers`.

Exemplo:

```json
{
  "motivo_principal": "Quero entender melhor uma situacao familiar."
}
```

Evite mudar `key` depois que o formulario ja recebeu respostas, porque isso dificulta comparar
respostas antigas e novas. Prefira alterar apenas `label`, `position`, `options` ou `is_active`.

## Consultar respostas

```sql
select
  created_at,
  respondent_name,
  respondent_email,
  respondent_phone,
  answers
from public.dynamic_form_submissions
order by created_at desc;
```

## Consultar uma resposta especifica dentro do JSON

```sql
select
  created_at,
  respondent_name,
  answers ->> 'motivo_principal' as motivo_principal
from public.dynamic_form_submissions
where answers ? 'motivo_principal'
order by created_at desc;
```

## Fluxo recomendado para editar perguntas

1. Criar ou editar pergunta no Supabase.
2. Conferir se `is_active = true`.
3. Conferir se `position` esta correta.
4. Abrir o formulario no navegador.
5. Enviar um teste.
6. Conferir o registro em `dynamic_form_submissions`.

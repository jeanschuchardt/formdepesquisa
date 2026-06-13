create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique,
  title text not null,
  description text,
  is_active boolean not null default true
);

create table if not exists public.form_questions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  form_id uuid not null references public.forms(id) on delete cascade,
  key text not null,
  label text not null,
  description text,
  type text not null check (
    type in (
      'short_text',
      'long_text',
      'email',
      'phone',
      'single_choice',
      'multi_choice',
      'yes_no'
    )
  ),
  required boolean not null default true,
  options jsonb not null default '[]'::jsonb,
  position integer not null default 0,
  is_active boolean not null default true,
  unique (form_id, key)
);

create index if not exists form_questions_form_position_idx
on public.form_questions (form_id, position);

create table if not exists public.dynamic_form_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  form_id uuid not null references public.forms(id) on delete restrict,
  respondent_name text,
  respondent_email text,
  respondent_phone text,
  answers jsonb not null default '{}'::jsonb
);

create index if not exists dynamic_form_submissions_form_created_idx
on public.dynamic_form_submissions (form_id, created_at desc);

alter table public.forms enable row level security;
alter table public.form_questions enable row level security;
alter table public.dynamic_form_submissions enable row level security;

drop policy if exists "Allow anonymous active form reads" on public.forms;
drop policy if exists "Allow anonymous active question reads" on public.form_questions;
drop policy if exists "Allow anonymous dynamic form inserts" on public.dynamic_form_submissions;

create policy "Allow anonymous active form reads"
on public.forms
for select
to anon
using (is_active = true);

create policy "Allow anonymous active question reads"
on public.form_questions
for select
to anon
using (
  is_active = true
  and exists (
    select 1
    from public.forms
    where forms.id = form_questions.form_id
      and forms.is_active = true
  )
);

create policy "Allow anonymous dynamic form inserts"
on public.dynamic_form_submissions
for insert
to anon
with check (true);

insert into public.forms (slug, title, description)
values (
  'acolhimento-inicial',
  'Formulario de acolhimento',
  'Formulario inicial para preparar a conversa gratuita.'
)
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  updated_at = now();

with target_form as (
  select id
  from public.forms
  where slug = 'acolhimento-inicial'
)
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
      'Nome completo',
      null,
      'short_text',
      true,
      '[]',
      1
    ),
    (
      'whatsapp',
      'WhatsApp',
      null,
      'phone',
      true,
      '[]',
      2
    ),
    (
      'email',
      'E-mail',
      null,
      'email',
      true,
      '[]',
      3
    ),
    (
      'city',
      'Cidade',
      null,
      'short_text',
      true,
      '[]',
      4
    ),
    (
      'state',
      'Estado',
      null,
      'short_text',
      true,
      '[]',
      5
    ),
    (
      'qualification',
      'Qualificacao',
      'Profissao, ocupacao ou formacao.',
      'short_text',
      true,
      '[]',
      6
    ),
    (
      'attention_area',
      'Qual area da sua vida mais precisa de atencao neste momento?',
      null,
      'single_choice',
      true,
      '["Relacionamento amoroso","Familia","Ansiedade e sobrecarga emocional","Autoestima","Trabalho e carreira","Espiritualidade e proposito","Tomada de decisao","Outro"]',
      7
    ),
    (
      'duration',
      'Ha quanto tempo essa situacao esta presente?',
      null,
      'single_choice',
      true,
      '["Menos de 3 meses","Entre 3 meses e 1 ano","Entre 1 e 3 anos","Mais de 3 anos"]',
      8
    ),
    (
      'impact',
      'Quanto essa situacao impacta sua vida atualmente?',
      null,
      'single_choice',
      true,
      '["Pouco","Moderadamente","Muito","Extremamente"]',
      9
    ),
    (
      'expected_outcomes',
      'O que voce espera obter com essa conversa?',
      'Escolha uma ou mais opcoes.',
      'multi_choice',
      true,
      '["Clareza sobre minha situacao","Melhorar relacionamentos","Resolver conflitos familiares","Compreender padroes repetitivos","Tomar uma decisao importante","Desenvolver autoconhecimento","Encontrar mais equilibrio emocional"]',
      10
    ),
    (
      'previous_process',
      'Voce ja participou de algum processo terapeutico anteriormente?',
      null,
      'single_choice',
      true,
      '["Nunca","Terapia","Constelacao Familiar","Coaching","Mentoria","Mais de uma das opcoes acima"]',
      11
    ),
    (
      'investment_moment',
      'Caso perceba que um acompanhamento pode ajuda-lo(a), qual opcao melhor representa seu momento atual?',
      null,
      'single_choice',
      true,
      '["Estou pronto(a) para investir no meu desenvolvimento pessoal e emocional.","Gostaria de entender melhor antes de decidir.","Preciso avaliar o investimento financeiro.","Preciso conversar com minha familia/parceiro(a).","Busco apenas a sessao gratuita."]',
      12
    ),
    (
      'online_availability',
      'Voce possui disponibilidade para realizar sessoes online por video?',
      null,
      'yes_no',
      true,
      '["Sim","Nao"]',
      13
    ),
    (
      'referral_source',
      'Como conheceu meu trabalho?',
      null,
      'single_choice',
      true,
      '["Instagram","Indicacao","WhatsApp","Cerimonia","Google","Outro"]',
      14
    ),
    (
      'current_situation',
      'Descreva brevemente o que voce esta vivendo hoje e por que esta sessao gratuita seria importante para voce.',
      null,
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
  is_active = excluded.is_active,
  updated_at = now();

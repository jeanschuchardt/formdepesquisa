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
  'Perguntas iniciais para preparar a conversa gratuita.'
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
  is_active = excluded.is_active,
  updated_at = now();

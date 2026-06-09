create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  whatsapp text not null,
  email text not null,
  city text not null,
  state text not null,
  qualification text not null,
  attention_area text not null,
  duration text not null,
  impact text not null,
  expected_outcomes text[] not null,
  previous_process text not null,
  investment_moment text not null,
  online_availability text not null,
  referral_source text not null,
  current_situation text not null
);

alter table public.form_submissions enable row level security;

drop policy if exists "Allow anonymous form inserts" on public.form_submissions;

create policy "Allow anonymous form inserts"
on public.form_submissions
for insert
to anon
with check (true);

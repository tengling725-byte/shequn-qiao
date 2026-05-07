-- 题库表
create table if not exists banks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  title text not null,
  description text,
  category text,
  question_count int default 0,
  is_local boolean default true,
  cloud_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 题目表
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  bank_id uuid references banks on delete cascade,
  type text check (type in ('single_choice', 'multiple_choice', 'true_false')),
  content text not null,
  options jsonb not null,
  correct_index int[] not null,
  explanation text,
  difficulty int default 1,
  tags text[] default '{}',
  created_at timestamptz default now());

-- 测验记录表
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  bank_id uuid references banks,
  bank_title text,
  question_count int,
  correct_count int,
  score int,
  duration int,
  quiz_mode text check (quiz_mode in ('exam', 'game')),
  feedback_mode text check (feedback_mode in ('instant', 'after')),
  answers jsonb,
  wrong_question_ids uuid[],
  created_at timestamptz default now());

-- 用户设置表
create table if not exists user_settings (
  user_id uuid primary key references auth.users,
  default_quiz_mode text default 'exam',
  default_feedback_mode text default 'after',
  game_config jsonb default '{"baseScore":10,"streakBonus":5,"timeBonus":true}',
  theme text default 'light');

-- RLS 策略
alter table banks enable row level security;
alter table questions enable row level security;
alter table sessions enable row level security;
alter table user_settings enable row level security;

create policy "Users can only access own banks" on banks
  for all using (auth.uid() = user_id);

create policy "Users can only access own questions" on questions
  for all using (
    exists (select 1 from banks where banks.id = questions.bank_id and banks.user_id = auth.uid())
  );

create policy "Users can only access own sessions" on sessions
  for all using (auth.uid() = user_id);

create policy "Users can only access own settings" on user_settings
  for all using (auth.uid() = user_id);
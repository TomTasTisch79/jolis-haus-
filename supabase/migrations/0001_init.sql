create extension if not exists pgcrypto;

create table profiles (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  color text,
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text,
  color text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category_id uuid references categories(id) on delete set null,
  size text not null check (size in ('small', 'medium', 'large')),
  due_date date,
  recurrence_rule jsonb,
  series_id uuid,
  is_random_pool boolean not null default false,
  assigned_profile_id uuid references profiles(id) on delete set null,
  completed_at timestamptz,
  completed_by uuid references profiles(id) on delete set null,
  missed_penalty_points int not null default 0,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index tasks_assigned_profile_id_idx on tasks (assigned_profile_id);
create index tasks_category_id_idx on tasks (category_id);
create index tasks_is_random_pool_idx on tasks (is_random_pool);
create index tasks_due_date_idx on tasks (due_date);
create index tasks_series_id_idx on tasks (series_id);

create table ratings (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null unique references tasks(id) on delete cascade,
  rated_by uuid references profiles(id) on delete set null,
  rating text not null check (rating in ('good', 'bad')),
  points_awarded int not null,
  created_at timestamptz not null default now()
);

create table weekly_assignments (
  id uuid primary key default gen_random_uuid(),
  week_start_date date not null unique,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table achievements (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  title text not null,
  description text,
  icon text
);

create table profile_achievements (
  profile_id uuid not null references profiles(id) on delete cascade,
  achievement_id uuid not null references achievements(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (profile_id, achievement_id)
);

alter table profiles enable row level security;
alter table categories enable row level security;
alter table tasks enable row level security;
alter table ratings enable row level security;
alter table weekly_assignments enable row level security;
alter table achievements enable row level security;
alter table profile_achievements enable row level security;

create policy "open access" on profiles for all using (true) with check (true);
create policy "open access" on categories for all using (true) with check (true);
create policy "open access" on tasks for all using (true) with check (true);
create policy "open access" on ratings for all using (true) with check (true);
create policy "open access" on weekly_assignments for all using (true) with check (true);
create policy "open access" on achievements for all using (true) with check (true);
create policy "open access" on profile_achievements for all using (true) with check (true);

insert into categories (name, icon, color, sort_order) values
  ('Küche', '🍳', '#FF9F0A', 0),
  ('Haushalt', '🧹', '#30D158', 1),
  ('Hund', '🐕', '#0A84FF', 2),
  ('Wäsche', '🧺', '#BF5AF2', 3),
  ('Einkaufen', '🛒', '#FF375F', 4);

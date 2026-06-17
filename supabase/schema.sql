-- PersonalOS · Supabase schema
-- Rode este arquivo no SQL Editor do Supabase antes do deploy na Vercel.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('trainer','student','admin')),
  full_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.trainers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  cpf text,
  birth_date date,
  phone text,
  email text not null,
  business_name text,
  cnpj text,
  address text,
  business_phone text,
  plan_code text not null default 'profissional',
  subscription_status text default 'pending',
  grace_until timestamptz,
  brand_logo_path text,
  brand_primary_color text default '#38e078',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  plan_code text not null,
  amount_cents integer not null,
  currency text default 'BRL',
  billing_interval text default 'month',
  status text default 'pending',
  provider text,
  external_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  canceled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.saas_payments (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  provider text,
  external_id text,
  amount_cents integer not null,
  status text default 'created',
  paid_at timestamptz,
  raw_payload jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  user_id uuid unique references auth.users(id) on delete set null,
  full_name text not null,
  photo_path text,
  birth_date date,
  sex text,
  phone text,
  email text,
  goal text,
  level text,
  restrictions text,
  injuries text,
  plan_name text,
  monthly_price_cents integer,
  due_day integer,
  preferred_payment_method text,
  status text default 'active',
  invite_token uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists students_trainer_idx on public.students(trainer_id);
create index if not exists students_user_idx on public.students(user_id);
create unique index if not exists students_invite_token_idx on public.students(invite_token) where invite_token is not null;

create table if not exists public.anamneses (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid not null unique references public.students(id) on delete cascade,
  objective text,
  weekly_frequency text,
  training_experience text,
  training_location text,
  equipment text,
  injury_history text,
  current_pain text,
  medical_restrictions text,
  sleep_quality text,
  stress_level text,
  current_diet text,
  smartwatch_use text,
  health_app text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  name text not null,
  muscle_group text not null,
  equipment text,
  difficulty text,
  external_video_url text,
  cover_path text,
  instructions text,
  common_mistakes text,
  notes text,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.exercise_videos (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  exercise_id uuid references public.exercises(id) on delete cascade,
  workout_id uuid,
  workout_exercise_id uuid,
  title text,
  description text,
  video_storage_path text not null,
  video_thumbnail_path text,
  video_duration integer,
  video_size bigint,
  video_mime_type text,
  external_video_url text,
  uploaded_by uuid references auth.users(id) on delete set null,
  visibility text default 'private',
  status text default 'ready',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists exercise_videos_trainer_idx on public.exercise_videos(trainer_id);

create table if not exists public.video_upload_logs (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  exercise_id uuid references public.exercises(id) on delete set null,
  storage_path text,
  file_size bigint,
  mime_type text,
  status text,
  error_message text,
  created_at timestamptz default now()
);

create table if not exists public.video_view_logs (
  id uuid primary key default gen_random_uuid(),
  video_id uuid references public.exercise_videos(id) on delete cascade,
  trainer_id uuid references public.trainers(id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.workout_templates (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  title text not null,
  objective text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  template_id uuid references public.workout_templates(id) on delete set null,
  title text not null,
  objective text,
  start_date date,
  end_date date,
  weekly_frequency integer,
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.workout_days (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  workout_id uuid not null references public.workouts(id) on delete cascade,
  label text not null,
  day_order integer default 1,
  created_at timestamptz default now()
);

create table if not exists public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  workout_id uuid not null references public.workouts(id) on delete cascade,
  workout_day_id uuid not null references public.workout_days(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  order_index integer default 1,
  sets integer,
  reps text,
  suggested_load text,
  rest_time text,
  execution_time text,
  notes text,
  exercise_role text default 'principal',
  video_source text default 'library',
  specific_video_id uuid references public.exercise_videos(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  workout_id uuid references public.workouts(id) on delete set null,
  workout_exercise_id uuid references public.workout_exercises(id) on delete set null,
  status text default 'completed',
  load_used text,
  pain_level integer,
  difficulty_level integer,
  notes text,
  effort_perception integer,
  duration_seconds integer,
  completed_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.workout_feedbacks (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  workout_id uuid references public.workouts(id) on delete cascade,
  body text,
  effort_perception integer,
  created_at timestamptz default now()
);

create table if not exists public.periodization_cycles (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  objective text,
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.periodization_weeks (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.periodization_cycles(id) on delete cascade,
  week_number integer not null,
  focus text,
  volume text,
  intensity text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.physical_assessments (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  assessment_date date default current_date,
  weight_kg numeric,
  height_cm numeric,
  bmi numeric generated always as (case when height_cm > 0 and weight_kg > 0 then round((weight_kg / ((height_cm/100)*(height_cm/100)))::numeric, 2) else null end) stored,
  waist_cm numeric,
  hip_cm numeric,
  chest_cm numeric,
  arm_cm numeric,
  thigh_cm numeric,
  calf_cm numeric,
  body_fat_percent numeric,
  front_photo_path text,
  side_photo_path text,
  back_photo_path text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  photo_path text not null,
  angle text,
  taken_at date default current_date,
  created_at timestamptz default now()
);

create table if not exists public.student_metrics (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  metric_type text not null,
  value numeric,
  unit text,
  measured_at timestamptz default now(),
  source text default 'manual'
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  name text not null,
  target text,
  frequency text default 'daily',
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  completed_at timestamptz default now(),
  value text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.food_logs (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  meal_photo_path text,
  description text,
  notes text,
  logged_at timestamptz default now()
);

create table if not exists public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  weekday integer not null,
  start_time time not null,
  end_time time not null,
  slot_minutes integer default 60,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  title text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  mode text default 'presencial',
  location text,
  meeting_url text,
  status text default 'pending',
  approval_mode text default 'manual',
  recurrence_rule text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.appointment_exceptions (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  date date not null,
  reason text,
  is_available boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.appointment_status_logs (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  status text not null,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.trainer_payment_gateways (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null unique references public.trainers(id) on delete cascade,
  provider text not null,
  status text default 'not_connected',
  receiver_external_id text,
  onboarding_url text,
  requirements jsonb,
  connected_at timestamptz,
  disconnected_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.trainer_receiver_accounts (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  gateway_id uuid references public.trainer_payment_gateways(id) on delete cascade,
  provider text,
  external_account_id text,
  status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.student_payment_plans (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  name text not null,
  description text,
  amount_cents integer not null,
  charge_type text default 'recorrente',
  billing_period text default 'mensal',
  due_day integer,
  student_limit integer,
  status text default 'active',
  services_included text[] default '{}',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.student_charges (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  plan_id uuid references public.student_payment_plans(id) on delete set null,
  description text not null,
  amount_cents integer not null,
  due_date date,
  payment_method text,
  recurrence text default 'avulsa',
  status text default 'pending',
  payment_link text,
  attempts integer default 0,
  paid_at timestamptz,
  external_id text,
  receipt_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.student_subscriptions (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  plan_id uuid references public.student_payment_plans(id) on delete set null,
  status text default 'active',
  provider text,
  external_id text,
  next_billing_date date,
  grace_days integer default 0,
  block_after_days integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid references public.trainers(id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  charge_id uuid references public.student_charges(id) on delete set null,
  provider text,
  external_id text,
  status text,
  amount_cents integer,
  payment_method text,
  paid_at timestamptz,
  raw_payload jsonb,
  created_at timestamptz default now()
);

create table if not exists public.payment_webhook_logs (
  id uuid primary key default gen_random_uuid(),
  gateway text,
  event_type text,
  payload jsonb,
  processed boolean default false,
  error_message text,
  created_at timestamptz default now()
);

create table if not exists public.platform_fees (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid references public.trainers(id) on delete cascade,
  charge_id uuid references public.student_charges(id) on delete set null,
  fee_type text default 'percent',
  fee_percent numeric default 0,
  fee_fixed_cents integer default 0,
  fee_amount_cents integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  provider text,
  amount_cents integer,
  status text,
  external_id text,
  paid_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid references public.trainers(id) on delete cascade,
  charge_id uuid references public.student_charges(id) on delete set null,
  transaction_id uuid references public.payment_transactions(id) on delete set null,
  amount_cents integer,
  status text,
  reason text,
  created_at timestamptz default now()
);

create table if not exists public.health_connections (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  provider text not null,
  status text default 'needs_configuration',
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  scopes text[] default '{}',
  consent_at timestamptz,
  revoked_at timestamptz,
  last_sync_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(student_id, provider)
);

create table if not exists public.health_permissions (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.health_connections(id) on delete cascade,
  data_type text not null,
  allowed boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.health_sync_logs (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid references public.health_connections(id) on delete cascade,
  trainer_id uuid references public.trainers(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  provider text,
  status text,
  message text,
  started_at timestamptz default now(),
  finished_at timestamptz
);

create table if not exists public.health_daily_metrics (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  provider text,
  metric_date date not null,
  steps integer,
  distance_meters numeric,
  active_calories numeric,
  avg_heart_rate integer,
  max_heart_rate integer,
  resting_heart_rate integer,
  active_minutes integer,
  sleep_minutes integer,
  sleep_quality text,
  stress_level text,
  recovery_score numeric,
  vo2_max numeric,
  training_load numeric,
  raw_payload jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(student_id, provider, metric_date)
);

create table if not exists public.health_workouts (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  provider text,
  external_id text,
  activity_type text,
  started_at timestamptz,
  duration_seconds integer,
  distance_meters numeric,
  calories numeric,
  avg_heart_rate integer,
  max_heart_rate integer,
  heart_rate_zones jsonb,
  raw_payload jsonb,
  created_at timestamptz default now(),
  unique(provider, external_id)
);

create table if not exists public.health_sleep (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  provider text,
  sleep_date date,
  minutes_total integer,
  minutes_deep integer,
  minutes_rem integer,
  minutes_awake integer,
  quality text,
  raw_payload jsonb,
  created_at timestamptz default now()
);

create table if not exists public.health_heart_rate (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  provider text,
  measured_at timestamptz,
  bpm integer,
  context text,
  created_at timestamptz default now()
);

create table if not exists public.health_goals (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  goal_type text not null,
  target_value numeric,
  unit text,
  period text default 'daily',
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  created_at timestamptz default now(),
  unique(trainer_id, student_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  sender_role text not null,
  body text,
  media_path text,
  message_type text default 'text',
  read_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid references public.trainers(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text,
  type text,
  read_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references public.trainers(id) on delete cascade,
  name text not null,
  trigger_type text not null,
  action_type text not null,
  config jsonb default '{}',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.automation_logs (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid references public.automation_rules(id) on delete set null,
  trainer_id uuid references public.trainers(id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  status text,
  message text,
  created_at timestamptz default now()
);

-- FK circular pós-criação
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'exercise_videos_workout_fk') then
    alter table public.exercise_videos
      add constraint exercise_videos_workout_fk foreign key (workout_id) references public.workouts(id) on delete cascade;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'exercise_videos_workout_exercise_fk') then
    alter table public.exercise_videos
      add constraint exercise_videos_workout_exercise_fk foreign key (workout_exercise_id) references public.workout_exercises(id) on delete cascade;
  end if;
end $$;

-- Updated_at triggers
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger trainers_updated before update on public.trainers for each row execute function public.set_updated_at();
create trigger subscriptions_updated before update on public.subscriptions for each row execute function public.set_updated_at();
create trigger students_updated before update on public.students for each row execute function public.set_updated_at();
create trigger exercises_updated before update on public.exercises for each row execute function public.set_updated_at();
create trigger workouts_updated before update on public.workouts for each row execute function public.set_updated_at();
create trigger workout_exercises_updated before update on public.workout_exercises for each row execute function public.set_updated_at();
create trigger habits_updated before update on public.habits for each row execute function public.set_updated_at();
create trigger appointments_updated before update on public.appointments for each row execute function public.set_updated_at();
create trigger student_charges_updated before update on public.student_charges for each row execute function public.set_updated_at();

-- Helpers de isolamento
create or replace function public.current_trainer_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.trainers where user_id = auth.uid() limit 1;
$$;

create or replace function public.current_student_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.students where user_id = auth.uid() limit 1;
$$;

create or replace function public.current_student_trainer_id()
returns uuid language sql stable security definer set search_path = public as $$
  select trainer_id from public.students where user_id = auth.uid() limit 1;
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.trainers enable row level security;
alter table public.subscriptions enable row level security;
alter table public.saas_payments enable row level security;
alter table public.students enable row level security;
alter table public.anamneses enable row level security;
alter table public.exercises enable row level security;
alter table public.exercise_videos enable row level security;
alter table public.video_upload_logs enable row level security;
alter table public.video_view_logs enable row level security;
alter table public.workout_templates enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_days enable row level security;
alter table public.workout_exercises enable row level security;
alter table public.workout_logs enable row level security;
alter table public.workout_feedbacks enable row level security;
alter table public.periodization_cycles enable row level security;
alter table public.periodization_weeks enable row level security;
alter table public.physical_assessments enable row level security;
alter table public.progress_photos enable row level security;
alter table public.student_metrics enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.food_logs enable row level security;
alter table public.availability_rules enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_exceptions enable row level security;
alter table public.appointment_status_logs enable row level security;
alter table public.trainer_payment_gateways enable row level security;
alter table public.trainer_receiver_accounts enable row level security;
alter table public.student_payment_plans enable row level security;
alter table public.student_charges enable row level security;
alter table public.student_subscriptions enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.platform_fees enable row level security;
alter table public.payouts enable row level security;
alter table public.refunds enable row level security;
alter table public.health_connections enable row level security;
alter table public.health_permissions enable row level security;
alter table public.health_sync_logs enable row level security;
alter table public.health_daily_metrics enable row level security;
alter table public.health_workouts enable row level security;
alter table public.health_sleep enable row level security;
alter table public.health_heart_rate enable row level security;
alter table public.health_goals enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.automation_rules enable row level security;
alter table public.automation_logs enable row level security;

-- Políticas principais. Service role ignora RLS para webhooks/checkouts.
create policy profiles_own on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy trainers_own on public.trainers for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy subscriptions_trainer on public.subscriptions for select using (trainer_id = public.current_trainer_id());
create policy saas_payments_trainer on public.saas_payments for select using (trainer_id = public.current_trainer_id());

create policy students_trainer_all on public.students for all using (trainer_id = public.current_trainer_id()) with check (trainer_id = public.current_trainer_id());
create policy students_student_select on public.students for select using (user_id = auth.uid());
create policy students_student_update on public.students for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Para quase todas as tabelas com trainer_id + student_id: trainer vê tudo dele; aluno vê apenas o próprio.
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'anamneses','workouts','workout_logs','workout_feedbacks','physical_assessments','progress_photos','student_metrics','habits','habit_logs','food_logs','appointments','student_charges','student_subscriptions','payment_transactions','health_connections','health_sync_logs','health_daily_metrics','health_workouts','health_sleep','health_heart_rate','health_goals','conversations','messages','notifications'
  ] loop
    execute format('create policy %I on public.%I for all using (trainer_id = public.current_trainer_id() or student_id = public.current_student_id()) with check (trainer_id = public.current_trainer_id() or student_id = public.current_student_id())', tbl || '_tenant', tbl);
  end loop;
end $$;

-- Tabelas apenas do personal
create policy exercises_tenant on public.exercises for all using (trainer_id = public.current_trainer_id()) with check (trainer_id = public.current_trainer_id());
create policy exercises_student_select on public.exercises for select using (exists(select 1 from public.workout_exercises we join public.workouts w on w.id = we.workout_id where we.exercise_id = exercises.id and w.student_id = public.current_student_id()));
create policy exercise_videos_tenant on public.exercise_videos for all using (trainer_id = public.current_trainer_id() or (trainer_id = public.current_student_trainer_id() and (student_id is null or student_id = public.current_student_id()))) with check (trainer_id = public.current_trainer_id() or (trainer_id = public.current_student_trainer_id() and (student_id is null or student_id = public.current_student_id())));
create policy video_upload_logs_tenant on public.video_upload_logs for all using (trainer_id = public.current_trainer_id()) with check (trainer_id = public.current_trainer_id());
create policy video_view_logs_tenant on public.video_view_logs for select using (trainer_id = public.current_trainer_id() or student_id = public.current_student_id());
create policy workout_templates_tenant on public.workout_templates for all using (trainer_id = public.current_trainer_id()) with check (trainer_id = public.current_trainer_id());
create policy workout_days_tenant on public.workout_days for all using (trainer_id = public.current_trainer_id() or exists(select 1 from public.workouts w where w.id = workout_id and w.student_id = public.current_student_id())) with check (trainer_id = public.current_trainer_id());
create policy workout_exercises_tenant on public.workout_exercises for all using (trainer_id = public.current_trainer_id() or exists(select 1 from public.workouts w where w.id = workout_id and w.student_id = public.current_student_id())) with check (trainer_id = public.current_trainer_id());
create policy periodization_cycles_tenant on public.periodization_cycles for all using (trainer_id = public.current_trainer_id() or student_id = public.current_student_id()) with check (trainer_id = public.current_trainer_id());
create policy periodization_weeks_tenant on public.periodization_weeks for select using (exists(select 1 from public.periodization_cycles c where c.id = cycle_id and (c.trainer_id = public.current_trainer_id() or c.student_id = public.current_student_id())));
create policy availability_rules_tenant on public.availability_rules for all using (trainer_id = public.current_trainer_id()) with check (trainer_id = public.current_trainer_id());
create policy appointment_exceptions_tenant on public.appointment_exceptions for all using (trainer_id = public.current_trainer_id()) with check (trainer_id = public.current_trainer_id());
create policy appointment_status_logs_tenant on public.appointment_status_logs for select using (exists(select 1 from public.appointments a where a.id = appointment_id and (a.trainer_id = public.current_trainer_id() or a.student_id = public.current_student_id())));
create policy trainer_payment_gateways_tenant on public.trainer_payment_gateways for all using (trainer_id = public.current_trainer_id()) with check (trainer_id = public.current_trainer_id());
create policy trainer_receiver_accounts_tenant on public.trainer_receiver_accounts for all using (trainer_id = public.current_trainer_id()) with check (trainer_id = public.current_trainer_id());
create policy student_payment_plans_tenant on public.student_payment_plans for all using (trainer_id = public.current_trainer_id()) with check (trainer_id = public.current_trainer_id());
create policy health_permissions_tenant on public.health_permissions for select using (exists(select 1 from public.health_connections h where h.id = connection_id and (h.trainer_id = public.current_trainer_id() or h.student_id = public.current_student_id())));
create policy automation_rules_tenant on public.automation_rules for all using (trainer_id = public.current_trainer_id()) with check (trainer_id = public.current_trainer_id());
create policy automation_logs_tenant on public.automation_logs for all using (trainer_id = public.current_trainer_id() or student_id = public.current_student_id()) with check (trainer_id = public.current_trainer_id());
create policy platform_fees_tenant on public.platform_fees for select using (trainer_id = public.current_trainer_id());
create policy payouts_tenant on public.payouts for select using (trainer_id = public.current_trainer_id());
create policy refunds_tenant on public.refunds for select using (trainer_id = public.current_trainer_id());

-- Buckets privados
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('trainer-videos', 'trainer-videos', false, 262144000, array['video/mp4','video/quicktime','video/webm'])
on conflict (id) do update set public = false;

-- Upload direto pelo personal somente na pasta do seu trainer_id.
create policy trainer_video_upload on storage.objects for insert to authenticated
with check (
  bucket_id = 'trainer-videos'
  and (storage.foldername(name))[1] = public.current_trainer_id()::text
);

create policy trainer_video_update on storage.objects for update to authenticated
using (
  bucket_id = 'trainer-videos'
  and (storage.foldername(name))[1] = public.current_trainer_id()::text
)
with check (
  bucket_id = 'trainer-videos'
  and (storage.foldername(name))[1] = public.current_trainer_id()::text
);

create policy trainer_video_delete on storage.objects for delete to authenticated
using (
  bucket_id = 'trainer-videos'
  and (storage.foldername(name))[1] = public.current_trainer_id()::text
);

create policy trainer_video_select on storage.objects for select to authenticated
using (
  bucket_id = 'trainer-videos'
  and (
    (storage.foldername(name))[1] = public.current_trainer_id()::text
    or (storage.foldername(name))[1] = public.current_student_trainer_id()::text
  )
);

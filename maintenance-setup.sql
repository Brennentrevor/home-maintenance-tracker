-- Our Magical Maintenance — Supabase setup (idempotent; safe to re-run).
-- All objects prefixed maint_ because this project is shared with another app.
-- No open sign-up: only users listed in maint_members can read/write maint data.

create extension if not exists pgcrypto;

create table if not exists public.maint_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text
);

create or replace function public.maint_is_member()
returns boolean language sql security definer stable
set search_path = public
as $$
  select exists (select 1 from public.maint_members m where m.user_id = auth.uid());
$$;
grant execute on function public.maint_is_member() to authenticated;

create table if not exists public.maint_tasks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'home' check (category in ('home','car')),
  interval_value numeric,
  interval_unit text check (interval_unit in ('days','weeks','months','miles')),
  alt_interval_miles integer,
  last_done date,
  last_done_miles integer,
  first_due date,
  notes text,
  calendar_event_id text,
  created_by text,
  updated_by text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.maint_tasks add column if not exists updated_by text;

create table if not exists public.maint_completions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.maint_tasks(id) on delete cascade,
  done_on date not null default current_date,
  odometer integer,
  notes text,
  done_by text,
  created_at timestamptz not null default now()
);
create index if not exists maint_completions_task_idx on public.maint_completions(task_id, done_on desc);

create table if not exists public.maint_settings (
  key text primary key,
  value text
);

-- keep updated_at fresh
create or replace function public.maint_touch() returns trigger language plpgsql
set search_path = public as $$
begin new.updated_at := now(); return new; end; $$;
drop trigger if exists maint_tasks_touch on public.maint_tasks;
create trigger maint_tasks_touch before update on public.maint_tasks
  for each row execute function public.maint_touch();

-- RLS
alter table public.maint_members     enable row level security;
alter table public.maint_tasks       enable row level security;
alter table public.maint_completions enable row level security;
alter table public.maint_settings    enable row level security;

drop policy if exists maint_members_select on public.maint_members;
create policy maint_members_select on public.maint_members
  for select to authenticated using (public.maint_is_member());
-- (no insert/update/delete policy on members: manage them via SQL editor only)

do $$
declare t text; op text;
begin
  foreach t in array array['maint_tasks','maint_completions','maint_settings'] loop
    foreach op in array array['select','insert','update','delete'] loop
      execute format('drop policy if exists %I on public.%I', t||'_'||op, t);
      if op = 'select' or op = 'delete' then
        execute format('create policy %I on public.%I for %s to authenticated using (public.maint_is_member())', t||'_'||op, t, op);
      elsif op = 'insert' then
        execute format('create policy %I on public.%I for insert to authenticated with check (public.maint_is_member())', t||'_'||op, t);
      else
        execute format('create policy %I on public.%I for update to authenticated using (public.maint_is_member()) with check (public.maint_is_member())', t||'_'||op, t);
      end if;
    end loop;
  end loop;
end $$;

-- Realtime publication (guarded)
do $$
declare t text;
begin
  foreach t in array array['maint_tasks','maint_completions','maint_settings'] loop
    if not exists (select 1 from pg_publication_tables
                   where pubname='supabase_realtime' and schemaname='public' and tablename=t) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- Starter tasks (only when empty). first_due staggered so the dashboard shows a mix.
insert into public.maint_tasks (name, category, interval_value, interval_unit, alt_interval_miles, first_due, notes, created_by)
select * from (values
  ('Furnace filter / vent cleaning','home',3,'months',null::int,current_date - 5,'Replace filter; vacuum supply & return vents.'),
  ('Roborock robot vacuum clean-out / maintenance','home',2,'weeks',null,current_date + 3,'Empty bin, wash filter, clean brushes & sensors, replace parts as worn.'),
  ('Kia: Oil change','car',6,'months',5000,current_date + 20,'Synthetic: 5,000–7,500 mi.'),
  ('Kia: Windshield wipers','car',6,'months',null,current_date + 45,'Replace every 6–12 months.'),
  ('Kia: Tire rotation / pressure check','car',6,'months',null,current_date - 2,'Check pressure monthly too (door-jamb sticker PSI).'),
  ('HVAC service','home',12,'months',null,current_date + 60,'Annual professional tune-up before cooling/heating season.'),
  ('Smoke & CO detector batteries','home',12,'months',null,current_date + 10,'Test every alarm after replacing.'),
  ('Gutter cleaning','home',6,'months',null,current_date + 25,'Twice yearly — spring and fall.'),
  ('Water heater flush','home',12,'months',null,current_date + 90,'Drain sediment; check anode rod every few years.'),
  ('Dryer vent cleaning','home',12,'months',null,current_date + 120,'Clean duct to exterior; fire safety.'),
  ('Test sump pump / GFCI outlets','home',6,'months',null,current_date + 7,'Pour water in pit; press TEST/RESET on GFCIs.'),
  ('Replace fridge water filter','home',6,'months',null,current_date + 75,null),
  ('Kia: Battery & terminals check','car',12,'months',null,current_date + 150,'Clean corrosion; test before winter.'),
  ('Kia: Cabin air filter','car',12,'months',null,current_date + 100,null),
  ('Kia: Engine air filter','car',12,'months',null,current_date + 180,null),
  ('Kia: Brake inspection','car',12,'months',null,current_date + 200,'Pads, rotors, fluid.'),
  ('Check/refresh fire extinguisher','home',12,'months',null,current_date + 40,'Gauge in green; shake/invert dry-chem units.'),
  ('Exterior inspection (roof, siding, caulk)','home',12,'months',null,current_date + 160,'Also pressure-wash / seal deck or driveway as needed.')
) as v(name, category, interval_value, interval_unit, alt_interval_miles, first_due, notes)
cross join (select 'Setup'::text as created_by) c
where not exists (select 1 from public.maint_tasks);

-- =====================================================================
-- MEMBERS. First create the two users in Dashboard > Authentication > Users
-- > "Add user" (tick Auto Confirm):
--   brennen@homemaint.example  password: homemaint-<Brennen's PIN>
--   hope@homemaint.example     password: homemaint-<Hope's PIN>
-- Manual example:
--   insert into public.maint_members (user_id, display_name)
--   values ('<uuid from auth.users>', 'Brennen');
-- Ready-to-run (after the users exist):
insert into public.maint_members (user_id, display_name)
select id, initcap(split_part(email,'@',1)) from auth.users
where email in ('brennen@homemaint.example','hope@homemaint.example')
on conflict do nothing;

-- Vehicles: there is no vehicle column. A car task belongs to a vehicle by its name prefix
-- ("Kia: ..." or "Hyundai: ..."). Seed above lists Kia rows; duplicate them for the Hyundai:
-- insert into maint_tasks (name,category,interval_value,interval_unit,alt_interval_miles,first_due,notes)
--   select replace(name,'Kia: ','Hyundai: '),category,interval_value,interval_unit,alt_interval_miles,first_due + 7,notes
--   from maint_tasks where name like 'Kia: %';
-- Per-vehicle odometers live in maint_settings keys odometer_kia / odometer_hyundai
-- (legacy key 'odometer' is used as a fallback).

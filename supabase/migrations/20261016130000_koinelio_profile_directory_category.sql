-- Separate self-reported directory category from trusted campus_role.
-- campus_role remains protected by guard_profile_privileged_fields and trusted workflows.
begin;

alter table public.profiles
  add column if not exists profile_category text not null default 'student';

do $profile_category_constraint$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_profile_category_allowed'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_profile_category_allowed
      check (profile_category in ('student', 'alumni'));
  end if;
end;
$profile_category_constraint$;

-- Preserve any previously assigned trusted alumni classification as a directory opt-in.
update public.profiles
set profile_category = 'alumni'
where campus_role = 'alumni'
  and graduation_year is not null
  and graduation_year <= extract(year from current_date)::integer;

commit;

-- Koinelio schema expansion (non-destructive).
-- Extends existing core tables and adds the main product-domain tables.

create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 160),
  slug text not null unique,
  email_domain text,
  website text,
  approval_status text not null default 'pending'
    check (approval_status in ('pending', 'verified', 'suspended', 'rejected')),
  requested_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists institution_id uuid references public.institutions(id) on delete set null,
  add column if not exists campus_role text not null default 'student'
    check (campus_role in ('student', 'faculty', 'alumni')),
  add column if not exists degree_program text,
  add column if not exists batch_year smallint check (batch_year between 1900 and 2200),
  add column if not exists graduation_year smallint check (graduation_year between 1900 and 2200),
  add column if not exists avatar_url text,
  add column if not exists skills text[] not null default '{}',
  add column if not exists interests text[] not null default '{}',
  add column if not exists verification_status text not null default 'pending'
    check (verification_status in ('pending', 'verified', 'rejected'));

alter table public.clubs
  add column if not exists institution_id uuid references public.institutions(id) on delete set null,
  add column if not exists approval_status text not null default 'pending'
    check (approval_status in ('draft', 'pending', 'approved', 'rejected', 'suspended')),
  add column if not exists category text,
  add column if not exists logo_url text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.club_memberships
  alter column status set default 'pending';

alter table public.posts
  add column if not exists visibility text not null default 'campus'
    check (visibility in ('public', 'campus', 'club')),
  add column if not exists moderation_status text not null default 'published'
    check (moderation_status in ('published', 'hidden', 'removed')),
  add column if not exists media_url text,
  add column if not exists updated_at timestamptz not null default now();

alter table public.events
  add column if not exists institution_id uuid references public.institutions(id) on delete set null,
  add column if not exists status text not null default 'draft'
    check (status in ('draft', 'published', 'cancelled', 'completed')),
  add column if not exists ends_at timestamptz,
  add column if not exists capacity integer check (capacity is null or capacity > 0),
  add column if not exists category text,
  add column if not exists banner_url text,
  add column if not exists updated_at timestamptz not null default now();

-- Career and portfolio data.
create table if not exists public.career_experiences (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  organization text not null check (char_length(trim(organization)) between 1 and 160),
  title text not null check (char_length(trim(title)) between 1 and 160),
  employment_type text,
  location text,
  description text not null default '',
  start_date date,
  end_date date,
  is_current boolean not null default false,
  visibility text not null default 'campus'
    check (visibility in ('public', 'campus', 'private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint career_dates_valid check (end_date is null or start_date is null or end_date >= start_date)
);

create table if not exists public.student_projects (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 180),
  description text not null default '',
  project_url text,
  repository_url text,
  skills text[] not null default '{}',
  visibility text not null default 'campus'
    check (visibility in ('public', 'campus', 'private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Institution affiliation and privileged-role approval workflows.
create table if not exists public.institution_affiliation_requests (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'withdrawn')),
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  unique (institution_id, user_id)
);

create table if not exists public.institution_roles (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null
    check (role in ('institution_admin', 'technical_gs', 'cultural_gs', 'moderator', 'club_coordinator')),
  club_id uuid references public.clubs(id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'suspended', 'revoked')),
  granted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint institution_role_club_scope check (
    (role = 'club_coordinator' and club_id is not null)
    or (role <> 'club_coordinator' and club_id is null)
  )
);

create unique index if not exists institution_roles_unique_scoped_idx
  on public.institution_roles (institution_id, user_id, role, coalesce(club_id, '00000000-0000-0000-0000-000000000000'::uuid));

create table if not exists public.institution_role_requests (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  requested_role text not null
    check (requested_role in ('institution_admin', 'technical_gs', 'cultural_gs', 'moderator', 'club_coordinator')),
  club_id uuid references public.clubs(id) on delete cascade,
  rationale text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'withdrawn')),
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  constraint requested_role_club_scope check (
    (requested_role = 'club_coordinator' and club_id is not null)
    or (requested_role <> 'club_coordinator' and club_id is null)
  )
);

-- Club recruitment pipeline.
create table if not exists public.recruitment_drives (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(trim(title)) between 1 and 180),
  description text not null default '',
  eligibility text not null default '',
  application_questions jsonb not null default '[]'::jsonb,
  deadline timestamptz,
  status text not null default 'draft'
    check (status in ('draft', 'open', 'closed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recruitment_applications (
  id uuid primary key default gen_random_uuid(),
  drive_id uuid not null references public.recruitment_drives(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  status text not null default 'submitted'
    check (status in ('submitted', 'under_review', 'shortlisted', 'rejected', 'selected', 'withdrawn')),
  reviewer_notes text not null default '',
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (drive_id, applicant_id)
);

create table if not exists public.recruitment_interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.recruitment_applications(id) on delete cascade,
  scheduled_at timestamptz not null,
  mode text not null check (mode in ('online', 'offline')),
  meeting_url text,
  location text,
  message text not null default '',
  status text not null default 'scheduled'
    check (status in ('scheduled', 'rescheduled', 'cancelled', 'completed')),
  outcome text not null default 'pending'
    check (outcome in ('pending', 'passed', 'not_selected', 'no_show')),
  interviewer_id uuid references public.profiles(id) on delete set null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint interview_location_valid check (
    (mode = 'online' and meeting_url is not null and char_length(trim(meeting_url)) > 0)
    or (mode = 'offline' and location is not null and char_length(trim(location)) > 0)
  )
);

-- Event registration and attendance.
create table if not exists public.event_registrations (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'registered'
    check (status in ('registered', 'cancelled', 'attended', 'no_show')),
  registered_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- Social feed extensions.
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 3000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.saved_posts (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  title text not null check (char_length(trim(title)) between 1 and 180),
  body text not null check (char_length(trim(body)) between 1 and 10000),
  priority text not null default 'normal'
    check (priority in ('normal', 'important', 'urgent')),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint announcement_dates_valid check (expires_at is null or published_at is null or expires_at > published_at)
);

-- Private direct and group messaging.
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete restrict,
  kind text not null default 'direct' check (kind in ('direct', 'group')),
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 5000),
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

-- Performance indexes for common feed, profile, and workflow queries.
create index if not exists profiles_institution_idx on public.profiles (institution_id);
create index if not exists clubs_institution_status_idx on public.clubs (institution_id, approval_status);
create index if not exists club_memberships_user_status_idx on public.club_memberships (user_id, status);
create index if not exists posts_visibility_created_idx on public.posts (visibility, created_at desc);
create index if not exists career_experiences_profile_idx on public.career_experiences (profile_id, start_date desc);
create index if not exists student_projects_profile_idx on public.student_projects (profile_id, created_at desc);
create index if not exists affiliation_requests_institution_status_idx on public.institution_affiliation_requests (institution_id, status);
create index if not exists role_requests_institution_status_idx on public.institution_role_requests (institution_id, status);
create index if not exists recruitment_drives_club_status_idx on public.recruitment_drives (club_id, status, deadline);
create index if not exists recruitment_applications_applicant_idx on public.recruitment_applications (applicant_id, submitted_at desc);
create index if not exists recruitment_interviews_scheduled_idx on public.recruitment_interviews (scheduled_at);
create index if not exists event_registrations_user_idx on public.event_registrations (user_id, registered_at desc);
create index if not exists post_comments_post_created_idx on public.post_comments (post_id, created_at);
create index if not exists announcements_institution_status_idx on public.announcements (institution_id, status, published_at desc);
create index if not exists messages_conversation_created_idx on public.messages (conversation_id, created_at desc);

-- RLS is enabled immediately on all new tables; policies are installed in the next migration.
alter table public.institutions enable row level security;
alter table public.career_experiences enable row level security;
alter table public.student_projects enable row level security;
alter table public.institution_affiliation_requests enable row level security;
alter table public.institution_roles enable row level security;
alter table public.institution_role_requests enable row level security;
alter table public.recruitment_drives enable row level security;
alter table public.recruitment_applications enable row level security;
alter table public.recruitment_interviews enable row level security;
alter table public.event_registrations enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.saved_posts enable row level security;
alter table public.announcements enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

grant select, insert, update, delete on public.institutions to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.clubs to authenticated;
grant select, insert, update, delete on public.club_memberships to authenticated;
grant select, insert, update, delete on public.posts to authenticated;
grant select, insert, update, delete on public.events to authenticated;
grant select, insert, update, delete on public.notifications to authenticated;
grant select, insert, update, delete on public.career_experiences to authenticated;
grant select, insert, update, delete on public.student_projects to authenticated;
grant select, insert, update, delete on public.institution_affiliation_requests to authenticated;
grant select, insert, update, delete on public.institution_roles to authenticated;
grant select, insert, update, delete on public.institution_role_requests to authenticated;
grant select, insert, update, delete on public.recruitment_drives to authenticated;
grant select, insert, update, delete on public.recruitment_applications to authenticated;
grant select, insert, update, delete on public.recruitment_interviews to authenticated;
grant select, insert, update, delete on public.event_registrations to authenticated;
grant select, insert, update, delete on public.post_comments to authenticated;
grant select, insert, update, delete on public.post_likes to authenticated;
grant select, insert, update, delete on public.saved_posts to authenticated;
grant select, insert, update, delete on public.announcements to authenticated;
grant select, insert, update, delete on public.conversations to authenticated;
grant select, insert, update, delete on public.conversation_members to authenticated;
grant select, insert, update, delete on public.messages to authenticated;

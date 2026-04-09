create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  full_name text,
  phone text,
  role text not null default 'organiser' check (role in ('organiser', 'admin')),
  is_premium boolean not null default false,
  premium_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles (id) on delete set null,
  slug text unique not null,
  name text not null,
  teaser text,
  location text not null,
  county text,
  region text,
  postcode text,
  address text not null,
  description text not null,
  days_of_week text[] not null default '{}',
  next_event_date timestamptz,
  start_time text not null,
  end_time text not null,
  car_price numeric(10,2) not null default 0,
  van_price numeric(10,2) not null default 0,
  free_parking boolean not null default true,
  parking_fee numeric(10,2),
  venue_type text,
  organiser_name text,
  organiser_email text not null,
  organiser_phone text not null,
  show_email boolean not null default true,
  show_phone boolean not null default true,
  latitude double precision,
  longitude double precision,
  what3words text,
  event_announcement text,
  images text[] not null default '{}',
  social_links jsonb not null default '{}'::jsonb,
  is_featured boolean not null default false,
  is_verified boolean not null default false,
  listing_tier text not null default 'free' check (listing_tier in ('free', 'premium')),
  status text not null default 'pending' check (status in ('pending', 'active', 'expired', 'paused')),
  has_toilets boolean,
  has_hot_food boolean,
  has_cold_drinks boolean,
  has_indoor_stalls boolean,
  has_disabled_access boolean,
  has_rubbish_bins boolean,
  has_first_aid boolean,
  has_kids_activities boolean,
  pets_allowed boolean,
  has_catering boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive',
  renews_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null,
  category text not null,
  seo_description text not null,
  reading_time text not null,
  hero_image text not null,
  content jsonb not null default '[]'::jsonb,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists admin_notes (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings (id) on delete cascade,
  author_id uuid references profiles (id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists email_reminders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings (id) on delete cascade,
  due_at timestamptz not null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table listings enable row level security;
alter table subscriptions enable row level security;
alter table blog_posts enable row level security;
alter table admin_notes enable row level security;
alter table email_reminders enable row level security;

create policy "profiles_self_read"
on profiles for select
using (auth.uid() = id);

create policy "profiles_self_update"
on profiles for update
using (auth.uid() = id);

create policy "listings_public_read"
on listings for select
using (true);

create policy "listings_owner_write"
on listings for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "subscriptions_owner_read"
on subscriptions for select
using (auth.uid() = profile_id);

create policy "blog_public_read"
on blog_posts for select
using (true);

create policy "email_reminders_owner_read"
on email_reminders for select
using (
  exists (
    select 1 from listings where listings.id = email_reminders.listing_id and listings.owner_id = auth.uid()
  )
);

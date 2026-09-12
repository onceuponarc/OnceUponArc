-- OnceUpon schema (Chapter 11). Isolated project — do not apply to other products.
create extension if not exists "pgcrypto";
create extension if not exists "citext";

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  x_user_id text unique not null,
  handle citext unique not null,
  display_name text not null,
  bio text not null default '',
  portrait_url text,
  storage_portrait_path text,
  created_at timestamptz not null default now(),
  last_login_at timestamptz not null default now(),
  is_staff boolean not null default false
);

create table public.handle_aliases (
  handle citext primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  retired_at timestamptz not null default now()
);

create table public.user_wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  chain_caip2 text not null default 'eip155:5042002',
  address text not null,
  is_primary boolean not null default false,
  verified_at timestamptz,
  verify_sig text,
  unique (chain_caip2, address)
);

create unique index user_wallets_one_primary_per_user
  on public.user_wallets (user_id)
  where is_primary;

create type public.engine as enum ('author', 'onceuponers');
create type public.pair_class as enum (
  'usdc','eurc','sol','btc','rwa_equity','rwa_other','story','other'
);
create type public.binding_kind as enum (
  'amm_v2','amm_v3','bonding_curve','pond','pump_fun','jupiter','linked_other'
);
create type public.story_status as enum (
  'draft','live','graduated','paused','archived'
);

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  opens_at timestamptz,
  closes_at timestamptz,
  featured_story_id uuid
);

create table public.rwa_issuers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  website text,
  allowed boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  onchain_story_id text unique,
  slug citext unique not null,
  title text not null,
  ticker citext not null,
  blurb text not null default '',
  cover_url text,
  jacket_url text,
  author_user_id uuid not null references public.users(id),
  author_wallet text not null,
  engine public.engine not null,
  status public.story_status not null default 'draft',
  token_address text,
  vault_address text,
  fee_recipient text,
  author_bps int not null check (author_bps >= 0 and author_bps <= 300),
  protocol_bps int not null default 20,
  quote_address text,
  pair_class public.pair_class not null default 'usdc',
  pair_label text not null default 'USDC',
  rwa_issuer text,
  rwa_ref text,
  supply numeric(78,0),
  decimals int not null default 18,
  chapter_id uuid references public.chapters(id),
  rights_attested boolean not null default false,
  created_tx text,
  created_at timestamptz not null default now(),
  constraint stories_author_mode_bps check (
    (engine = 'author' and author_bps <= 300)
    or (engine = 'onceuponers' and author_bps <= 100)
  )
);

alter table public.chapters
  add constraint chapters_featured_story_fk
  foreign key (featured_story_id) references public.stories(id);

create table public.bindings (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  kind public.binding_kind not null,
  is_primary boolean not null default false,
  chain_caip2 text not null,
  pool_address text not null,
  quote_address text,
  dest_token_mint text,
  mechanism text,
  fee_routing text not null default 'arc_only',
  proof_url text,
  depth_usd numeric(20,2),
  created_tx text,
  verified_at timestamptz,
  unique (chain_caip2, pool_address)
);

create table public.fee_events (
  id bigserial primary key,
  story_id uuid not null references public.stories(id),
  tx_hash text not null,
  log_index int not null,
  block_number bigint not null,
  swapper text,
  asset text not null,
  author_amount numeric(78,0) not null default 0,
  vault_amount numeric(78,0) not null default 0,
  protocol_amount numeric(78,0) not null default 0,
  created_at timestamptz not null default now(),
  unique (tx_hash, log_index)
);

create table public.piece_claims (
  id bigserial primary key,
  story_id uuid not null references public.stories(id),
  user_id uuid references public.users(id),
  wallet text not null,
  tx_hash text not null unique,
  asset text not null,
  amount numeric(78,0) not null,
  claimed_at timestamptz not null default now()
);

create table public.trades (
  id bigserial primary key,
  story_id uuid not null references public.stories(id),
  binding_id uuid references public.bindings(id),
  tx_hash text not null,
  log_index int not null,
  trader text,
  side text not null check (side in ('buy','sell')),
  token_in text,
  token_out text,
  amount_in numeric(78,0),
  amount_out numeric(78,0),
  price_usd numeric(30,10),
  block_number bigint,
  traded_at timestamptz not null default now(),
  unique (tx_hash, log_index)
);

create table public.margin_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  venue text not null default 'jupiter',
  market text not null,
  side text not null check (side in ('long','short')),
  leverage numeric(8,2),
  size_usd numeric(20,2),
  referral_code text,
  created_at timestamptz not null default now()
);

create table public.pair_watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  wanted_label text not null,
  pair_class public.pair_class not null,
  created_at timestamptz not null default now()
);

create table public.follows (
  follower uuid not null references public.users(id),
  story_id uuid not null references public.stories(id),
  created_at timestamptz not null default now(),
  primary key (follower, story_id)
);

create table public.staff_audit_log (
  id bigserial primary key,
  staff_user_id uuid not null references public.users(id),
  action text not null,
  target text,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index on public.stories (status, created_at desc);
create index on public.stories (author_user_id);
create index on public.bindings (story_id);
create index on public.fee_events (story_id, block_number desc);
create index on public.trades (story_id, traded_at desc);
create index on public.piece_claims (story_id, wallet);
create index on public.users (last_login_at desc);

-- Identity: first X login upserts public.users. Handle changes keep aliases.
create or replace function public.sync_onceuponer_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  handle_raw text;
  handle_clean citext;
  display text;
  bio text;
  avatar text;
  xid text;
  old_handle citext;
begin
  xid := coalesce(
    meta->>'provider_id',
    meta->>'sub',
    meta->>'user_id',
    new.id::text
  );

  handle_raw := coalesce(
    nullif(meta->>'user_name', ''),
    nullif(meta->>'preferred_username', ''),
    nullif(meta->>'screen_name', ''),
    split_part(coalesce(new.email, ''), '@', 1),
    'onceuponer'
  );
  handle_clean := regexp_replace(lower(handle_raw), '[^a-z0-9_]', '', 'g');
  if handle_clean = '' then
    handle_clean := 'onceuponer';
  end if;

  display := coalesce(
    nullif(meta->>'full_name', ''),
    nullif(meta->>'name', ''),
    handle_raw
  );
  bio := coalesce(meta->>'bio', meta->>'description', '');
  avatar := coalesce(meta->>'avatar_url', meta->>'picture', null);

  select u.handle into old_handle from public.users u where u.id = new.id;

  if old_handle is not null and old_handle <> handle_clean then
    insert into public.handle_aliases (handle, user_id)
    values (old_handle, new.id)
    on conflict (handle) do update set user_id = excluded.user_id, retired_at = now();
  end if;

  insert into public.users (
    id, x_user_id, handle, display_name, bio, portrait_url, last_login_at
  )
  values (
    new.id, xid, handle_clean, display, bio, avatar, now()
  )
  on conflict (id) do update set
    x_user_id = excluded.x_user_id,
    handle = excluded.handle,
    display_name = excluded.display_name,
    bio = excluded.bio,
    portrait_url = coalesce(public.users.storage_portrait_path, excluded.portrait_url),
    last_login_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute function public.sync_onceuponer_from_auth();

-- Storage buckets for portraits and story art
insert into storage.buckets (id, name, public)
values
  ('portraits', 'portraits', true),
  ('covers', 'covers', true)
on conflict (id) do nothing;

alter table public.users enable row level security;
alter table public.handle_aliases enable row level security;
alter table public.user_wallets enable row level security;
alter table public.chapters enable row level security;
alter table public.rwa_issuers enable row level security;
alter table public.stories enable row level security;
alter table public.bindings enable row level security;
alter table public.fee_events enable row level security;
alter table public.piece_claims enable row level security;
alter table public.trades enable row level security;
alter table public.margin_intents enable row level security;
alter table public.pair_watchlist enable row level security;
alter table public.follows enable row level security;
alter table public.staff_audit_log enable row level security;

create policy "public read users" on public.users for select using (true);
create policy "self update users" on public.users
  for update using (auth.uid() = id);

create policy "public read handle aliases" on public.handle_aliases for select using (true);

create policy "own wallets read" on public.user_wallets
  for select using (auth.uid() = user_id);
create policy "own wallets write" on public.user_wallets
  for insert with check (auth.uid() = user_id);
create policy "own wallets update" on public.user_wallets
  for update using (auth.uid() = user_id);

create policy "public read chapters" on public.chapters for select using (true);
create policy "public read rwa issuers" on public.rwa_issuers
  for select using (allowed = true);

create policy "public read live stories" on public.stories
  for select using (status in ('live','graduated','paused') or auth.uid() = author_user_id);
create policy "author insert draft" on public.stories
  for insert with check (auth.uid() = author_user_id and status = 'draft');
create policy "author update draft" on public.stories
  for update using (auth.uid() = author_user_id and status = 'draft');

create policy "public read bindings" on public.bindings for select using (true);
create policy "author insert bindings" on public.bindings
  for insert with check (
    exists (
      select 1 from public.stories s
      where s.id = story_id and s.author_user_id = auth.uid()
    )
  );

create policy "public read fee events" on public.fee_events for select using (true);
create policy "public read trades" on public.trades for select using (true);

create policy "own claims read" on public.piece_claims
  for select using (auth.uid() = user_id or user_id is null);
create policy "public read claims" on public.piece_claims for select using (true);

create policy "own intents" on public.margin_intents
  for select using (auth.uid() = user_id);
create policy "own intents insert" on public.margin_intents
  for insert with check (auth.uid() = user_id);

create policy "own watchlist" on public.pair_watchlist
  for select using (auth.uid() = user_id);
create policy "own watchlist insert" on public.pair_watchlist
  for insert with check (auth.uid() = user_id);

create policy "public read follows" on public.follows for select using (true);
create policy "own follow insert" on public.follows
  for insert with check (auth.uid() = follower);
create policy "own follow delete" on public.follows
  for delete using (auth.uid() = follower);

create policy "staff read audit" on public.staff_audit_log
  for select using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.is_staff)
  );

create policy "public read portraits" on storage.objects
  for select using (bucket_id in ('portraits', 'covers'));
create policy "auth upload portraits" on storage.objects
  for insert with check (
    bucket_id = 'portraits'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "auth upload covers" on storage.objects
  for insert with check (
    bucket_id = 'covers'
    and auth.role() = 'authenticated'
  );

insert into public.chapters (slug, title, opens_at)
values (
  'the-first-chapter',
  'The First Chapter',
  timestamptz '2026-09-16 00:00:00+00'
)
on conflict (slug) do nothing;

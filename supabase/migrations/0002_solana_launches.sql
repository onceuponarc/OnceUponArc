-- Solana launchpad: encrypted embedded wallets + live launch fields.
-- Secrets tables have RLS on and no policies, so only the service role can read ciphertext.

create table if not exists public.wallet_secrets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  chain text not null,
  address text not null,
  ciphertext text not null,
  created_at timestamptz not null default now(),
  unique (user_id, chain)
);

alter table public.wallet_secrets enable row level security;

create table if not exists public.curve_secrets (
  story_id uuid primary key references public.stories(id) on delete cascade,
  address text not null,
  ciphertext text not null
);

alter table public.curve_secrets enable row level security;

alter table public.user_wallets
  add column if not exists kind text not null default 'external';

alter table public.stories
  add column if not exists chain text not null default 'solana';

alter table public.stories
  add column if not exists venue text not null default 'spl';

alter table public.stories
  add column if not exists quote_mint text;

alter table public.stories
  add column if not exists reward_mint text;

alter table public.stories
  add column if not exists auto_buy_rewards boolean not null default false;

alter table public.stories
  add column if not exists curve_quote_lamports numeric(20,0) not null default 0;

alter table public.stories
  add column if not exists curve_token_raw numeric(78,0) not null default 0;

alter table public.stories
  add column if not exists mint_decimals int not null default 6;

alter table public.stories
  add column if not exists snipe_tax_bps int not null default 0;

alter table public.stories
  add column if not exists reward_vault_lamports numeric(20,0) not null default 0;

create index if not exists stories_chain_status_idx on public.stories (chain, status, created_at desc);

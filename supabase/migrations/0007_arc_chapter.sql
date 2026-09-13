-- Chapter Curve columns (0006) plus Arc-native Chapter fields.
-- Idempotent: live OnceUpon already has 0002–0005 columns without schema_migrations rows.

alter table public.stories
  add column if not exists virtual_base_raw numeric(78,0);

alter table public.stories
  add column if not exists lp_base_reserved_raw numeric(78,0);

alter table public.stories
  add column if not exists curve_k numeric(78,0);

-- Arc Chapter Curve contract address. Solana Stories keep the vault in vault_address.
alter table public.stories
  add column if not exists curve_address text;

-- Unsigned Arc Devnet prints are allowed. Service role writes them. RLS still blocks anon inserts.
alter table public.stories
  alter column author_user_id drop not null;

create index if not exists stories_curve_address_idx
  on public.stories (curve_address)
  where curve_address is not null;

create index if not exists trades_traded_at_idx
  on public.trades (traded_at desc);

comment on column public.stories.curve_address is
  'Arc ChapterCurve address. On Solana this stays null and vault_address is the curve vault.';

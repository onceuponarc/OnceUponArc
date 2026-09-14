-- Desk wallets: one embedded key per user per chain.
-- Existing wallet_secrets rows stay. New chains are solana / eth / rh.
alter table if exists wallet_secrets
  add column if not exists chain text;

create unique index if not exists wallet_secrets_user_chain
  on wallet_secrets (user_id, chain);

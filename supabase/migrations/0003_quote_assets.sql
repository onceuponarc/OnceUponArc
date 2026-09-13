-- Quote-aware bonding: store quote decimals, virtual reserves, and graduation in quote units.
alter table public.stories
  add column if not exists quote_decimals int not null default 9;

alter table public.stories
  add column if not exists virtual_quote_raw numeric(78,0) not null default 30000000000;

alter table public.stories
  add column if not exists graduation_quote_raw numeric(78,0) not null default 2000000000;

insert into public.rwa_issuers (name, website, allowed)
values
  ('Backed', 'https://backed.fi', true),
  ('Ondo', 'https://ondo.finance', true),
  ('Circle', 'https://www.circle.com', true),
  ('Tether', 'https://tether.to', true),
  ('PayPal', 'https://www.paypal.com', true)
on conflict (name) do nothing;

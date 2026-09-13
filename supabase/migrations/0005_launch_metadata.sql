-- Pump.fun-style launch fields: socials, IPFS image, on-chain metadata URI.
alter table public.stories
  add column if not exists twitter_url text;

alter table public.stories
  add column if not exists telegram_url text;

alter table public.stories
  add column if not exists website_url text;

alter table public.stories
  add column if not exists image_uri text;

alter table public.stories
  add column if not exists metadata_uri text;

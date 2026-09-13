-- Allow many Stories to share a deep quote pool. Uniqueness is per Story.
alter table public.bindings drop constraint if exists bindings_chain_caip2_pool_address_key;
drop index if exists bindings_chain_caip2_pool_address_key;

create unique index if not exists bindings_story_chain_pool
  on public.bindings (story_id, chain_caip2, pool_address);

alter table public.stories
  add column if not exists linked_pool_address text;

alter table public.stories
  add column if not exists linked_pool_dex text;

alter table public.stories
  add column if not exists linked_pool_label text;

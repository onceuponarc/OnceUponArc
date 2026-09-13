-- Chapter Curve: virtual base, LP reserve, and fixed k. Nullable so legacy Stories stay on the old path.
alter table public.stories
  add column if not exists virtual_base_raw numeric(78,0);

alter table public.stories
  add column if not exists lp_base_reserved_raw numeric(78,0);

alter table public.stories
  add column if not exists curve_k numeric(78,0);

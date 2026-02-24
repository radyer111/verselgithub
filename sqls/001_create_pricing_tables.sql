-- Enable UUID generation utilities
create extension if not exists "pgcrypto";

-- Pricing plans master data
create table if not exists pricing_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  monthly_price numeric(10,2) not null,
  annual_price numeric(10,2) not null,
  currency_code text not null default 'USD',
  features text[] not null default '{}'::text[],
  feature_heading text not null default 'Get started today:',
  cta_label text not null,
  cta_href text,
  highlight boolean not null default false,
  badge_label text,
  button_tone text not null default 'neutral',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pricing_plans_sort_order_idx on pricing_plans(sort_order);

create or replace function pricing_plans_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists pricing_plans_set_updated_at on pricing_plans;
create trigger pricing_plans_set_updated_at
before update on pricing_plans
for each row
execute function pricing_plans_set_updated_at();

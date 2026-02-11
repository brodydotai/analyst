-- Brodus: Trade journal tables

-- ============================================================
-- trade_entries: structured trade log
-- ============================================================
create table trade_entries (
    id          uuid default gen_random_uuid() primary key,
    ticker      text not null,
    side        text not null check (side in ('buy', 'sell', 'short', 'cover')),
    trade_date  date not null,
    price       numeric(12,4) not null,
    quantity    numeric(12,4) not null,
    thesis      text not null default '',
    status      text not null default 'open' check (status in ('open', 'closed', 'partial')),
    exit_price  numeric(12,4),
    exit_date   date,
    pnl         numeric(14,2),
    pnl_percent numeric(8,4),
    notes       text,
    tags        text[] not null default '{}',
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create index idx_trade_entries_ticker on trade_entries (ticker);
create index idx_trade_entries_status on trade_entries (status);
create index idx_trade_entries_trade_date on trade_entries (trade_date desc);

-- ============================================================
-- journal_entries: daily free-form notes
-- ============================================================
create table journal_entries (
    id          uuid default gen_random_uuid() primary key,
    entry_date  date not null default current_date,
    title       text not null,
    content     text not null,
    tags        text[] not null default '{}',
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create index idx_journal_entries_date on journal_entries (entry_date desc);
create index idx_journal_entries_tags on journal_entries using gin (tags);

-- ============================================================
-- updated_at triggers
-- ============================================================
create trigger set_updated_at before update on trade_entries
    for each row execute function update_updated_at();

create trigger set_updated_at before update on journal_entries
    for each row execute function update_updated_at();

-- ============================================================
-- Row-level security (enable but allow all for service role)
-- ============================================================
alter table trade_entries enable row level security;
alter table journal_entries enable row level security;

create policy "service_role_all" on trade_entries for all using (true) with check (true);
create policy "service_role_all" on journal_entries for all using (true) with check (true);

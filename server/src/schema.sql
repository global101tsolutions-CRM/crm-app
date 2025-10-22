
-- Tables
create table contacts (
  id text primary key,
  first_name text,
  last_name text,
  email text,
  phone text,
  title text,
  address text,
  company text,
  created_at text default (datetime('now')),
  updated_at text default (datetime('now'))
);

create table pipelines (
  id text primary key,
  name text not null
);
create table stages (
  id text primary key,
  pipeline_id text not null references pipelines(id),
  name text not null,
  order_index integer not null default 0,
  probability real default 0.0
);

create table deals (
  id text primary key,
  name text not null,
  amount real default 0,
  pipeline_id text not null references pipelines(id),
  stage_id text not null references stages(id),
  company text,
  owner text,
  created_at text default (datetime('now')),
  updated_at text default (datetime('now'))
);

create table tasks (
  id text primary key,
  subject text not null,
  due_at text,
  related_type text,
  related_id text,
  owner text,
  status text default 'open',
  created_at text default (datetime('now')),
  completed_at text
);

-- Trigger to update updated_at
create trigger deals_updated_at after update on deals
begin
  update deals set updated_at = datetime('now') where id = NEW.id;
end;

create trigger contacts_updated_at after update on contacts
begin
  update contacts set updated_at = datetime('now') where id = NEW.id;
end;

-- Indexes
create index if not exists contacts_updated_at_idx on contacts(updated_at desc, id);
create index if not exists contacts_created_at_idx on contacts(created_at desc, id);
create index if not exists contacts_name_idx on contacts(last_name, first_name);

create index if not exists deals_updated_at_idx on deals(updated_at desc, id);
create index if not exists deals_pipeline_idx on deals(pipeline_id, stage_id);
create index if not exists deals_company_idx on deals(company);

create index if not exists tasks_due_idx on tasks(due_at asc);
create index if not exists tasks_owner_idx on tasks(owner);

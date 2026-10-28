-- supabase/tests/permissions.sql
-- Permission tests for the database (RLS). Run AFTER the 3 migrations and the seed.
-- Paste the whole file into the Supabase SQL Editor and press Run.
-- Result: a table with one line per test, each PASS or FAIL.
-- It changes NOTHING in your data: every write test is undone right away.
-- (It uses no secrets and does not touch .env.local.)

create temp table test_results (n serial, line text);

do $$
declare
  noa uuid; dana uuid; yossi uuid; adm uuid;
  job_coffee uuid;      -- noa's open job
  job_noa_closed uuid;  -- noa's closed job
  job_poster uuid;      -- yossi's open job
  job_dana uuid;        -- dana's open job
  job_gym uuid;         -- dana's closed job
  conv uuid;            -- conversation noa <-> dana
  prop_dana uuid;       -- dana's proposal on the coffee job
  n int;                -- a counter for "how many rows do I see"
  c int;                -- rows changed; -1 = the database raised an error (blocked)
  r text[] := '{}';     -- test results
begin
  -- Look up the seed data (as the database owner, before switching to a user).
  select id into noa   from auth.users where email = 'noa@test.com';
  select id into dana  from auth.users where email = 'dana@test.com';
  select id into yossi from auth.users where email = 'yossi@test.com';
  select id into adm   from auth.users where email = 'admin@test.com';
  select id into job_coffee     from public.jobs where title = '[seed] Logo for a coffee shop';
  select id into job_noa_closed from public.jobs where title = '[seed] Instagram post pack';
  select id into job_poster     from public.jobs where title = '[seed] Poster for a school play';
  select id into job_dana       from public.jobs where title = '[seed] Business card design';
  select id into job_gym        from public.jobs where title = '[seed] Logo refresh for a gym';
  select id into conv from public.conversations where job_id = job_coffee limit 1;
  select id into prop_dana from public.proposals where job_id = job_coffee and designer_id = dana;

  if noa is null or dana is null or yossi is null or adm is null
     or job_coffee is null or job_noa_closed is null or job_poster is null
     or job_dana is null or job_gym is null or conv is null or prop_dana is null then
    raise exception 'Seed data is missing - run the seed script first.';
  end if;

  -- =========================== NOA (regular user) ===========================
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', noa, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into n from public.jobs where owner_id = noa;
  r := r || format('%s | noa sees all 4 of her own jobs (got %s)', case when n = 4 then 'PASS' else 'FAIL' end, n);

  select count(*) into n from public.jobs where owner_id <> noa and status <> 'open';
  r := r || format('%s | noa sees NO closed/in-progress jobs of others (got %s)', case when n = 0 then 'PASS' else 'FAIL' end, n);

  select count(*) into n from public.jobs where owner_id <> noa and status = 'open';
  r := r || format('%s | noa sees the open jobs of others (got %s, expected 3)', case when n = 3 then 'PASS' else 'FAIL' end, n);

  -- noa edits her own job: allowed
  c := 0;
  begin
    update public.jobs set description = 'edited by test' where id = job_coffee;
    get diagnostics c = row_count;
    raise exception 'undo';
  exception when others then if sqlerrm <> 'undo' then c := -1; end if;
  end;
  r := r || format('%s | noa CAN edit her own job (rows changed: %s)', case when c = 1 then 'PASS' else 'FAIL' end, c);

  -- noa edits dana's job: blocked
  c := 0;
  begin
    update public.jobs set description = 'hacked' where id = job_dana;
    get diagnostics c = row_count;
    raise exception 'undo';
  exception when others then if sqlerrm <> 'undo' then c := -1; end if;
  end;
  r := r || format('%s | noa can NOT edit dana''s job (rows changed: %s)', case when c <= 0 then 'PASS' else 'FAIL' end, c);

  -- noa deletes dana's job: blocked
  c := 0;
  begin
    delete from public.jobs where id = job_dana;
    get diagnostics c = row_count;
    raise exception 'undo';
  exception when others then if sqlerrm <> 'undo' then c := -1; end if;
  end;
  r := r || format('%s | noa can NOT delete dana''s job (rows changed: %s)', case when c <= 0 then 'PASS' else 'FAIL' end, c);

  -- noa creates a job in someone else's name: blocked
  c := 0;
  begin
    insert into public.jobs (owner_id, title, description, category)
    values (dana, 'fake job', 'x', 'logo');
    get diagnostics c = row_count;
    raise exception 'undo';
  exception when others then if sqlerrm <> 'undo' then c := -1; end if;
  end;
  r := r || format('%s | noa can NOT create a job owned by dana (result: %s)', case when c <= 0 then 'PASS' else 'FAIL' end, c);

  -- noa makes herself admin: blocked
  c := 0;
  begin
    update public.profiles set role = 'admin' where id = noa;
    get diagnostics c = row_count;
    raise exception 'undo';
  exception when others then if sqlerrm <> 'undo' then c := -1; end if;
  end;
  r := r || format('%s | noa can NOT make herself admin (result: %s)', case when c <= 0 then 'PASS' else 'FAIL' end, c);

  -- noa marks herself as onboarded (skipping step 2): blocked, only the server may do it
  c := 0;
  begin
    update public.profiles set onboarded = true where id = noa;
    get diagnostics c = row_count;
    raise exception 'undo';
  exception when others then if sqlerrm <> 'undo' then c := -1; end if;
  end;
  r := r || format('%s | noa can NOT set onboarded herself (result: %s)', case when c <= 0 then 'PASS' else 'FAIL' end, c);

  -- noa edits her own bio: allowed
  c := 0;
  begin
    update public.profiles set bio = 'new bio' where id = noa;
    get diagnostics c = row_count;
    raise exception 'undo';
  exception when others then if sqlerrm <> 'undo' then c := -1; end if;
  end;
  r := r || format('%s | noa CAN edit her own bio (rows changed: %s)', case when c = 1 then 'PASS' else 'FAIL' end, c);

  -- noa edits dana's bio: blocked
  c := 0;
  begin
    update public.profiles set bio = 'hacked' where id = dana;
    get diagnostics c = row_count;
    raise exception 'undo';
  exception when others then if sqlerrm <> 'undo' then c := -1; end if;
  end;
  r := r || format('%s | noa can NOT edit dana''s profile (result: %s)', case when c <= 0 then 'PASS' else 'FAIL' end, c);

  -- noa (job owner) accepts a proposal: allowed
  c := 0;
  begin
    update public.proposals set status = 'accepted' where id = prop_dana;
    get diagnostics c = row_count;
    raise exception 'undo';
  exception when others then if sqlerrm <> 'undo' then c := -1; end if;
  end;
  r := r || format('%s | noa (job owner) CAN accept a proposal (rows changed: %s)', case when c = 1 then 'PASS' else 'FAIL' end, c);

  -- noa changes the price of a proposal: blocked (owner may change status only)
  c := 0;
  begin
    update public.proposals set price = 1 where id = prop_dana;
    get diagnostics c = row_count;
    raise exception 'undo';
  exception when others then if sqlerrm <> 'undo' then c := -1; end if;
  end;
  r := r || format('%s | noa can NOT change the price of a proposal (result: %s)', case when c <= 0 then 'PASS' else 'FAIL' end, c);

  -- noa proposes on her OWN job: blocked
  c := 0;
  begin
    insert into public.proposals (job_id, designer_id, message, price, delivery_hours)
    values (job_coffee, noa, 'x', 100, 24);
    get diagnostics c = row_count;
    raise exception 'undo';
  exception when others then if sqlerrm <> 'undo' then c := -1; end if;
  end;
  r := r || format('%s | noa can NOT propose on her own job (result: %s)', case when c <= 0 then 'PASS' else 'FAIL' end, c);

  select count(*) into n from public.proposals;
  r := r || format('%s | noa sees the 3 proposals on her jobs (got %s)', case when n = 3 then 'PASS' else 'FAIL' end, n);

  select count(*) into n from public.conversations;
  r := r || format('%s | noa sees her 1 conversation (got %s)', case when n = 1 then 'PASS' else 'FAIL' end, n);

  select count(*) into n from public.messages;
  r := r || format('%s | noa sees the 2 messages (got %s)', case when n = 2 then 'PASS' else 'FAIL' end, n);

  -- =========================== DANA (designer) ===========================
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', dana, 'role', 'authenticated')::text, true);
  set local role authenticated;

  -- dana proposes on yossi's open job: allowed
  c := 0;
  begin
    insert into public.proposals (job_id, designer_id, message, price, delivery_hours)
    values (job_poster, dana, 'x', 100, 24);
    get diagnostics c = row_count;
    raise exception 'undo';
  exception when others then if sqlerrm <> 'undo' then c := -1; end if;
  end;
  r := r || format('%s | dana CAN propose on an open job of someone else (result: %s)', case when c = 1 then 'PASS' else 'FAIL' end, c);

  -- dana proposes on a CLOSED job: blocked
  c := 0;
  begin
    insert into public.proposals (job_id, designer_id, message, price, delivery_hours)
    values (job_noa_closed, dana, 'x', 100, 24);
    get diagnostics c = row_count;
    raise exception 'undo';
  exception when others then if sqlerrm <> 'undo' then c := -1; end if;
  end;
  r := r || format('%s | dana can NOT propose on a closed job (result: %s)', case when c <= 0 then 'PASS' else 'FAIL' end, c);

  -- dana proposes twice on the same job: blocked
  c := 0;
  begin
    insert into public.proposals (job_id, designer_id, message, price, delivery_hours)
    values (job_coffee, dana, 'second try', 100, 24);
    get diagnostics c = row_count;
    raise exception 'undo';
  exception when others then if sqlerrm <> 'undo' then c := -1; end if;
  end;
  r := r || format('%s | dana can NOT send two proposals on the same job (result: %s)', case when c <= 0 then 'PASS' else 'FAIL' end, c);

  -- dana accepts her own proposal: blocked (only the job owner can)
  c := 0;
  begin
    update public.proposals set status = 'accepted' where id = prop_dana;
    get diagnostics c = row_count;
    raise exception 'undo';
  exception when others then if sqlerrm <> 'undo' then c := -1; end if;
  end;
  r := r || format('%s | dana can NOT accept her own proposal (result: %s)', case when c <= 0 then 'PASS' else 'FAIL' end, c);

  -- =========================== YOSSI (not in the conversation) ===========================
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', yossi, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into n from public.conversations;
  r := r || format('%s | yossi sees NO conversations of others (got %s)', case when n = 0 then 'PASS' else 'FAIL' end, n);

  select count(*) into n from public.messages;
  r := r || format('%s | yossi sees NO messages of others (got %s)', case when n = 0 then 'PASS' else 'FAIL' end, n);

  select count(*) into n from public.proposals where designer_id <> yossi;
  r := r || format('%s | yossi sees no proposals of others on jobs that are not his (got %s)', case when n = 0 then 'PASS' else 'FAIL' end, n);

  -- yossi writes into a conversation that is not his: blocked
  c := 0;
  begin
    insert into public.messages (conversation_id, sender_id, body) values (conv, yossi, 'intruder');
    get diagnostics c = row_count;
    raise exception 'undo';
  exception when others then if sqlerrm <> 'undo' then c := -1; end if;
  end;
  r := r || format('%s | yossi can NOT write in someone else''s conversation (result: %s)', case when c <= 0 then 'PASS' else 'FAIL' end, c);

  -- yossi sends a message pretending to be noa: blocked
  c := 0;
  begin
    insert into public.messages (conversation_id, sender_id, body) values (conv, noa, 'fake');
    get diagnostics c = row_count;
    raise exception 'undo';
  exception when others then if sqlerrm <> 'undo' then c := -1; end if;
  end;
  r := r || format('%s | yossi can NOT send a message in noa''s name (result: %s)', case when c <= 0 then 'PASS' else 'FAIL' end, c);

  -- =========================== ADMIN ===========================
  reset role;
  perform set_config('request.jwt.claims', json_build_object('sub', adm, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into n from public.jobs;
  r := r || format('%s | admin sees ALL jobs (got %s, expected at least 10)', case when n >= 10 then 'PASS' else 'FAIL' end, n);

  select count(*) into n from public.jobs where id = job_gym;
  r := r || format('%s | admin sees dana''s closed job (got %s)', case when n = 1 then 'PASS' else 'FAIL' end, n);

  c := 0;
  begin
    update public.jobs set description = 'edited by admin' where id = job_dana;
    get diagnostics c = row_count;
    raise exception 'undo';
  exception when others then if sqlerrm <> 'undo' then c := -1; end if;
  end;
  r := r || format('%s | admin CAN edit any job (rows changed: %s)', case when c = 1 then 'PASS' else 'FAIL' end, c);

  c := 0;
  begin
    delete from public.jobs where id = job_dana;
    get diagnostics c = row_count;
    raise exception 'undo';
  exception when others then if sqlerrm <> 'undo' then c := -1; end if;
  end;
  r := r || format('%s | admin CAN delete any job (rows changed: %s)', case when c = 1 then 'PASS' else 'FAIL' end, c);

  select count(*) into n from public.messages;
  r := r || format('%s | admin CAN read messages (got %s)', case when n = 2 then 'PASS' else 'FAIL' end, n);

  c := 0;
  begin
    insert into public.messages (conversation_id, sender_id, body) values (conv, adm, 'admin writes');
    get diagnostics c = row_count;
    raise exception 'undo';
  exception when others then if sqlerrm <> 'undo' then c := -1; end if;
  end;
  r := r || format('%s | admin can NOT write messages (result: %s)', case when c <= 0 then 'PASS' else 'FAIL' end, c);

  -- =========================== NOT SIGNED IN ===========================
  reset role;
  set local role anon;

  n := 0;
  begin
    select count(*) into n from public.jobs;
  exception when others then n := -1;   -- "permission denied" also counts as blocked
  end;
  r := r || format('%s | a visitor who is not signed in sees NO jobs (result: %s)', case when n <= 0 then 'PASS' else 'FAIL' end, n);

  -- Done: back to the owner role, save the results to the temp table.
  reset role;
  insert into test_results (line) select unnest(r);
end;
$$;

select line as result from test_results order by n;

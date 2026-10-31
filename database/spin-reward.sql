-- Prototype only: legacy unconditional snapshot writes must be migrated first.
-- p_index must be chosen on the server with a cryptographically secure generator.
CREATE OR REPLACE FUNCTION paiso_claim_spin(p_user_id text, p_index integer)
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  snapshot jsonb;
  account jsonb;
  config jsonb;
  rewards jsonb;
  cooldown bigint;
  last_spin bigint;
  points bigint;
  now_ms bigint := floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint;
BEGIN
  IF p_user_id !~ '^[0-9]{1,32}$' THEN RETURN jsonb_build_object('ok', false, 'error', 'invalid'); END IF;
  SELECT data INTO snapshot FROM paiso_state WHERE id=1 FOR UPDATE;
  IF snapshot IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'unavailable'); END IF;
  account := snapshot #> ARRAY['users', p_user_id];
  IF account IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'invalid'); END IF;
  config := COALESCE(snapshot->'spinSettings', '{"enabled":true,"cooldownMs":86400000,"rewards":[5,10,20,50]}'::jsonb);
  IF config->>'enabled' IS DISTINCT FROM 'true' THEN RETURN jsonb_build_object('ok', false, 'error', 'disabled'); END IF;
  rewards := config->'rewards';
  IF rewards IS NULL OR jsonb_typeof(rewards) <> 'array' THEN RETURN jsonb_build_object('ok', false, 'error', 'invalid'); END IF;
  IF jsonb_array_length(rewards) < 1 OR jsonb_array_length(rewards) > 20
    OR p_index < 0 OR p_index >= jsonb_array_length(rewards)
    OR COALESCE(config->>'cooldownMs','') !~ '^[0-9]{1,10}$'
    OR COALESCE(account->>'coins','') !~ '^[0-9]{1,15}$'
    OR COALESCE(account->>'totalEarned','') !~ '^[0-9]{1,15}$'
    OR COALESCE(account->>'lastSpinAt','0') !~ '^[0-9]{1,15}$'
    OR COALESCE(rewards->>p_index,'') !~ '^[0-9]{1,7}$' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid');
  END IF;
  cooldown := (config->>'cooldownMs')::bigint;
  points := (rewards->>p_index)::bigint;
  last_spin := COALESCE((account->>'lastSpinAt')::bigint,0);
  IF cooldown < 60000 OR cooldown > 2592000000 OR points > 1000000 THEN RETURN jsonb_build_object('ok', false, 'error', 'invalid'); END IF;
  IF last_spin > 0 AND last_spin + cooldown > now_ms THEN RETURN jsonb_build_object('ok', false, 'error', 'cooldown', 'nextSpinAt', last_spin + cooldown); END IF;
  account := jsonb_set(account, '{coins}', to_jsonb((account->>'coins')::bigint + points), true);
  account := jsonb_set(account, '{totalEarned}', to_jsonb((account->>'totalEarned')::bigint + points), true);
  account := jsonb_set(account, '{lastSpinAt}', to_jsonb(now_ms), true);
  snapshot := jsonb_set(snapshot, ARRAY['users', p_user_id], account, true);
  UPDATE paiso_state SET data = snapshot, revision = revision + 1 WHERE id=1;
  RETURN jsonb_build_object('ok', true, 'points', points, 'coins', (account->>'coins')::bigint, 'nextSpinAt', now_ms + cooldown);
END;
$$;

-- Prototype: atomic redemption against paiso_state.
-- Do not install in production until legacy snapshot writers are migrated:
-- an unconditional stale snapshot write can otherwise overwrite this transaction.
CREATE OR REPLACE FUNCTION paiso_redeem_bonus(p_user_id text, p_code_hash text)
RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE
  snapshot jsonb;
  account jsonb;
  code jsonb;
  used_by jsonb;
  points bigint;
  uses bigint;
  maximum bigint;
  expiry bigint;
  now_ms bigint := floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint;
BEGIN
  IF p_user_id !~ '^[0-9]{1,32}$' OR p_code_hash !~ '^[0-9a-f]{64}$' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid');
  END IF;
  SELECT data INTO snapshot FROM paiso_state WHERE id = 1 FOR UPDATE;
  IF snapshot IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'unavailable'); END IF;
  account := snapshot #> ARRAY['users', p_user_id];
  code := snapshot #> ARRAY['rewardCodes', p_code_hash];
  IF account IS NULL OR code IS NULL OR code->>'enabled' IS DISTINCT FROM 'true' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid');
  END IF;
  IF COALESCE(code->>'points','') !~ '^[0-9]{1,7}$'
    OR COALESCE(code->>'maxUses','') !~ '^[0-9]{1,7}$'
    OR COALESCE(code->>'uses','') !~ '^[0-9]{1,7}$'
    OR COALESCE(account->>'coins','') !~ '^[0-9]{1,15}$'
    OR COALESCE(account->>'totalEarned','') !~ '^[0-9]{1,15}$' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid');
  END IF;
  points := (code->>'points')::bigint;
  uses := (code->>'uses')::bigint;
  maximum := (code->>'maxUses')::bigint;
  IF points < 1 OR points > 1000000 OR maximum < 1 OR maximum > 1000000 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid');
  END IF;
  used_by := COALESCE(code->'usedBy', '{}'::jsonb);
  IF jsonb_typeof(used_by) <> 'object' THEN RETURN jsonb_build_object('ok', false, 'error', 'invalid'); END IF;
  IF used_by ? p_user_id THEN RETURN jsonb_build_object('ok', false, 'error', 'claimed'); END IF;
  IF code ? 'expiresAt' AND code->'expiresAt' <> 'null'::jsonb THEN
    IF COALESCE(code->>'expiresAt','') !~ '^[0-9]{1,15}$' THEN RETURN jsonb_build_object('ok', false, 'error', 'invalid'); END IF;
    expiry := (code->>'expiresAt')::bigint;
    IF expiry <= now_ms THEN RETURN jsonb_build_object('ok', false, 'error', 'expired'); END IF;
  END IF;
  IF uses >= maximum THEN RETURN jsonb_build_object('ok', false, 'error', 'exhausted'); END IF;
  used_by := jsonb_set(used_by, ARRAY[p_user_id], to_jsonb(now_ms), true);
  code := jsonb_set(code, '{usedBy}', used_by, true);
  code := jsonb_set(code, '{uses}', to_jsonb(uses + 1), true);
  account := jsonb_set(account, '{coins}', to_jsonb((account->>'coins')::bigint + points), true);
  account := jsonb_set(account, '{totalEarned}', to_jsonb((account->>'totalEarned')::bigint + points), true);
  snapshot := jsonb_set(snapshot, ARRAY['rewardCodes', p_code_hash], code, true);
  snapshot := jsonb_set(snapshot, ARRAY['users', p_user_id], account, true);
  UPDATE paiso_state SET data = snapshot, revision = revision + 1 WHERE id = 1;
  RETURN jsonb_build_object('ok', true, 'points', points, 'coins', (account->>'coins')::bigint);
END;
$$;

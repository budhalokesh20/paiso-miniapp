-- Prototype only: all existing writers must use the same revision protocol before deployment.
ALTER TABLE paiso_state ADD COLUMN IF NOT EXISTS revision bigint NOT NULL DEFAULT 0;

-- Reject legacy writes that omit the revision increment. This guard is deliberately
-- not installed on the live database until every existing writer is migrated.
CREATE OR REPLACE FUNCTION paiso_require_snapshot_revision()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.revision IS DISTINCT FROM OLD.revision + 1 THEN
    RAISE EXCEPTION 'snapshot revision required' USING ERRCODE = '40001';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS paiso_snapshot_revision_guard ON paiso_state;
CREATE TRIGGER paiso_snapshot_revision_guard BEFORE UPDATE ON paiso_state
  FOR EACH ROW EXECUTE FUNCTION paiso_require_snapshot_revision();

CREATE OR REPLACE FUNCTION paiso_save_snapshot(p_expected_revision bigint, p_snapshot jsonb)
RETURNS bigint LANGUAGE plpgsql AS $$
DECLARE next_revision bigint;
BEGIN
  IF p_expected_revision IS NULL OR p_expected_revision < 0 OR jsonb_typeof(p_snapshot) <> 'object' THEN
    RAISE EXCEPTION 'invalid snapshot revision or data';
  END IF;
  UPDATE paiso_state SET data = p_snapshot, revision = revision + 1
    WHERE id = 1 AND revision = p_expected_revision
    RETURNING revision INTO next_revision;
  IF next_revision IS NULL THEN RAISE EXCEPTION 'snapshot conflict' USING ERRCODE = '40001'; END IF;
  RETURN next_revision;
END;
$$;

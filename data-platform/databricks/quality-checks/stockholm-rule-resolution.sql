-- Each query should return zero rows when the pipeline is healthy.

-- Gold rules must always have at least one source.
SELECT zone_id
FROM gold.stockholm_zone_rule_resolution
WHERE rule_sources_json IS NULL
   OR TRIM(rule_sources_json) = '';

-- Gold rules must always identify a primary source label.
SELECT zone_id
FROM gold.stockholm_zone_rule_resolution
WHERE primary_source_label IS NULL
   OR TRIM(primary_source_label) = '';

-- Paid rules should always carry a user-facing price label.
SELECT zone_id
FROM gold.stockholm_zone_rule_resolution
WHERE fee_required = TRUE
  AND (effective_price_label IS NULL OR TRIM(effective_price_label) = '');

-- Sign overrides should not exist without a checked timestamp.
SELECT override_id
FROM silver.stockholm_sign_overrides
WHERE source_checked_at IS NULL;

-- Resolution candidates should not have duplicate precedence for the same zone and source label.
SELECT zone_id, precedence_rank, source_label, COUNT(*) AS duplicate_count
FROM silver.stockholm_zone_rule_candidates
GROUP BY zone_id, precedence_rank, source_label
HAVING COUNT(*) > 1;

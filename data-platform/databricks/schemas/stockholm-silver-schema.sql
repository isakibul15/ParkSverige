CREATE SCHEMA IF NOT EXISTS silver;

CREATE TABLE IF NOT EXISTS silver.stockholm_tariff_area_rules (
  tariff_area_code STRING NOT NULL,
  city_slug STRING NOT NULL,
  day_type STRING NOT NULL,
  start_local_time STRING NOT NULL,
  end_local_time STRING NOT NULL,
  fee_required BOOLEAN NOT NULL,
  permit_required BOOLEAN NOT NULL,
  max_duration_minutes INT,
  price_minor_sek INT,
  price_label STRING,
  source_url STRING NOT NULL,
  source_checked_at TIMESTAMP NOT NULL,
  normalized_at TIMESTAMP NOT NULL
)
USING DELTA;

CREATE TABLE IF NOT EXISTS silver.stockholm_regulation_windows (
  regulation_id STRING NOT NULL,
  city_slug STRING NOT NULL,
  rule_scope STRING NOT NULL,
  day_type STRING NOT NULL,
  start_local_time STRING,
  end_local_time STRING,
  parking_allowed BOOLEAN NOT NULL,
  street_cleaning BOOLEAN NOT NULL,
  restriction_label STRING,
  source_url STRING NOT NULL,
  source_checked_at TIMESTAMP NOT NULL,
  normalized_at TIMESTAMP NOT NULL
)
USING DELTA;

CREATE TABLE IF NOT EXISTS silver.stockholm_sign_overrides (
  override_id STRING NOT NULL,
  zone_id STRING NOT NULL,
  city_slug STRING NOT NULL,
  schedule_label STRING NOT NULL,
  price_label STRING,
  fee_required BOOLEAN NOT NULL,
  permit_required BOOLEAN NOT NULL,
  max_duration_minutes INT,
  precedence_rank INT NOT NULL,
  source_label STRING NOT NULL,
  source_note STRING,
  source_checked_at TIMESTAMP NOT NULL,
  normalized_at TIMESTAMP NOT NULL
)
USING DELTA;

CREATE TABLE IF NOT EXISTS silver.stockholm_zone_rule_candidates (
  zone_id STRING NOT NULL,
  city_slug STRING NOT NULL,
  candidate_kind STRING NOT NULL,
  schedule_label STRING NOT NULL,
  price_label STRING,
  fee_required BOOLEAN NOT NULL,
  permit_required BOOLEAN NOT NULL,
  max_duration_minutes INT,
  precedence_rank INT NOT NULL,
  source_label STRING NOT NULL,
  source_url STRING,
  source_checked_at TIMESTAMP NOT NULL,
  normalized_at TIMESTAMP NOT NULL
)
USING DELTA;

CREATE SCHEMA IF NOT EXISTS gold;

CREATE TABLE IF NOT EXISTS gold.stockholm_zone_rule_resolution (
  zone_id STRING NOT NULL,
  city_slug STRING NOT NULL,
  resolution_strategy STRING NOT NULL,
  effective_schedule_label STRING NOT NULL,
  effective_price_label STRING,
  fee_required BOOLEAN NOT NULL,
  permit_required BOOLEAN NOT NULL,
  max_duration_minutes INT,
  primary_source_kind STRING NOT NULL,
  primary_source_label STRING NOT NULL,
  secondary_source_label STRING,
  rule_sources_json STRING NOT NULL,
  resolution_notes_json STRING NOT NULL,
  source_updated_at TIMESTAMP NOT NULL,
  published_at TIMESTAMP NOT NULL
)
USING DELTA;

CREATE TABLE IF NOT EXISTS gold.stockholm_zone_rule_export (
  zone_id STRING NOT NULL,
  external_zone_key STRING NOT NULL,
  city_slug STRING NOT NULL,
  parking_allowed BOOLEAN NOT NULL,
  fee_required BOOLEAN NOT NULL,
  permit_required BOOLEAN NOT NULL,
  max_duration_minutes INT,
  price_label STRING,
  restriction_label STRING NOT NULL,
  source_updated_at TIMESTAMP NOT NULL,
  published_at TIMESTAMP NOT NULL
)
USING DELTA;

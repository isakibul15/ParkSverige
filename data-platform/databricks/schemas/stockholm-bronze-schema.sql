CREATE SCHEMA IF NOT EXISTS bronze;

CREATE TABLE IF NOT EXISTS bronze.stockholm_tariff_reference_raw (
  ingestion_batch_id STRING NOT NULL,
  source_id STRING NOT NULL,
  source_url STRING NOT NULL,
  source_checked_at TIMESTAMP NOT NULL,
  content_format STRING NOT NULL,
  raw_payload STRING NOT NULL,
  payload_sha256 STRING NOT NULL,
  ingested_at TIMESTAMP NOT NULL
)
USING DELTA;

CREATE TABLE IF NOT EXISTS bronze.stockholm_regulation_reference_raw (
  ingestion_batch_id STRING NOT NULL,
  source_id STRING NOT NULL,
  source_url STRING NOT NULL,
  source_checked_at TIMESTAMP NOT NULL,
  content_format STRING NOT NULL,
  raw_payload STRING NOT NULL,
  payload_sha256 STRING NOT NULL,
  ingested_at TIMESTAMP NOT NULL
)
USING DELTA;

CREATE TABLE IF NOT EXISTS bronze.stockholm_sign_override_raw (
  ingestion_batch_id STRING NOT NULL,
  override_id STRING NOT NULL,
  zone_id STRING NOT NULL,
  location_label STRING,
  source_kind STRING NOT NULL,
  source_note STRING,
  raw_payload STRING NOT NULL,
  payload_sha256 STRING NOT NULL,
  source_checked_at TIMESTAMP NOT NULL,
  ingested_at TIMESTAMP NOT NULL
)
USING DELTA;

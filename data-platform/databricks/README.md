# Databricks Workspace

This directory is the foundation for the parking data platform.

Responsibilities:

- ingest municipal and partner datasets
- clean and normalize parking rules
- enrich geometry using spatial joins
- produce gold datasets for PostgreSQL serving tables
- prepare occupancy and alert features

## Stockholm Rule Ingestion Slice

The first concrete ingestion slice for Stockholm now has a dedicated foundation:

- `sources/stockholm-source-manifest.yaml`
  Official source registry and refresh expectations.
- `schemas/stockholm-bronze-schema.sql`
  Raw landing tables for tariff references, regulation references, and sign overrides.
- `schemas/stockholm-silver-schema.sql`
  Normalized rule windows and override candidates.
- `schemas/stockholm-gold-schema.sql`
  Resolved zone rules and serving export tables.
- `jobs/stockholm-rule-pipeline.yml`
  Databricks job skeleton for the rule-resolution flow.
- `quality-checks/stockholm-rule-resolution.sql`
  Data QA checks that should return zero rows when healthy.
- `notebooks/stockholm_rule_pipeline.py`
  Notebook-oriented starter for the bronze to silver to gold promotion flow.

## Resolution Principle

For Stockholm, tariff-area data is useful but not sufficient on its own.

The pipeline is intentionally modeled as:

1. official tariff baseline
2. municipality rule context
3. sign-level or local override
4. resolved serving export for PostgreSQL and the app API

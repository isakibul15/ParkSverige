# Databricks notebook source

dbutils.widgets.text("pipeline_stage", "bronze")
pipeline_stage = dbutils.widgets.get("pipeline_stage")

print(f"[stockholm-rule-pipeline] stage={pipeline_stage}")

if pipeline_stage == "bronze":
    print("1. Fetch and snapshot Stockholm tariff and regulation references.")
    print("2. Ingest curated sign override seeds where live sign feeds are unavailable.")
    print("3. Write raw snapshots into bronze Delta tables.")

elif pipeline_stage == "silver":
    print("1. Normalize tariff windows into structured time-based rules.")
    print("2. Normalize municipality regulation references.")
    print("3. Normalize sign overrides with precedence ranks.")
    print("4. Produce zone-level candidate rules in silver tables.")

elif pipeline_stage == "gold":
    print("1. Resolve zone rules by precedence: tariff -> regulation -> sign override.")
    print("2. Publish resolved rule provenance for app trust surfaces.")
    print("3. Write serving exports for PostgreSQL/PostGIS sync.")

else:
    raise ValueError(f"Unsupported pipeline_stage: {pipeline_stage}")

# The implementation is intentionally lightweight for now.
# The next real step is wiring HTTP fetches or landing files and replacing
# these notebook messages with Spark SQL or PySpark transforms.

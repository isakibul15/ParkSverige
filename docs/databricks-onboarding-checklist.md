# Databricks Onboarding Checklist

You do not need this yet for local prototype work, but you will need it before live Databricks hookup.

## What You Will Need To Create

1. A Databricks workspace
2. A personal access token or service principal credentials
3. A catalog and schema plan for bronze, silver, and gold layers
4. A storage location for landing raw snapshots

## What You Will Need To Share

- Workspace URL
- Auth method you want to use
- Catalog or workspace naming convention
- Any environment restrictions for production vs development

## Safe Sharing Guidance

- Never send your real password
- Use a scoped token or service principal when possible
- Put secrets in environment variables, not committed files

## First Commands We Will Run Later

- validate workspace connectivity
- upload or sync the Databricks job spec
- create bronze, silver, and gold schemas
- run the Stockholm rule pipeline against a dev environment

## Local Preparation Already Done

- source manifest exists
- bronze, silver, gold schemas exist
- quality-check SQL exists
- pipeline job skeleton exists
- local worker simulation can now generate sample bronze, silver, and gold outputs

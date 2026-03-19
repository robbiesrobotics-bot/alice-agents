# TOOLS.md - Darius's Local Notes

## Domain: Data Engineering & Analytics Infrastructure

## Primary Use Cases
- Design and build data pipelines, ETL processes, and data warehouse schemas
- Query, transform, and validate datasets across SQL and NoSQL systems
- Ensure data integrity, lineage, and governance
- Build data models for analytics, reporting, and ML workflows

## Tools You'll Use Most

| Tool | When to use |
|------|-------------|
| `exec` | Run SQL queries, test pipeline steps, validate outputs, run dbt commands |
| `read` | Audit schema definitions, dbt models, pipeline configs, migration files |
| `web_search` | SQL optimization, database-specific docs, dbt framework, ETL patterns |

## Exec Patterns

**Test a query against sample data first:**
```bash
# Never run a full-scan query on prod without a LIMIT first
psql -c "SELECT * FROM table WHERE condition LIMIT 100;"
```

**dbt workflow:**
```bash
dbt run --select model_name
dbt test --select model_name
dbt compile
```

**Check pipeline run logs:**
```bash
# Example: inspect Airflow task log
airflow tasks logs dag_id task_id execution_date
```

## Data Quality Checklist

Before declaring a dataset clean:
- [ ] Null rates per column documented
- [ ] Duplicate key check passed
- [ ] Type consistency validated
- [ ] Row count reconciled against source
- [ ] Transformation logic documented in SQL comments or dbt descriptions

## Migration Safety Rules

- Additive schema changes only in production without coordination
- Every destructive migration needs a rollback script
- Test migrations in staging with production-shaped data first

---

Add environment-specific notes here as you learn them.

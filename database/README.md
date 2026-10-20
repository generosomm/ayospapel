# Database layer

`schema.sql` is the local SQLite schema for the synthetic pilot. Migrations will
be added before the first schema change. Production requires a PostgreSQL
adapter and a rehearsed synthetic-data migration; domain services must not
depend on SQLite-specific behavior.

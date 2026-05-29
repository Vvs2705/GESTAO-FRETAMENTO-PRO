-- ============================================================
-- Gestão Fretamento Pro — Database Health & Performance Stats
-- Uso: psql $DATABASE_URL -f scripts/db/stats.sql
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Top 20 consultas mais lentas (requer pg_stat_statements)
-- ────────────────────────────────────────────────────────────
SELECT
  left(query, 120)                                                   AS query_snippet,
  calls,
  round(total_exec_time::numeric, 2)                                 AS total_ms,
  round(mean_exec_time::numeric, 2)                                  AS mean_ms,
  round(stddev_exec_time::numeric, 2)                                AS stddev_ms,
  round((100 * total_exec_time / sum(total_exec_time) OVER ())::numeric, 2) AS pct_total
FROM pg_stat_statements
WHERE query NOT ILIKE '%pg_stat_statements%'
ORDER BY total_exec_time DESC
LIMIT 20;

-- ────────────────────────────────────────────────────────────
-- 2. Cache hit ratio (target: > 99%)
-- ────────────────────────────────────────────────────────────
SELECT
  sum(heap_blks_hit)  AS buffer_hits,
  sum(heap_blks_read) AS disk_reads,
  round(
    100.0 * sum(heap_blks_hit)
    / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0),
    2
  ) AS cache_hit_pct
FROM pg_statio_user_tables;

-- ────────────────────────────────────────────────────────────
-- 3. Conexões ativas por estado
-- ────────────────────────────────────────────────────────────
SELECT
  count(*)           AS connections,
  state,
  wait_event_type,
  wait_event
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state, wait_event_type, wait_event
ORDER BY count(*) DESC;

-- ────────────────────────────────────────────────────────────
-- 4. Queries de longa duração (> 30 segundos)
-- ────────────────────────────────────────────────────────────
SELECT
  pid,
  now() - query_start   AS duration,
  state,
  wait_event_type,
  wait_event,
  left(query, 200)       AS query_snippet
FROM pg_stat_activity
WHERE state = 'active'
  AND query_start < now() - interval '30 seconds'
  AND datname = current_database()
ORDER BY duration DESC;

-- ────────────────────────────────────────────────────────────
-- 5. Índices nunca utilizados (candidatos para remoção)
-- ────────────────────────────────────────────────────────────
SELECT
  schemaname,
  tablename,
  indexrelname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE 'pk_%'
  AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;

-- ────────────────────────────────────────────────────────────
-- 6. Tabelas com mais dead tuples (candidatos para VACUUM)
-- ────────────────────────────────────────────────────────────
SELECT
  relname                                        AS table_name,
  n_dead_tup                                     AS dead_tuples,
  n_live_tup                                     AS live_tuples,
  round(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_pct,
  last_autovacuum,
  last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC
LIMIT 15;

-- ────────────────────────────────────────────────────────────
-- 7. Tamanho das maiores tabelas
-- ────────────────────────────────────────────────────────────
SELECT
  relname                                        AS table_name,
  pg_size_pretty(pg_total_relation_size(oid))    AS total_size,
  pg_size_pretty(pg_relation_size(oid))          AS table_size,
  pg_size_pretty(pg_total_relation_size(oid) - pg_relation_size(oid)) AS index_size
FROM pg_class
WHERE relkind = 'r'
  AND relnamespace = 'public'::regnamespace
ORDER BY pg_total_relation_size(oid) DESC
LIMIT 20;

-- ────────────────────────────────────────────────────────────
-- 8. Locks bloqueantes
-- ────────────────────────────────────────────────────────────
SELECT
  blocked.pid                                    AS blocked_pid,
  blocked.query                                  AS blocked_query,
  blocking.pid                                   AS blocking_pid,
  blocking.query                                 AS blocking_query,
  now() - blocked.query_start                    AS blocked_duration
FROM pg_stat_activity AS blocked
JOIN pg_stat_activity AS blocking
  ON blocking.pid = ANY(pg_blocking_pids(blocked.pid))
WHERE cardinality(pg_blocking_pids(blocked.pid)) > 0;

-- ────────────────────────────────────────────────────────────
-- 9. OutboxEvents pendentes (monitoramento do padrão Outbox)
-- ────────────────────────────────────────────────────────────
SELECT
  event_type,
  count(*)             AS pending_count,
  min(created_at)      AS oldest_pending,
  max(created_at)      AS newest_pending
FROM outbox_events
WHERE published_at IS NULL
GROUP BY event_type
ORDER BY pending_count DESC;

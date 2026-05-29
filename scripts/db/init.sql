-- ============================================================
-- Gestão Fretamento Pro — PostgreSQL initialization script
-- Executado automaticamente ao criar o container pela primeira vez.
-- ============================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Configurações de performance (apenas parâmetros que podem ser definidos em tempo de execução)
ALTER SYSTEM SET log_min_duration_statement = 1000; -- log queries acima de 1 segundo
ALTER SYSTEM SET log_statement = 'none';            -- não logar todas as queries, apenas lentas
ALTER SYSTEM SET log_duration = 'off';
ALTER SYSTEM SET track_activity_query_size = 2048;

SELECT pg_reload_conf();

-- Configuração inicial do banco
COMMENT ON DATABASE gestao_fretamento_pro IS 'Gestão Fretamento Pro — banco principal';

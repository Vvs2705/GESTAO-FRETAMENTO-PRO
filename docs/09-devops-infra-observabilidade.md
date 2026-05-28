# 09 — DevOps, Infraestrutura e Observabilidade

## Objetivo

Definir como a plataforma será desenvolvida, implantada, monitorada e escalada com padrão profissional.

## Princípios

- ambientes previsíveis;
- deploy automatizado;
- rollback possível;
- logs úteis;
- métricas de saúde;
- backups testados;
- custos sob controle;
- segurança operacional.

## Ambientes

### Local

- Docker Compose;
- PostgreSQL;
- Redis;
- API;
- Web;
- seed de dados;
- dados fake para demonstração.

### Desenvolvimento

- branch de desenvolvimento;
- banco separado;
- logs detalhados;
- dados fictícios.

### Homologação

- ambiente próximo de produção;
- dados mascarados;
- testes de regressão;
- validação pelo time de produto.

### Produção

- banco gerenciado;
- backup automático;
- monitoramento;
- alertas;
- logs centralizados;
- domínios e TLS;
- controle de acesso.

## CI/CD

Pipeline mínimo:

1. instalar dependências;
2. lint;
3. type-check;
4. testes unitários;
5. testes de integração;
6. build;
7. scan de dependências;
8. gerar artefato;
9. deploy homologação;
10. aprovação;
11. deploy produção.

## Containers

Desde o início:

- Dockerfile para web;
- Dockerfile para API;
- Dockerfile para worker;
- docker-compose local;
- healthcheck;
- variáveis de ambiente controladas.

## Orquestração

### MVP

Pode rodar em:

- Render;
- Railway;
- Fly.io;
- AWS ECS;
- Google Cloud Run;
- Azure Container Apps;
- VPS gerenciada com cuidado.

### Escala

Migrar para:

- Kubernetes gerenciado;
- EKS, GKE ou AKS;
- Helm;
- Terraform;
- autoscaling;
- secrets manager.

## Observabilidade

### Logs

Obrigatórios:

- request_id;
- user_id;
- tenant_id;
- correlation_id;
- rota;
- tempo de resposta;
- status;
- erro;
- módulo.

Ferramentas:

- Pino;
- Loki;
- ELK;
- CloudWatch;
- Datadog, se houver orçamento.

### Métricas

Monitorar:

- latência;
- taxa de erro;
- CPU;
- memória;
- conexões no banco;
- filas;
- jobs com falha;
- uso por tenant;
- consultas lentas;
- volume de uploads;
- tempo de dashboard.

Ferramentas:

- Prometheus;
- Grafana;
- OpenTelemetry.

### Tracing

Usar tracing para:

- chamadas entre frontend/API/worker;
- gargalos;
- erros intermitentes;
- eventos de domínio.

## Backup

Política inicial:

- backup diário automático;
- retenção mínima de 7 a 30 dias;
- backup criptografado;
- teste de restore mensal;
- backup separado por ambiente;
- registro de execução.

## Banco

Requisitos:

- migrations versionadas;
- rollback planejado;
- índices revisados;
- slow query log;
- connection pooling;
- replicas em fase futura;
- particionamento para telemetria futura.

## Arquivos

Armazenamento:

- S3 ou compatível;
- bucket privado;
- URL assinada;
- criptografia;
- política de retenção;
- separação por tenant.

## Alertas

Alertas prioritários:

- API fora do ar;
- banco indisponível;
- erro 5xx elevado;
- fila parada;
- backup falhou;
- disco cheio;
- latência alta;
- muitas falhas de login;
- tenant com uso anormal;
- consumo de custo fora do padrão.

## Custos

Desde o MVP, acompanhar:

- custo por ambiente;
- custo por tenant;
- custo de banco;
- custo de storage;
- custo de mapas;
- custo de SMS/WhatsApp;
- custo de IA;
- custo de logs.

## SLOs, SLIs e Error Budget

Definir SLOs antes de ir para produção. SLO sem SLI é decoração.

### SLIs recomendados

| Jornada do Usuário | SLI | Cálculo |
|---|---|---|
| Painel operacional | Disponibilidade | `respostas não-5xx / total de requests válidos` |
| Criação de viagem | Latência | `requests < 2s / total de requests de criação` |
| Dashboard executivo | Freshness | `dashboards atualizados em < 5min / total de refreshes` |
| Upload de comprovante | Sucesso de upload | `uploads concluídos / uploads iniciados` |

### SLO targets para MVP

| Serviço | SLO | Erro budget (30 dias) |
|---|---|---|
| API Core | 99.5% disponibilidade | ~3.6 horas |
| Dashboard | 99% freshness | ~7.2 horas |
| Upload de arquivos | 99% sucesso | ~7.2 horas |

Revisar os targets após os primeiros 90 dias de operação real.

### Error Budget Policy

- Budget > 50% restante: pace normal de features.
- Budget 20-50% restante: reduzir features, priorizar confiabilidade.
- Budget < 20%: feature freeze, apenas correções de confiabilidade.
- Budget esgotado: revisão de incidente obrigatória antes de qualquer deploy.

## IaC — Infrastructure as Code

Toda infraestrutura deve ser declarativa desde o início. Nunca configurar manualmente em produção.

Ferramenta: Terraform ou OpenTofu.

Estrutura recomendada:
```txt
infra/
  modules/
    database/     → RDS/Cloud SQL config
    network/      → VPC, subnets, security groups
    compute/      → ECS/Cloud Run/K8s cluster
    storage/      → S3 buckets com policies
    secrets/      → Secrets Manager resources
  environments/
    dev/
    staging/
    prod/
```

Regras:
- State remoto com locking (S3 + DynamoDB ou GCS).
- Estado separado por ambiente — nunca workspace.
- Policy as code: tfsec/Checkov no CI para bloquear violações de segurança.
- `terraform plan` como dry-run em toda PR que toca infra.

## GitOps e Progressive Delivery

Deploy de features em produção deve usar entrega progressiva, nunca all-or-nothing.

### Estratégia de deploy

1. **Canary release**: redirecionar 1% do tráfego para nova versão.
2. Monitorar SLOs por 15 minutos.
3. Expandir para 10% → 50% → 100% com verificação automática em cada etapa.
4. **Auto-rollback**: se taxa de erro > 0.5% ou latência p99 > threshold, reverter automaticamente.

Ferramentas:
- ArgoCD + Rollouts para Kubernetes.
- AWS CodeDeploy com blue/green para ECS.
- Render/Railway: usar deploy hooks com smoke tests.

Feature flags: usar para desacoplar deploy de lançamento. Ferramentas: GrowthBook (OSS), Unleash, LaunchDarkly.

## Hardening de Containers

Toda imagem Docker deve seguir:

```dockerfile
# Multi-stage build — nunca copiar node_modules de desenvolvimento
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:22-alpine AS runner
# Nunca rodar como root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/main.js"]
```

Obrigatório:
- Imagem base mínima (alpine, distroless).
- Usuário não-root.
- Nenhum secret na imagem ou nos layers.
- Scan com Trivy em cada build no CI — fail em CVE crítico.
- SBOM gerado em cada imagem com Syft.

## Secrets Management

Nunca usar variáveis de ambiente hardcoded em arquivos commitados.

Fluxo:
1. Secrets armazenados no provedor: Doppler, AWS Secrets Manager, GCP Secret Manager ou Vault.
2. Na inicialização do container, secrets injetados como variáveis de ambiente via integração nativa ou sidecar.
3. Rotação de secrets sem downtime via dual-key pattern.
4. Auditoria de quem acessou quais secrets.

Nunca commitar arquivos `.env` com valores reais. Usar `.env.example` com chaves mas sem valores.

## Alerting — Multi-Window Multi-Burn-Rate

Alertas baseados em burn rate são mais eficazes que thresholds fixos.

Para SLO de 99.5% de disponibilidade:

| Janela | Burn Rate | Severidade | Ação |
|---|---|---|---|
| 1 hora | > 14x | SEV1 — page imediato | 2% do budget em 1h |
| 6 horas | > 6x | SEV2 — page em horário comercial | 5% do budget em 6h |
| 3 dias | > 1x | Ticket/alerta de tendência | 10% do budget em 3 dias |

Cada alerta deve ter:
- Nome descritivo com impacto no usuário.
- Link para runbook específico.
- Owner definido.
- Severidade clara.
- SLA de resposta.

Proibido: alertas de "CPU alta", "memória alta" sem evidência de impacto no usuário.

## Observabilidade — RED e USE

**RED Method** para serviços (por endpoint):
- **R**ate: requests por segundo.
- **E**rrors: taxa de erros.
- **D**uration: latência (p50, p95, p99).

**USE Method** para recursos de infraestrutura:
- **U**tilization: percentual de uso.
- **S**aturation: fila ou espera.
- **E**rrors: erros de recurso.

Toda dashboard deve ter RED + USE como blocos base.

## Synthetic Monitoring

Probes externos para detectar problemas antes dos usuários:

- Verificação de `/health/ready` a cada 30 segundos de múltiplas regiões.
- Fluxo de login simulado a cada 5 minutos.
- Fluxo de criação de viagem a cada 15 minutos.
- Alerta se probe falha por 2 verificações consecutivas.

Ferramentas: Checkly, Grafana Synthetic, UptimeRobot (simplificado), Datadog Synthetic.

## Runbook por Alerta

Todo alerta crítico deve ter runbook vinculado. Estrutura mínima:

```markdown
# Runbook: API com alta taxa de erro 5xx

## Sintoma
Taxa de erros 5xx > 1% em janela de 5 minutos.

## Impacto no usuário
Operadores recebem erros ao criar/atualizar viagens.

## Diagnóstico
1. Verificar logs: `grep "status:500" /logs/api-core.log`
2. Verificar conexões ativas no banco
3. Checar uso de memória dos pods/containers
4. Verificar se houve deploy recente

## Mitigação imediata
- Se causado por deploy: executar rollback via pipeline
- Se causado por banco: verificar pool e slow queries
- Se OOM: reiniciar containers e aumentar limite de memória

## Escalação
- Se não resolvido em 15min: acionar responsável técnico pelo sistema
```

## Disaster Recovery Formal

| Serviço | RTO | RPO | Estratégia |
|---|---|---|---|
| API Core | 30 min | 5 min | Réplica hot standby, failover automático |
| PostgreSQL | 30 min | 5 min | Streaming replication + WAL archive |
| Object Storage | 60 min | 24h | Replicação cross-region do bucket |
| Redis | 15 min | 0 (efêmero) | Redis como cache regenerável, não como fonte de verdade |

Drill obrigatório: restore completo do banco em ambiente de staging com dados mascarados — executar mensalmente e registrar o tempo real de RTO e RPO alcançado.

## FinOps — Controle de Custo

Desde o MVP, marcar todos os recursos com tags de custo:

```txt
tags:
  project: "gfp"
  environment: "prod" | "staging" | "dev"
  service: "api-core" | "worker" | "web" | "database"
  tenant: "shared" | "dedicated"
  cost_center: "infra"
```

Dashboards de custo obrigatórios:
- Custo total por ambiente.
- Custo por serviço.
- Anomalia de custo (alerta se > 20% acima da média semanal).

Otimizações para MVP:
- Banco gerenciado em instância pequena (escalar depois com evidência).
- Object storage: lifecycle policy para mover arquivos > 90 dias para tier IA/Glacier.
- Logs: retenção de 30 dias em hot, 1 ano em cold.

## Conclusão

A infraestrutura deve permitir apresentar o sistema como produto sério. Mesmo no MVP, o ambiente precisa demonstrar estabilidade, previsibilidade e capacidade de operação real. SLOs com error budget, IaC versionado, canary releases, alertas com runbook e synthetic monitoring são o que separa um sistema de produção de um sistema que funciona no computador do desenvolvedor.

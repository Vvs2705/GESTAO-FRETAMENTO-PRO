# 11 — Roadmap de Execução: 90, 180 e 365 dias

## Objetivo

Organizar a evolução do produto em ondas, mantendo foco no MVP sem abandonar a visão de plataforma escalável.

## Norte

Primeiro provar valor dentro da Exclusiva. Depois transformar em produto comercial.

## 0 a 30 dias — Fundação

### Produto

- definir ICP inicial;
- validar jornada operacional real;
- mapear cargos e permissões;
- definir MVP final;
- priorizar módulos;
- criar protótipos de telas principais.

### Tecnologia

- configurar monorepo;
- definir padrões de código;
- configurar banco;
- criar autenticação;
- estruturar tenants;
- criar base de permissões;
- configurar CI/CD inicial.

### UX

- design system inicial;
- layout base;
- dashboard executivo protótipo;
- dashboard operacional protótipo;
- componentes de tabela, filtro, card e formulário.

## 31 a 60 dias — MVP operacional

### Entregas

- cadastro de empresas/filiais;
- cadastro de usuários;
- cargos e permissões;
- cadastro de veículos;
- cadastro de motoristas;
- cadastro de clientes;
- viagens;
- ocorrências;
- documentos;
- dashboard operacional inicial;
- auditoria básica.

### Validação

- operação interna usando o sistema;
- redução de mensagens dispersas;
- registros centralizados;
- feedback dos usuários reais.

## 61 a 90 dias — Abastecimento e gestão

### Entregas

- módulo de abastecimento;
- comprovante/foto;
- km e litros;
- custo por km;
- alertas simples de divergência;
- dashboard de abastecimento;
- dashboard executivo inicial;
- relatórios operacionais.

### Validação

- comparar abastecimentos por veículo;
- identificar consumo fora do padrão;
- mostrar ganho de visibilidade para dono/gestão.

## 91 a 180 dias — Produto interno maduro

### Entregas

- manutenção básica;
- documentos com alertas;
- permissões avançadas;
- relatórios por cliente;
- SLA operacional;
- melhorias no painel;
- exportações controladas;
- notificações internas;
- mobile web otimizado.

### Resultado esperado

A Exclusiva já deve conseguir operar parte relevante da rotina pelo sistema.

## 181 a 365 dias — Produto comercial

### Entregas

- app motorista ou PWA;
- portal cliente;
- financeiro básico;
- contratos;
- multi-filial avançado;
- onboarding de empresa;
- plano comercial;
- billing;
- documentação;
- site comercial;
- piloto com 2 a 5 empresas externas.

### IA inicial

- resumo de ocorrências;
- busca inteligente no histórico;
- alertas de consumo anormal;
- copiloto executivo em modo consulta.

## Roadmap por módulo

| Módulo | MVP | 180 dias | 365 dias |
|---|---|---|---|
| Usuários/cargos | Sim | Avançado | Enterprise |
| Operação/viagens | Sim | Avançado | Tempo real |
| Frota | Sim | Avançado | Telemetria |
| Motoristas | Sim | Documentos/jornada | App |
| Ocorrências | Sim | SLA | IA |
| Abastecimento | Sim | Anomalias | Integrações |
| Manutenção | Básico | Completo | Preditivo |
| Financeiro | Não | Básico | Avançado |
| CRM/contratos | Básico | Médio | Avançado |
| BI | Básico | Avançado | Executivo |
| IA | Não | Experimental | Produto |

## Critérios de sucesso

### 90 dias

- viagens registradas;
- ocorrências registradas;
- abastecimentos registrados;
- dashboard usado pela gestão;
- redução de controle informal.

### 180 dias

- manutenção controlada;
- documentos com alertas;
- relatórios usados em reunião;
- setores usando permissões por cargo.

### 365 dias

- produto vendável;
- pilotos externos;
- proposta comercial clara;
- onboarding repetível;
- case interno da Exclusiva.

## ICP — Ideal Customer Profile

Antes de buscar clientes externos, definir o ICP com precisão.

**ICP primário (validação interna → primeiros clientes pagantes):**
- Empresa de fretamento, turismo ou transporte de colaboradores.
- Frota: 5 a 50 veículos.
- Localização: municípios de interior e cidades médias.
- Dor principal: operação no WhatsApp sem histórico e sem controle de custo.
- Decisor: dono ou gerente geral da empresa.
- Orçamento esperado: R$ 300 a R$ 1.500/mês (pequena), R$ 1.500 a R$ 5.000/mês (média).

**ICP secundário (fase 365 dias):**
- Empresas terceirizadoras de transporte corporativo para indústrias.
- Frota: 50 a 200 veículos.
- Requisito adicional: portal do cliente contratante, SLA formal, relatório mensal.

## Métricas de Sucesso Quantificadas por Fase

### 90 dias (MVP interno)

- ≥ 100 viagens registradas no sistema.
- ≥ 50 abastecimentos com comprovante.
- ≥ 20 ocorrências registradas e tratadas.
- Dashboard usado por pelo menos 3 cargos diferentes.
- NPS interno dos usuários operacionais ≥ 7.
- Zero incidentes de vazamento de dados entre setores.

### 180 dias (Produto maduro interno)

- ≥ 80% das viagens registradas no sistema (vs. em WhatsApp).
- ≥ 90% dos abastecimentos com comprovante digital.
- Tempo médio de registro de ocorrência < 5 minutos.
- 100% dos documentos de frota com alertas configurados.
- ≥ 2 relatórios operacionais usados em reunião de gestão.

### 365 dias (Produto comercial)

- ≥ 2 empresas externas em piloto pago.
- MRR (Monthly Recurring Revenue) > R$ 3.000.
- Churn de pilotos < 20%.
- NPS externo ≥ 30.
- Onboarding de nova empresa < 5 dias úteis.
- CAC < 3 meses de LTV.

## Precificação Inicial

Estratégia de entrada: valor baseado em economia gerada, não em custo de desenvolvimento.

Referência de ancoragem:
- Controle de abastecimento em papel/planilha: risco de 5-15% de custo oculto em consumo não auditado.
- Para frota de 20 veículos com custo médio de R$ 8.000/mês em combustível, economia possível: R$ 400 a R$ 1.200/mês.
- Proposta: plano a partir de R$ 299/mês — custo < 25% da economia potencial só no módulo de abastecimento.

Estrutura de planos:

| Plano | Veículos | Usuários | Preço/mês |
|---|---|---|---|
| Starter | até 10 | até 5 | R$ 299 |
| Operacional | até 30 | até 20 | R$ 799 |
| Empresarial | até 80 | até 50 | R$ 1.999 |
| Enterprise | ilimitado | ilimitado | sob consulta |

Adicional: módulo de IA operacional como add-on, após estabilização dos dados.

## Gates de Qualidade por Fase

### Gate de entrada em produção (0 → 30 dias)

- [ ] CI/CD configurado com lint, type-check e testes.
- [ ] Banco com migrations versionadas.
- [ ] Secrets em gestor externo (nunca em código).
- [ ] Backup do banco configurado e testado.
- [ ] Health check de API funcionando.
- [ ] Observabilidade básica: logs estruturados + alertas de erro.

### Gate para piloto externo (180 → 365 dias)

- [ ] SLOs definidos e monitorados.
- [ ] Disaster recovery testado com restore real.
- [ ] LGPD: DPO nomeado, RoPA documentado, canal de contato publicado.
- [ ] Onboarding documentado e repetível.
- [ ] Contrato de prestação de serviço com cliente.
- [ ] Plano de suporte definido (SLA de resposta).

## Estratégia de Go-to-Market — Fase Comercial

1. **Case da Exclusiva**: documentar antes/depois com números reais (viagens, custo de combustível, ocorrências tratadas). É o principal ativo de vendas.
2. **Indicações diretas**: donos de empresas do setor se conhecem — referência do dono da Exclusiva abre portas.
3. **LinkedIn local**: conteúdo sobre gestão de frota e fretamento voltado para donos de empresas do interior.
4. **Piloto gratuito por 30 dias**: para as primeiras 5 empresas externas — com acompanhamento próximo para garantir ativação.
5. **Comunidades do setor**: associações de transporte, grupos de WhatsApp de gestores de frota.

## Conclusão

O roadmap mantém ambição alta, mas evita dispersão. O sistema precisa vencer primeiro na operação real para depois vencer no mercado. ICP definido, métricas quantificadas por fase, precificação ancorada em valor real e gates de qualidade por fase são o que transforma um roadmap em plano executável.

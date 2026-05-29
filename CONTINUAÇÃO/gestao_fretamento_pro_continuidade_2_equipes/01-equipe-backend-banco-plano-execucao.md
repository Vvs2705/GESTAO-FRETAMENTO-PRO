# 01 — Equipe Backend + Banco de Dados
## Plano ousado de continuidade para Gestão Fretamento Pro

**Objetivo:** transformar o backend e o banco em uma base de plataforma SaaS B2B premium para empresas de fretamento, turismo, transporte corporativo e operações com abastecimento interno/externo.

Este documento deve ser usado como ordem de produção da equipe de engenharia backend, banco, segurança, integrações e analytics.

---

## 1. Resultado esperado

Ao final desta etapa, o backend deve sustentar:

- multiempresa real;
- múltiplas filiais, garagens e bases operacionais;
- cargos, áreas, permissões e escopos;
- dashboard por cargo;
- operação de viagens;
- frota;
- motoristas;
- colaboradores;
- clientes;
- contratos;
- rotas;
- passageiros;
- ocorrências;
- abastecimento interno;
- abastecimento externo;
- controle de tanques;
- controle de carretas/caminhões-tanque;
- controle por abastecedor;
- controle de estoque de combustível;
- divergências e imprevistos;
- manutenção;
- financeiro operacional;
- auditoria;
- eventos de domínio;
- APIs preparadas para web, mobile e integrações futuras.

---

## 2. Stack reforçada

- Backend core: **NestJS + TypeScript**.
- Banco principal: **PostgreSQL**.
- ORM: **Prisma**, com SQL direto para relatórios, PostGIS e consultas críticas.
- Geodados: **PostGIS**.
- Cache, fila rápida e apoio a tempo real: **Redis**.
- Worker: tarefas assíncronas, eventos, agregações e notificações.
- Contratos de API: **OpenAPI**.
- Autenticação: JWT + refresh token rotativo + MFA futuro.
- Autorização: RBAC + ABAC + escopo por tenant/filial/área.
- Analytics: read models, materialized views e tabelas agregadas.

Diretriz: o projeto continua como **monólito modular orientado a domínios**, preparado para extração futura em serviços.

---

## 3. Domínios obrigatórios

1. Identity & Access.
2. Tenants & Branches.
3. People, Employees & Roles.
4. Fleet.
5. Drivers.
6. Clients & Contracts.
7. Routes & Trips.
8. Occurrences.
9. Fuel Management.
10. Maintenance.
11. Documents.
12. Finance.
13. Notifications.
14. Audit.
15. Analytics.
16. Integrations.
17. Mobile Sync.

Cada domínio deve ter controller, service, camada de persistência, DTOs, policies, eventos, testes, seeds e documentação.

---

## 4. Multiempresa, filial e escopo

### Tenant

Representa a empresa cliente.

Campos mínimos:

- id;
- legalName;
- tradeName;
- document;
- status;
- plan;
- billingStatus;
- createdAt;
- updatedAt.

### Branch

Representa filial, garagem, base de abastecimento, pátio ou unidade.

Campos mínimos:

- id;
- tenantId;
- name;
- type: headquarters, garage, fuel_base, maintenance_yard, branch, external_yard;
- address;
- city;
- state;
- geoLocation;
- status.

### Department

Áreas internas:

- operação;
- manutenção;
- abastecimento;
- financeiro;
- RH;
- comercial;
- diretoria;
- segurança;
- fiscalização;
- cliente externo.

### Position / Role

Cargos funcionais:

- motorista;
- abastecedor;
- operador;
- supervisor;
- gerente;
- financeiro;
- manutenção;
- RH;
- CEO;
- dono;
- admin do tenant;
- suporte Vstack.

Regra: toda entidade operacional precisa ter `tenantId`. Entidades dependentes de base física precisam ter `branchId`.

---

## 5. Autorização profissional

O sistema não deve depender de “admin sim/não”. Implementar três camadas.

### RBAC

Permissões por cargo, por exemplo:

- vehicle.read;
- vehicle.create;
- fuel.read;
- fuel.internal.create;
- fuel.external.create;
- fuel.delivery.create;
- fuel.reconciliation.approve;
- finance.read;
- finance.margin.read;
- audit.read;
- analytics.ceo.read.

### ABAC

Regras por atributo:

- usuário só vê filial permitida;
- abastecedor só lança abastecimento em tanque/bomba autorizados;
- supervisor vê equipe/área;
- gerente vê área inteira;
- dono vê tenant inteiro;
- suporte Vstack só acessa com autorização, justificativa e trilha de auditoria.

### Data scope

Cada request deve carregar contexto:

```ts
{
  userId,
  tenantId,
  branchIds,
  roleIds,
  permissions,
  dataScope: "own" | "team" | "branch" | "tenant" | "global_support"
}
```

Critério: nenhum endpoint operacional pode retornar dados sem filtro explícito de tenant.

---

## 6. Abastecimento como módulo estratégico

O módulo de abastecimento deve suportar:

- abastecimento externo em posto;
- abastecimento interno em tanque próprio;
- entrega de combustível por carreta/caminhão-tanque;
- controle de estoque por tanque;
- controle de bico/bomba;
- controle por abastecedor;
- controle por motorista;
- controle por veículo;
- controle por filial/base;
- divergências;
- evidências;
- fotos;
- cupons;
- notas fiscais;
- lacres;
- imprevistos;
- reconciliação.

Combustível deve ser tratado como dinheiro líquido: cada litro precisa ter origem, destino, responsável, evidência, custo e histórico.

---

## 7. Modelagem de abastecimento

### FuelProduct

- id;
- tenantId opcional;
- code;
- name;
- type: diesel_s10, diesel_s500, gasoline, ethanol, arla32, electric_charge, other;
- unit: liter, kwh;
- active.

### FuelSupplier

- id;
- tenantId;
- legalName;
- tradeName;
- document;
- contactName;
- phone;
- email;
- address;
- status.

### FuelStation

Posto externo.

- id;
- tenantId;
- name;
- brand;
- document;
- address;
- geoLocation;
- approved;
- riskLevel;
- notes.

### FuelTank

Tanque interno.

- id;
- tenantId;
- branchId;
- name;
- code;
- fuelProductId;
- capacityLiters;
- minimumStockLiters;
- warningStockLiters;
- physicalLocation;
- status: active, maintenance, inactive, blocked;
- lastCalibrationAt;
- notes.

### FuelPump

Bomba/bico.

- id;
- tenantId;
- branchId;
- fuelTankId;
- name;
- code;
- meterType: mechanical, digital, integrated, manual;
- currentMeterReading;
- status;
- lastInspectionAt.

---

## 8. Entrega por carreta/caminhão-tanque

### FuelDelivery

Representa a chegada de combustível em uma base interna.

Campos:

- id;
- tenantId;
- branchId;
- supplierId;
- fuelProductId;
- fuelTankId;
- deliveryDate;
- invoiceNumber;
- invoiceAccessKey;
- contractedLiters;
- declaredLiters;
- receivedLiters;
- acceptedLiters;
- rejectedLiters;
- unitPrice;
- totalAmount;
- carrierName;
- carrierDocument;
- tankerPlate;
- tankerTrailerPlate;
- tankerDriverName;
- tankerDriverDocument;
- sealNumbers;
- beforeTankLevelLiters;
- afterTankLevelLiters;
- differenceLiters;
- differencePercent;
- status: scheduled, arrived, unloading, received, under_review, approved, rejected, cancelled;
- receivedByUserId;
- approvedByUserId;
- notes.

### FuelDeliveryEvidence

- id;
- tenantId;
- fuelDeliveryId;
- type: invoice_photo, tanker_photo, seal_photo, tank_gauge_photo, video, document, signature;
- fileUrl;
- metadata;
- uploadedByUserId;
- createdAt.

### Fluxo obrigatório

1. Agendar entrega.
2. Registrar chegada.
3. Conferir placa do cavalo e carreta.
4. Registrar motorista da transportadora.
5. Registrar fornecedor.
6. Registrar nota fiscal.
7. Registrar litros contratados/declarados.
8. Registrar lacres.
9. Fotografar documentação e lacres.
10. Medir tanque antes.
11. Registrar início e fim da descarga.
12. Medir tanque depois.
13. Calcular diferença.
14. Aprovar ou colocar em revisão.
15. Atualizar estoque.

Validações:

- nota duplicada;
- fornecedor não aprovado;
- tanque sem capacidade;
- produto diferente do tanque;
- lacre ausente;
- divergência entre nota e recebido;
- entrega em tanque errado;
- ausência de evidências.

---

## 9. Livro razão de combustível

### FuelInventoryMovement

Toda entrada, saída, ajuste, perda ou correção deve gerar movimento.

Campos:

- id;
- tenantId;
- branchId;
- fuelTankId;
- fuelProductId;
- movementType: delivery_in, internal_fueling_out, adjustment_in, adjustment_out, loss, transfer_in, transfer_out, correction, audit_difference;
- sourceType: delivery, fueling, reconciliation, manual_adjustment, transfer, incident;
- sourceId;
- quantityLiters;
- unitCost;
- totalCost;
- stockBefore;
- stockAfter;
- occurredAt;
- createdByUserId;
- approvedByUserId opcional;
- reason;
- metadata.

Regra de ouro: movimento confirmado é append-only. Correção gera novo movimento.

---

## 10. Abastecimento interno

### InternalFueling

- id;
- tenantId;
- branchId;
- vehicleId;
- driverId opcional;
- attendantUserId;
- fuelTankId;
- fuelPumpId;
- fuelProductId;
- odometer;
- hourmeter opcional;
- liters;
- meterBefore;
- meterAfter;
- unitCostCalculated;
- totalCostCalculated;
- tripId opcional;
- routeId opcional;
- occurredAt;
- geoLocation;
- status: draft, completed, under_review, approved, rejected, corrected;
- anomalyFlag;
- anomalyReason;
- notes.

### Evidências obrigatórias configuráveis

- foto do painel/odômetro;
- foto do veículo/placa;
- foto da bomba/bico;
- assinatura digital opcional;
- QR code do veículo opcional;
- localização;
- usuário logado;
- horário do dispositivo;
- horário do servidor.

### Validações

O backend deve calcular:

- média km/l desde último abastecimento;
- consumo esperado por tipo de veículo;
- diferença entre meterBefore e meterAfter;
- estoque disponível no tanque;
- abastecimento duplicado por janela de tempo;
- odômetro menor que anterior;
- litros acima da capacidade do veículo;
- abastecimento fora da filial do abastecedor;
- abastecimento fora do horário permitido;
- veículo bloqueado;
- veículo em manutenção;
- motorista sem autorização;
- combustível incompatível.

Critério: ao confirmar abastecimento interno, gravar InternalFueling, gerar FuelInventoryMovement, atualizar estoque, recalcular consumo, gerar evento, registrar audit log e atualizar dashboard.

---

## 11. Abastecimento externo

### ExternalFueling

- id;
- tenantId;
- branchId opcional;
- vehicleId;
- driverId;
- fuelStationId opcional;
- stationName livre para emergência;
- fuelProductId;
- odometer;
- liters;
- unitPrice;
- totalAmount;
- paymentMethod: cash, corporate_card, invoice, pix, reimbursement, other;
- receiptNumber;
- receiptPhotoUrl;
- receiptAccessKey opcional;
- occurredAt;
- geoLocation opcional;
- tripId opcional;
- status: draft, submitted, under_review, approved, rejected, reimbursed, corrected;
- approvedByUserId;
- anomalyFlag;
- anomalyReason;
- notes.

### Exceções aceitas

- posto não cadastrado;
- cupom perdido;
- abastecimento emergencial;
- valor divergente;
- motorista sem internet;
- odômetro estimado;
- foto ilegível;
- veículo substituto;
- placa divergente no cupom;
- posto fora da lista aprovada.

Regra: inconsistência cai em `under_review`.

---

## 12. Controle por abastecedor

### FuelAttendantProfile

- userId;
- employeeId;
- tenantId;
- branchIds;
- allowedTanks;
- allowedPumps;
- shift;
- status;
- certificationExpiresAt opcional.

### Indicadores por abastecedor

- litros abastecidos por dia;
- quantidade de abastecimentos;
- divergência média;
- abastecimentos em revisão;
- veículos atendidos;
- tempo médio por lançamento;
- fotos ausentes;
- lançamentos corrigidos;
- abastecimentos fora de padrão.

---

## 13. Imprevistos de abastecimento

Criar entidade `FuelIncident` ou subtipo de ocorrência.

Tipos:

- bomba com defeito;
- vazamento;
- cupom perdido;
- nota fiscal divergente;
- abastecimento no veículo errado;
- odômetro errado;
- litragem divergente;
- combustível incorreto;
- tanque com leitura incompatível;
- carreta atrasada;
- fornecedor não entregou volume;
- abastecedor sem acesso;
- motorista recusou assinatura;
- falha de internet;
- emergência operacional;
- suspeita de desvio;
- abastecimento fora da rota.

### FuelIncident

- id;
- tenantId;
- branchId;
- relatedInternalFuelingId;
- relatedExternalFuelingId;
- relatedFuelDeliveryId;
- vehicleId;
- fuelTankId;
- attendantUserId;
- severity: low, medium, high, critical;
- type;
- description;
- status: open, investigating, resolved, dismissed;
- responsibleUserId;
- resolution;
- createdAt;
- resolvedAt.

Regra: toda violação crítica deve gerar incidente automaticamente.

---

## 14. Read models para dashboards

Não deixar o frontend calcular tudo em cima de transacionais.

Criar:

- fuel_daily_summary;
- vehicle_fuel_efficiency_summary;
- attendant_fuel_summary;
- tank_stock_snapshot;
- trip_profitability_summary;
- vehicle_operational_health_summary;
- branch_operations_summary;
- tenant_executive_summary.

### KPIs de abastecimento

- custo total por período;
- litros por produto;
- custo por veículo;
- custo por motorista;
- custo por rota;
- custo por cliente;
- consumo km/l;
- variação contra média histórica;
- abastecimentos em revisão;
- estoque atual por tanque;
- previsão de ruptura;
- divergência por entrega;
- eficiência por abastecedor.

---

## 15. Integração com viagens e financeiro

Cada abastecimento deve poder ser associado a:

- veículo;
- motorista;
- viagem;
- rota;
- cliente;
- contrato;
- centro de custo.

Isso permite responder:

- qual cliente gera mais combustível;
- qual rota consome mais;
- qual contrato é menos rentável;
- qual veículo está fora do padrão;
- qual motorista impacta consumo.

### Entidades financeiras iniciais

- CostCenter;
- OperationalExpense;
- RevenueRecord;
- ContractBillingRule;
- TripCost;
- VehicleCostAllocation;
- FuelCostAllocation;
- MaintenanceCostAllocation.

---

## 16. Auditoria imutável

Ações auditáveis:

- login;
- criação de usuário;
- alteração de permissão;
- alteração de cargo;
- criação/aprovação/correção de abastecimento;
- entrega de combustível;
- ajuste de estoque;
- alteração de contrato;
- alteração financeira;
- exclusão lógica;
- exportação de relatório;
- visualização de dado sensível.

### AuditLog

- id;
- tenantId;
- actorUserId;
- action;
- resourceType;
- resourceId;
- before;
- after;
- ip;
- userAgent;
- createdAt;
- correlationId.

Regra: não apagar audit log. Quando necessário, anonimizar campos pessoais preservando trilha operacional.

---

## 17. APIs prioritárias

### Fuel

- GET /fuel/products
- GET /fuel/tanks
- POST /fuel/tanks
- GET /fuel/pumps
- POST /fuel/pumps
- GET /fuel/suppliers
- POST /fuel/suppliers
- POST /fuel/deliveries
- GET /fuel/deliveries/:id
- POST /fuel/deliveries/:id/evidence
- POST /fuel/deliveries/:id/approve
- POST /fuel/internal
- GET /fuel/internal/:id
- POST /fuel/internal/:id/evidence
- POST /fuel/internal/:id/approve
- POST /fuel/external
- GET /fuel/external/:id
- POST /fuel/external/:id/approve
- GET /fuel/tanks/:id/stock
- GET /fuel/reconciliation
- POST /fuel/reconciliation
- GET /fuel/incidents
- POST /fuel/incidents/:id/resolve

### Analytics

- GET /analytics/executive
- GET /analytics/operations
- GET /analytics/fuel
- GET /analytics/fleet
- GET /analytics/maintenance
- GET /analytics/finance

---

## 18. Eventos de domínio

- fuel.delivery.received
- fuel.delivery.approved
- fuel.internal.created
- fuel.internal.completed
- fuel.external.submitted
- fuel.external.approved
- fuel.stock.low
- fuel.stock.divergence_detected
- maintenance.order.created
- document.expiring
- dashboard.metric.updated

Usar outbox pattern para eventos críticos.

---

## 19. Offline e mobile sync

O mobile de abastecimento deve operar com internet ruim.

Campos:

- clientGeneratedId;
- deviceId;
- localCreatedAt;
- serverReceivedAt;
- syncStatus;
- syncError;
- idempotencyKey.

Critério: dois envios repetidos do mesmo abastecimento não podem gerar duplicidade.

---

## 20. Testes obrigatórios

### Unitários

- permissões;
- km/l;
- estoque;
- divergência;
- idempotência;
- eventos.

### Integração

- entrega atualiza estoque;
- abastecimento interno gera saída;
- abastecimento externo vai para revisão;
- usuário não acessa filial indevida;
- tenant A não enxerga tenant B.

### E2E

- entrega → estoque → abastecimento interno → dashboard;
- abastecimento externo → aprovação → custo operacional;
- gerente acessando filial errada;
- abastecedor tentando aprovar divergência sem permissão.

---

## 21. Sprints sugeridas

### Sprint 1 — Fundamento

- revisar schema;
- implementar branch/data scope;
- revisar permissões;
- criar fuel products, tanks, pumps, suppliers, stations;
- criar seeds realistas.

### Sprint 2 — Abastecimento interno

- InternalFueling;
- evidências;
- movimento de estoque;
- validações;
- dashboard read model inicial.

### Sprint 3 — Entrega por carreta

- FuelDelivery;
- evidências;
- lacres;
- nota fiscal;
- medição antes/depois;
- aprovação;
- divergência.

### Sprint 4 — Abastecimento externo

- ExternalFueling;
- posto aprovado/não cadastrado;
- cupom;
- revisão;
- aprovação;
- custo operacional.

### Sprint 5 — Auditoria e analytics

- audit logs sensíveis;
- fuel dashboards;
- resumo executivo;
- read models;
- testes de isolamento por tenant.

### Sprint 6 — Mobile sync e contingência

- idempotência;
- clientGeneratedId;
- fila de sync;
- conflito;
- reprocessamento.

---

## 22. Critérios de aceite final

A frente backend/banco estará pronta quando:

- um tenant operar com duas filiais;
- cada filial tiver tanques próprios;
- uma carreta puder entregar combustível;
- a entrega atualizar estoque;
- abastecedor puder abastecer veículo internamente;
- motorista puder registrar abastecimento externo;
- divergências entrarem em revisão;
- dashboards retornarem indicadores;
- permissões bloquearem áreas indevidas;
- audit log registrar ações críticas;
- testes comprovarem isolamento entre empresas;
- APIs estiverem documentadas em OpenAPI;
- seeds gerarem uma operação realista para demo.

---

## 23. Pergunta central

Se o dono perguntar **“onde foi parar o combustível?”**, o sistema precisa responder com dados, evidências, responsáveis e impacto financeiro.

Se responder, o módulo está no caminho certo.

---

## Referências técnicas

- NestJS: https://docs.nestjs.com/
- PostgreSQL: https://www.postgresql.org/docs/current/
- PostGIS: https://postgis.net/
- OWASP ASVS: https://owasp.org/www-project-application-security-verification-standard/

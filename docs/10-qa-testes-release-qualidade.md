# 10 — QA, Testes, Release e Qualidade

## Objetivo

Garantir que a plataforma seja desenvolvida com qualidade, evitando regressões, falhas de permissão, dados errados, dashboards quebrados e problemas em produção.

## Princípio

O MVP pode ser pequeno. Não pode ser frágil.

## Tipos de teste

### Testes unitários

Validam regras pequenas.

Exemplos:

- cálculo de custo por km;
- regra de documento vencendo;
- validação de hodômetro;
- permissão de cargo;
- status permitido de viagem.

### Testes de integração

Validam módulos conectados.

Exemplos:

- criar viagem com veículo e motorista;
- lançar abastecimento;
- abrir ocorrência;
- gerar auditoria;
- filtrar dados por tenant.

### Testes E2E

Validam fluxo real.

Fluxos prioritários:

1. cadastrar empresa;
2. criar usuário e cargo;
3. cadastrar veículo;
4. cadastrar motorista;
5. cadastrar cliente;
6. criar viagem;
7. registrar ocorrência;
8. lançar abastecimento;
9. visualizar dashboard;
10. tentar acessar dado proibido.

### Testes de permissão

Obrigatórios.

Cenários:

- motorista não vê financeiro;
- operador não altera permissões;
- abastecimento não vê contratos;
- financeiro não altera status operacional;
- supervisor vê apenas sua filial;
- CEO vê visão geral;
- usuário de uma empresa não vê dados de outra.

### Testes de segurança

Mínimos:

- IDOR;
- injection;
- autenticação;
- expiração de token;
- brute force;
- upload indevido;
- acesso a arquivo sem permissão;
- exportação não autorizada.

### Testes visuais

Importantes para dashboards.

Validar:

- layout desktop;
- layout tablet;
- layout mobile;
- estados vazios;
- loading;
- erro;
- dados extremos;
- tabelas longas;
- nomes grandes.

## Critérios de aceite por funcionalidade

Toda história deve ter:

- usuário;
- objetivo;
- regra de negócio;
- permissões;
- campos obrigatórios;
- resultado esperado;
- eventos gerados;
- auditoria;
- impacto no dashboard;
- critérios de erro.

## Definition of Done

Uma entrega só está pronta quando:

- passou no lint;
- passou no type-check;
- tem teste mínimo;
- tem validação de permissão;
- tem tratamento de erro;
- tem loading/empty/error state;
- gera auditoria se for ação crítica;
- respeita tenant;
- foi revisada por outro dev;
- foi validada em homologação;
- possui changelog.

## Release

### Tipos

- alpha interna;
- beta controlada;
- piloto na Exclusiva;
- produção interna;
- piloto externo;
- SaaS comercial.

### Estratégia

- feature flags;
- releases pequenas;
- rollback;
- changelog;
- monitoramento pós-deploy;
- acompanhamento de erros.

## Dados de teste

Criar massa realista:

- empresa com 2 filiais;
- 20 veículos;
- 30 motoristas;
- 5 clientes;
- 15 rotas;
- 100 viagens;
- 50 abastecimentos;
- 20 ocorrências;
- documentos vencidos e vencendo;
- usuários por cargo.

## QA de dashboard

Validar:

- números corretos;
- filtros corretos;
- período correto;
- tenant correto;
- permissão correta;
- performance aceitável;
- drill-down funcionando;
- exportação controlada.

## Métricas de qualidade

- bugs por release;
- bugs críticos;
- cobertura de testes em regras críticas;
- tempo de resposta da API;
- falhas de permissão;
- incidentes de produção;
- taxa de erro;
- tempo para corrigir bug;
- retrabalho por módulo.

## Testes de Contrato

Quando frontend e backend evoluem em paralelo, contratos de API quebram silenciosamente. Usar contract testing.

Ferramentas:
- **Pact** (consumer-driven): frontend define o contrato; backend prova que o satisfaz.
- **Spectral**: lint do schema OpenAPI — detecta quebras de contrato antes do deploy.
- **Schemathesis**: testa a API automaticamente contra o schema OpenAPI, gerando casos de borda.

Fluxo mínimo:
1. Frontend gera arquivo de pact ao rodar testes unitários.
2. CI publica o pact no Pact Broker.
3. Backend CI consome e verifica o pact antes de mergear.
4. Deploy só acontece se o contrato for satisfeito.

## Mutation Testing

Cobertura de linha não garante que os testes detectam bugs. Mutation testing injecta bugs no código e verifica se os testes falham.

Aplicar em regras de negócio críticas:
- Cálculo de km/l e custo por km.
- Validação de hodômetro.
- Regras de transição de status.
- Lógica de permissão por cargo.

Ferramentas:
- TypeScript/Node: **Stryker Mutator**.
- Python: **mutmut**.

Target: mutation score > 80% nas classes de domínio core.

## Testcontainers — Infraestrutura Real nos Testes

Testes de integração nunca devem usar mocks de banco ou fila. Usar Testcontainers.

```typescript
// Exemplo: teste de integração com Postgres real
import { PostgreSqlContainer } from '@testcontainers/postgresql';

describe('FuelRecordRepository', () => {
  let container;
  let dataSource;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16').start();
    dataSource = await createDataSource(container.getConnectionUri());
    await runMigrations(dataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await container.stop();
  });

  it('deve detectar anomalia quando km/l < 80% da média histórica', async () => {
    // arrange
    await seedVehicleWithHistory(dataSource, vehicleId, avgKmL: 10);
    // act
    const result = await fuelRecordRepository.create({ kmL: 7.5, vehicleId });
    // assert
    expect(result.anomalyFlag).toBe(true);
  });
});
```

## Testes de Performance com SLOs como Critério de Aceite

Testes de performance não são opcionais quando há dashboards e listagens.

Baseline de performance mínimo:

| Endpoint | P95 alvo | P99 alvo | Concorrência |
|---|---|---|---|
| GET /v1/trips | < 500ms | < 1s | 50 usuários simultâneos |
| GET /v1/dashboards/executive | < 1s | < 2s | 20 usuários simultâneos |
| POST /v1/trips | < 1s | < 2s | 20 usuários simultâneos |
| GET /v1/fuel-records/anomalies | < 800ms | < 1.5s | 30 usuários simultâneos |

Ferramenta: k6. Script em versão de controle. Executar em staging com dados realistas (seed de 100k registros). Falhar o CI se SLOs não forem atingidos.

## Testes de Acessibilidade Automatizados

Acessibilidade não é apenas compliance — é qualidade de produto.

Integrar axe-core nos testes E2E:

```typescript
import { checkA11y } from 'axe-playwright';

test('Dashboard operacional não tem violações de acessibilidade', async ({ page }) => {
  await page.goto('/dashboard/operations');
  await checkA11y(page, undefined, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag22aa'] }
  });
});
```

Regras mínimas WCAG 2.2 AA:
- Contraste de texto ≥ 4.5:1 (normal) e 3:1 (grande).
- Todos os controles têm label acessível.
- Navegação por teclado em todos os fluxos.
- Foco visível em todos os elementos interativos.
- Tabelas têm headers (`th` com `scope`).
- Formulários têm `aria-describedby` para erros.

## Testes de Propriedades (Property-Based Testing)

Para validadores, calculadores e parsers, usar property-based testing para encontrar edge cases automaticamente.

```typescript
// Exemplo com fast-check
import * as fc from 'fast-check';

test('km/l nunca é negativo quando litros e distância são positivos', () => {
  fc.assert(
    fc.property(
      fc.float({ min: 0.1, max: 1000 }), // litros
      fc.float({ min: 1, max: 50000 }), // km rodados
      (liters, km) => {
        const kmPerLiter = calculateKmPerLiter(km, liters);
        return kmPerLiter > 0;
      }
    )
  );
});
```

Usar em: cálculos de custo, validação de hodômetro, regras de anomalia, cálculo de margem financeira.

## Testes de Chaos em Staging

Antes de cada release importante, executar:

- **Pod/container kill**: reiniciar o serviço durante operação normal — verificar recovery sem perda de request.
- **Latência injetada no banco**: adicionar 2s de latência e verificar que timeouts são tratados.
- **Fila parada**: parar o worker de outbox e verificar que as operações continuam funcionando (sem perda de eventos).
- **Upload de arquivo falho**: simular S3 indisponível e verificar mensagem de erro amigável.

Ferramentas: Toxiproxy para latência/falha de rede, scripts de kill para containers.

## API Contract Validation no CI

```yaml
# Exemplo pipeline com Spectral + Schemathesis
- name: Lint OpenAPI
  run: spectral lint openapi/api.yaml --ruleset openapi/.spectral.yaml

- name: Contract tests
  run: schemathesis run openapi/api.yaml --base-url http://localhost:3000 --checks all
```

## Definição de Done — Revisão

Uma entrega só está pronta quando, além dos critérios originais:

- Passou nos testes de contrato (se toca API entre frontend e backend).
- Passou em testes de performance (se toca listagem ou dashboard).
- Passou em teste de acessibilidade axe-core (se toca UI).
- Testes de integração usam infraestrutura real (Testcontainers).
- Nenhuma permissão nova foi adicionada sem teste de autorização.

## Conclusão

Qualidade precisa ser parte do processo. O sistema será usado para decisões operacionais reais, então erro de permissão, erro de dashboard ou perda de registro não podem ser tratados como detalhe. Contract testing, mutation testing, Testcontainers, testes de performance com SLO e axe-core são o que transforma uma suite de testes de cobertura em suite de confiança de release.

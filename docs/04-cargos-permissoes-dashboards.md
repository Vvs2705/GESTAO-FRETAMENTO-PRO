# 04 — Cargos, Permissões e Dashboards

## Objetivo

Definir uma experiência em que cada colaborador acessa apenas as abas, ações, dados e dashboards compatíveis com seu cargo, área e nível hierárquico.

## Princípio central

> Cada pessoa vê apenas o que precisa para executar. Cada gestor vê o que precisa para supervisionar. O dono vê o que precisa para decidir.

## Modelo de acesso recomendado

A plataforma deve combinar:

- RBAC: permissões por cargo/papel;
- ABAC: regras por atributo, como filial, área, turno, cliente, veículo ou hierarquia;
- escopo por tenant;
- escopo por filial;
- escopo por departamento;
- escopo por sensibilidade do dado.

## Níveis hierárquicos

### Nível 1 — Operacional individual

Exemplos:

- motorista;
- abastecimento;
- auxiliar de manutenção;
- atendente.

Acesso restrito ao próprio trabalho.

### Nível 2 — Operacional de área

Exemplos:

- operador;
- analista;
- assistente administrativo.

Acesso ao fluxo da área.

### Nível 3 — Supervisão

Exemplos:

- supervisor operacional;
- supervisor de frota;
- supervisor de manutenção.

Acesso à equipe, pendências e indicadores da área.

### Nível 4 — Gerência

Exemplos:

- gerente operacional;
- gerente financeiro;
- gerente comercial.

Acesso amplo à área, relatórios e decisões.

### Nível 5 — Diretoria / Dono / CEO

Acesso executivo e visão consolidada.

## Cargos e experiências

### Motorista

#### Abas

- Minha escala
- Minha viagem
- Checklist
- Ocorrências
- Documentos próprios
- Comunicados

#### Pode fazer

- visualizar escala;
- iniciar/finalizar viagem, quando houver app;
- registrar ocorrência;
- enviar foto;
- preencher checklist;
- consultar documentos próprios.

#### Não pode fazer

- ver dados financeiros;
- ver dados de outros motoristas;
- editar viagem de terceiros;
- alterar veículo;
- exportar dados;
- ver contrato de cliente.

#### Dashboard

- próxima viagem;
- veículo designado;
- status do checklist;
- ocorrências abertas;
- avisos importantes;
- documentos próximos do vencimento.

### Operador de Central

#### Abas

- Painel operacional
- Viagens
- Rotas
- Motoristas
- Veículos
- Ocorrências
- Passageiros, se aplicável

#### Pode fazer

- criar viagem;
- alterar status operacional;
- vincular motorista;
- vincular veículo;
- registrar ocorrência;
- acompanhar atrasos;
- consultar disponibilidade.

#### Não pode fazer

- alterar permissões;
- ver lucro/margem;
- excluir registros críticos;
- alterar contratos.

#### Dashboard

- viagens do dia;
- atrasos;
- veículos em operação;
- motoristas escalados;
- ocorrências abertas;
- rotas críticas.

### Supervisor Operacional

#### Abas

- Painel da operação
- Viagens
- Escalas
- Ocorrências
- Motoristas
- Veículos
- Relatórios operacionais

#### Pode fazer

- aprovar ajustes operacionais;
- supervisionar equipe;
- reatribuir viagem;
- acompanhar SLA;
- revisar ocorrências;
- fechar ocorrências simples.

#### Dashboard

- SLA por cliente;
- viagens críticas;
- atrasos por rota;
- ocorrências por tipo;
- produtividade da equipe;
- gargalos do dia.

### Gerente Operacional

#### Abas

- Visão operacional
- Indicadores
- Clientes operacionais
- Escalas
- Frota operacional
- Relatórios
- Ocorrências críticas

#### Pode fazer

- ver indicadores consolidados;
- aprovar alterações críticas;
- analisar performance por cliente;
- acompanhar riscos;
- exportar relatórios da área.

#### Dashboard

- performance mensal;
- SLA por cliente;
- custo operacional estimado;
- maiores ofensores;
- problemas recorrentes;
- comparação entre períodos.

### Abastecimento

#### Abas

- Abastecimentos
- Veículos
- Postos
- Relatórios de consumo
- Alertas

#### Pode fazer

- lançar abastecimento;
- anexar cupom;
- registrar hodômetro;
- consultar histórico do veículo;
- sinalizar divergência.

#### Não pode fazer

- ver contratos;
- ver dados de RH;
- ver margem comercial;
- alterar viagem.

#### Dashboard

- litros no período;
- custo total;
- preço médio por litro;
- veículos com consumo fora do padrão;
- abastecimentos sem comprovante;
- ranking de maior gasto.

### Manutenção

#### Abas

- Manutenção
- Veículos
- Ordens de serviço
- Peças
- Pneus
- Documentos técnicos

#### Dashboard

- veículos parados;
- OS abertas;
- custo de manutenção;
- manutenção preventiva vencendo;
- reincidência por veículo;
- fornecedores críticos.

### Financeiro

#### Abas

- Contas a pagar
- Contas a receber
- Faturamento
- Custos
- Centros de custo
- Relatórios financeiros

#### Dashboard

- receita prevista;
- despesas do mês;
- margem por cliente;
- custo por veículo;
- inadimplência;
- contas vencendo.

### Comercial

#### Abas

- Clientes
- Propostas
- Contratos
- Histórico comercial
- Pipeline

#### Dashboard

- propostas abertas;
- clientes ativos;
- contratos vencendo;
- receita potencial;
- SLA comercial;
- oportunidades.

### RH / Administrativo

#### Abas

- Colaboradores
- Documentos
- Treinamentos
- Exames
- Cargos
- Jornada, se aplicável

#### Dashboard

- documentos vencendo;
- colaboradores ativos;
- treinamentos pendentes;
- exames vencendo;
- admissões/desligamentos;
- alertas de compliance.

### Gerente Geral

#### Abas

- Visão geral
- Operação
- Frota
- Financeiro resumido
- Clientes
- Riscos
- Relatórios

#### Dashboard

- saúde da operação;
- custo total;
- receita;
- SLA;
- ocorrências críticas;
- veículos parados;
- contratos em risco.

### Dono / CEO

#### Abas

- Cockpit executivo
- Empresa
- Operação
- Financeiro
- Frota
- Clientes
- Riscos
- BI
- Auditoria

#### Dashboard executivo

O CEO não precisa ver bagunça. Precisa ver decisão.

Blocos:

1. Hoje
   - viagens em andamento;
   - atrasos críticos;
   - ocorrências graves;
   - veículos parados;
   - alertas urgentes.

2. Mês
   - receita estimada;
   - custo operacional;
   - combustível;
   - manutenção;
   - margem estimada.

3. Clientes
   - melhores clientes;
   - clientes com mais ocorrência;
   - contratos em risco;
   - SLA por cliente.

4. Frota
   - disponibilidade;
   - custo por veículo;
   - consumo fora do padrão;
   - manutenção crítica.

5. Pessoas
   - motoristas escalados;
   - motoristas com ocorrências recorrentes;
   - documentos vencendo;
   - faltas.

6. Risco
   - dados sensíveis acessados;
   - documentos vencidos;
   - ocorrências não tratadas;
   - abastecimentos suspeitos.

## Matriz de permissões inicial

| Recurso | Motorista | Operador | Supervisor | Gerente | CEO |
|---|---:|---:|---:|---:|---:|
| Ver própria escala | Sim | Sim | Sim | Sim | Sim |
| Criar viagem | Não | Sim | Sim | Sim | Sim |
| Alterar viagem | Não | Sim | Sim | Sim | Sim |
| Excluir viagem | Não | Não | Não | Restrito | Restrito |
| Registrar ocorrência | Sim | Sim | Sim | Sim | Sim |
| Fechar ocorrência | Não | Parcial | Sim | Sim | Sim |
| Ver financeiro | Não | Não | Não | Parcial | Sim |
| Ver abastecimento | Próprio/limitado | Consulta | Sim | Sim | Sim |
| Lançar abastecimento | Restrito | Sim | Sim | Sim | Sim |
| Ver contratos | Não | Não | Parcial | Sim | Sim |
| Alterar permissões | Não | Não | Não | Restrito | Sim |
| Exportar relatórios | Não | Não | Parcial | Sim | Sim |
| Ver auditoria | Não | Não | Parcial | Sim | Sim |

## Permissões críticas

Algumas ações exigem permissão especial e auditoria:

- alterar cargo;
- alterar permissão;
- exportar dados;
- excluir registro;
- alterar valor financeiro;
- alterar contrato;
- editar abastecimento antigo;
- alterar documento sensível;
- fechar ocorrência grave;
- visualizar dados pessoais sensíveis.

## Permissões — Implementação Técnica

### Nomenclatura de Permissões

Usar padrão `recurso.ação` para todas as permissões:

```txt
trip.read        trip.create       trip.update       trip.delete
trip.cancel      trip.export

vehicle.read     vehicle.create    vehicle.update    vehicle.delete
vehicle.assign

fuel.read        fuel.create       fuel.update       fuel.approve
fuel.export      fuel.anomaly.view

driver.read      driver.create     driver.update
driver.document.read   driver.document.sensitive.read

finance.read     finance.export
finance.account.create finance.account.update

user.read        user.create       user.update
permission.manage   role.manage

audit.read       audit.export

occurrence.read  occurrence.create occurrence.update
occurrence.close.critical   occurrence.reopen
```

### Estrutura de Verificação

Verificação deve ocorrer em múltiplas camadas:

1. **Guard de rota (middleware)**: verifica se o usuário tem o papel correto para acessar o módulo.
2. **Policy service (use case layer)**: verifica permissão granular para a ação específica.
3. **Repository layer**: sempre filtra por `tenant_id` — nunca confia que a camada de cima garantiu isolamento.
4. **Frontend**: esconde elementos sem permissão (UX), mas nunca confia que isso é o controle de segurança.

```typescript
// Exemplo de guard combinado RBAC + ABAC
@Injectable()
class TripPermissionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = getUser(context);
    const action = getRequiredAction(context); // ex: 'trip.cancel'

    // RBAC: o cargo tem a permissão?
    if (!user.role.permissions.includes(action)) return false;

    // ABAC: a ação é no escopo do tenant e filial do usuário?
    const resourceTenantId = getResourceTenantId(context);
    if (user.tenantId !== resourceTenantId) return false;

    return true;
  }
}
```

## Step-Up Authentication para Ações Sensíveis

Ações críticas devem exigir re-confirmação mesmo com sessão ativa.

Ações que disparam step-up:
- Alterar permissão de usuário.
- Exportar dados financeiros ou pessoais.
- Fechar ocorrência grave.
- Editar abastecimento com data anterior a 24 horas.
- Visualizar documentos pessoais de motoristas.
- Alterar cargo de usuário.

Implementação: verificar timestamp de última autenticação forte na sessão. Se > 30 minutos, exigir senha ou segundo fator antes de prosseguir. Registrar a confirmação em audit_log.

## Auditoria de Permissões

Revisão periódica de permissões é obrigatória. Acesso não revisado acumula risco.

- Revisão de usuários ativos vs. funcionários desligados: quinzenal.
- Revisão de permissões concedidas acima do padrão do cargo: mensal.
- Remoção automática de permissões de usuários inativos há > 90 dias: automatizada.
- Alerta para admin quando usuário recebe permissão além do cargo base: imediato.
- Relatório de permissões por cargo disponível para CEO e gestores: sob demanda.

## Escalabilidade do Modelo de Permissões

Para fase futura com múltiplos clientes e necessidades customizadas, considerar evolução para ReBAC (Relationship-Based Access Control) ao estilo Zanzibar (Google).

Ferramentas OSS para ReBAC:
- **OpenFGA**: implementação open source do Zanzibar.
- **SpiceDB** / **Permify**: alternativas com boa DX.

ReBAC permite expressar: "usuário X pode ver viagem Y porque gerencia a filial Z que criou a viagem Y" — algo que RBAC puro não consegue expressar sem proliferação de papéis.

Para MVP, RBAC + ABAC com `tenant_id` e `branch_id` no escopo é suficiente.

## Conclusão

A personalização por cargo é um dos diferenciais centrais do produto. Ela deve aparecer comercialmente como:

> Gestão limpa, segura e personalizada: cada setor trabalha com seu painel, e a liderança acompanha tudo sem bagunça.

Para ser real — não apenas visual — a segurança deve estar no backend em todas as camadas, com step-up auth para ações sensíveis, auditoria de permissões periódica e nomenclatura consistente de permissões desde o primeiro módulo.

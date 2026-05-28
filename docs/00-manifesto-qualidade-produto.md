# 00 — Manifesto de Qualidade do Produto

## Ambição

Este sistema não deve nascer como um painel genérico criado para “parecer moderno”. Ele deve nascer como uma ferramenta de gestão operacional séria, visualmente forte, segura, rastreável e capaz de virar produto comercial.

A primeira versão será um MVP, mas a mentalidade não é de protótipo descartável. A mentalidade é de **fundação escalável**.

## Posição de produto

A plataforma deve ser posicionada como:

> Sistema operacional de gestão para empresas de transporte fretado, turismo, eventos e mobilidade corporativa.

A promessa principal:

> Tirar a operação do WhatsApp, planilhas e memória das pessoas, transformando tudo em histórico, controle, indicadores e decisões.

## Padrões que não podem ser aceitos

- Interface genérica sem identidade.
- Dashboard cheio de cards sem hierarquia.
- Tabelas sem filtros reais.
- Cadastro sem lógica de negócio.
- Dados sem dono, sem histórico e sem auditoria.
- Permissão apenas visual no frontend.
- Relatórios sem utilidade para decisão.
- Sistema que depende de uma pessoa saber “onde fica cada coisa”.
- Código sem organização por domínio.
- Banco sem padrão de nomes, chaves, índices e rastreabilidade.
- MVP que precisa ser refeito do zero para crescer.

## Princípios de design do produto

### 1. Cada tela deve responder uma pergunta de negócio

Exemplos:

- Operação: o que está acontecendo agora?
- Frota: quais veículos estão disponíveis, parados ou críticos?
- Abastecimento: onde está o maior gasto ou consumo fora do padrão?
- Manutenção: qual veículo pode parar se nada for feito?
- Financeiro: qual cliente, rota ou veículo está dando margem ou prejuízo?
- Dono/CEO: onde está o risco, o custo e a oportunidade?

### 2. Cada cargo vê o que precisa

A plataforma deve respeitar o princípio de visibilidade por função:

- Motorista não vê financeiro.
- Abastecimento não vê dados comerciais.
- Comercial não vê informações sensíveis de RH.
- Operação não altera regras estratégicas.
- Supervisor vê sua área.
- Gerente vê sua área com profundidade.
- Dono/CEO enxerga a empresa de forma executiva.

### 3. Tudo que importa vira histórico

O sistema precisa registrar:

- quem criou;
- quem alterou;
- quando alterou;
- o que mudou;
- motivo, quando aplicável;
- vínculo com viagem, veículo, motorista, cliente ou contrato.

### 4. O MVP precisa ser pequeno, mas não raso

A primeira versão não deve tentar entregar tudo. Porém, aquilo que entrar precisa ser bem feito.

MVP recomendado:

- usuários, cargos e permissões;
- veículos;
- motoristas;
- clientes;
- viagens;
- ocorrências;
- abastecimentos;
- documentos;
- dashboards por cargo;
- histórico pesquisável;
- auditoria mínima.

## Norte de qualidade

O produto deve passar a sensação de:

- controle;
- precisão;
- segurança;
- confiança;
- organização;
- velocidade;
- beleza profissional;
- maturidade empresarial.

## North Star Metric

O produto precisa de uma métrica principal que captura valor real entregue ao usuário.

**North Star Metric proposta:** Operações ativas gerenciadas pela plataforma por mês (viagens + abastecimentos + ocorrências registradas por tenant ativo).

Essa métrica sobe quando: clientes usam o sistema no dia a dia. Cai quando: clientes voltam para WhatsApp/planilha. É um proxy honesto de adoção real — não de cadastros.

Contra-métricas obrigatórias para evitar otimização desonesta:
- Taxa de churn de tenants ativos.
- NPS dos usuários operacionais (não só do dono).
- Número de sessões por usuário por semana.

## Definition of Done — Global

Uma funcionalidade só está pronta para produção quando:

- [ ] A dor real que resolve foi validada com um usuário real (pelo menos um).
- [ ] Passou em lint, type-check e testes unitários.
- [ ] Tem teste de integração com infraestrutura real (Testcontainers).
- [ ] Passou em teste de permissão (cargo proibido não acessa).
- [ ] Respeita tenant isolation (sem vazamento de dados entre empresas).
- [ ] Gera auditoria se for ação crítica.
- [ ] Tem loading, empty e error state desenhados e implementados.
- [ ] Passou em verificação axe-core sem violações WCAG 2.2 AA.
- [ ] Foi revisada por outro desenvolvedor.
- [ ] Foi validada em homologação com dados realistas.
- [ ] Tem changelog de release.
- [ ] Não degradou performance do dashboard principal (verificado via teste de carga).

## Pergunta de validação para cada funcionalidade

Antes de desenvolver qualquer recurso, responder:

1. Qual dor real isso resolve?
2. Quem usa?
3. Quem decide com essa informação?
4. Qual indicador melhora?
5. Que dado precisa ser preservado?
6. Qual cargo pode ver?
7. Qual cargo pode alterar?
8. Como isso aparece no dashboard?
9. Como isso ajuda a vender o produto para outra empresa?
10. Qual é a métrica de sucesso mensurável desta feature em 30 dias?
11. Se essa feature for removida em 6 meses, o que é necessário para não perder dados?

## Arquitetura de Qualidade — Não-Negociáveis Técnicos

Além do manifesto de produto, estes são os não-negociáveis técnicos:

- **Isolamento de tenant**: `tenant_id` em toda tabela operacional; verificação em toda query; nunca confiar só no frontend.
- **Auditoria de ações críticas**: toda alteração sensível tem trilha com `before`, `after`, `actor`, `timestamp`, `ip`.
- **Idempotência em operações críticas**: criação de viagem, lançamento de abastecimento e registro de ocorrência não podem ser duplicados por retry.
- **State machines no domínio**: status de viagem, veículo e ocorrência só transitam por caminhos válidos — exceção de domínio para tentativa inválida.
- **Secrets fora do código**: nenhuma credencial em repositório, log ou resposta de API.
- **Observabilidade de produção**: toda API tem trace, log estruturado e métricas antes de ir ao ar.
- **Deploy reversível**: todo deploy tem rollback definido e testado antes de ir para produção.

# 13 — Redesign Premium UX/UI 2026

## Gestão Fretamento Pro — Plano profundo de evolução visual, emocional e tecnológica

**Objetivo:** transformar o Gestão Fretamento Pro em uma plataforma B2B de alto padrão, com estética de produto enterprise, sensação de controle operacional em tempo real e experiência visual que faça o cliente sentir confiança, domínio e prazer ao usar o sistema.

---

## 1. Diagnóstico executivo

O projeto tem uma base técnica promissora: usa Next.js, React, TypeScript, NestJS, PostgreSQL/PostGIS, Redis, monorepo com `apps` e `packages`, além de um pacote próprio de UI. Também já existem tokens, componentes reutilizáveis, tabelas, cards, sidebar, topbar, gráficos e um dashboard executivo inicial. ([GitHub][1])

O problema não é falta de tecnologia. O problema é que a interface ainda passa a sensação de **produto inacabado**, com áreas muito ricas ao lado de telas quase vazias, textos genéricos, dados estáticos, componentes visuais simples e pouca construção emocional. Algumas telas internas como manutenção, financeiro, veículos, motoristas, clientes, documentos, ocorrências e configurações aparecem como páginas de texto básico, o que quebra imediatamente a percepção de produto premium. ([GitHub][2])

A documentação de UX do próprio repositório já aponta a direção correta: evitar aparência genérica/amadora, transmitir controle, clareza, tecnologia, confiança e elegância. Porém, a implementação atual ainda não chegou no nível descrito nessa visão. ([GitHub][3])

---

## 2. Problema central de percepção

Hoje o produto parece uma mistura de:

* dashboard administrativo genérico;
* protótipo SaaS com dados simulados;
* sistema operacional real ainda não totalmente polido;
* design system inicial, mas sem identidade visual forte.

A estética atual ainda usa padrões seguros demais: branco, slate, azul, cards simples, sidebar tradicional, tabelas básicas e textos descritivos. Isso funciona, mas não encanta. Para um sistema de fretamento, transporte, frota, combustível, manutenção e operação crítica, o usuário precisa sentir algo mais forte:

> “Estou diante de um centro de comando da minha operação.”

Essa sensação precisa aparecer desde o login até os dados internos.

---

## 3. Comparativo com o mercado

### 3.1 Samsara

A Samsara se posiciona como uma plataforma conectada e orientada por IA para operações físicas, com foco em GPS em tempo real, telemetria, segurança, manutenção, combustível, roteirização e integrações. Em transporte de passageiros, também comunica localização em tempo real, notificações proativas de atraso e controle operacional integrado. ([Samsara][4])

**Lição para o Gestão Fretamento Pro:**
o sistema não pode parecer apenas um “cadastro com dashboard”. Precisa parecer uma plataforma viva, com operação em movimento, alertas contextuais, mapas inteligentes, anomalias, recomendações e decisões priorizadas.

### 3.2 Geotab

A Geotab comunica que rastreamento de frota não é apenas “pontos no mapa”, mas envolve segurança do motorista, compliance, emissões, saúde do veículo, produtividade, otimização e dados acionáveis por IA. ([Geotab][5])

**Lição para o Gestão Fretamento Pro:**
cada veículo, motorista, viagem e cliente precisa ter uma narrativa operacional: risco, saúde, custo, SLA, histórico, próximo evento e impacto financeiro.

### 3.3 Verizon Connect

A Verizon Connect destaca dashboards customizáveis, relatórios, alertas, mapa em tempo quase real, visualização com clustering e detalhamento sob demanda. ([Verizon Connect][6])

**Lição para o Gestão Fretamento Pro:**
a tela interna deve permitir “zoom mental”: visão executiva primeiro, depois detalhes sob demanda. O cliente não deve se perder em tabelas; ele deve navegar por camadas de decisão.

### 3.4 Fleetio

A Fleetio foca em centralização de dados, manutenção preventiva, inspeções, ordens de serviço, controle de combustível, anomalias, custos e compliance. ([Fleetio][7])

**Lição para o Gestão Fretamento Pro:**
os módulos de frota, manutenção, combustível e documentos precisam ter aparência de sistema operacional real, com workflow, evidências, histórico, custos, responsáveis e estados claros.

---

## 4. Diagnóstico por área visual

## 4.1 Login

O login atual tenta criar uma atmosfera premium com fundo escuro, gradientes e linguagem como “Command Mobility Platform”. Isso é um bom começo, mas ainda soa genérico e um pouco artificial. O placeholder de e-mail, o rodapé com “product by”, a versão visível e a mistura de inglês com português reduzem a percepção de sistema maduro. ([GitHub][8])

### Problemas

* Copy genérica: “Command Mobility Platform”.
* Visual escuro interessante, mas ainda com cara de template.
* Falta prova de valor antes do login.
* Falta sensação de segurança, ambiente corporativo e operação real.
* Rodapé e versão parecem detalhe técnico interno.
* Falta personalização por empresa/filial.

### Recomendações

Transformar o login em uma tela de **entrada para centro de comando**.

Nova estrutura recomendada:

```md
Lado esquerdo:
- mapa abstrato de rotas em movimento;
- linhas de fretamento, pontos de embarque, alertas sutis;
- frase forte: “Controle cada viagem, custo e risco da sua operação em tempo real.”
- 3 indicadores visuais:
  - Viagens monitoradas hoje
  - Alertas críticos tratados
  - SLA operacional

Lado direito:
- card de autenticação limpo e premium;
- logo forte;
- seleção de ambiente/empresa se aplicável;
- e-mail, senha, MFA;
- botão principal: “Entrar no Centro de Operações”;
- microcopy: “Ambiente protegido com trilha de auditoria e controle por perfil.”
```

### Copy sugerida

**Antes:**
“Command Mobility Platform”

**Depois:**
“Centro de Comando para Operações de Fretamento”

**Antes:**
“Acessar Painel de Controle”

**Depois:**
“Entrar no Centro de Operações”

**Antes:**
“[seu.email@vstack.com](mailto:seu.email@vstack.com)”

**Depois:**
“[nome@empresa.com.br](mailto:nome@empresa.com.br)”

---

## 4.2 Recuperação de senha

A tela de recuperação é funcional, mas muito simples. ([GitHub][9])

### Recomendações

Adicionar:

* confirmação visual de segurança;
* instrução clara sobre prazo do link;
* estado de e-mail enviado;
* opção “voltar ao login” mais elegante;
* ícone de escudo ou envelope;
* linguagem corporativa.

Copy sugerida:

> “Informe seu e-mail corporativo. Enviaremos um link seguro para redefinição de acesso. Por segurança, o link expira em 15 minutos.”

---

## 4.3 App shell: Sidebar, TopBar e navegação

A estrutura atual de sidebar e topbar é correta, com agrupamento de módulos, filial, notificações e usuário. Porém, a execução visual ainda é básica: navegação tradicional, estados simples e pouca hierarquia emocional. ([GitHub][10])

### Recomendações

Criar um **Command Shell**:

* sidebar com ícones mais precisos por domínio;
* separação entre “Operação”, “Ativos”, “Financeiro”, “Governança”;
* indicador vivo de alertas por módulo;
* modo compacto realmente refinado;
* topbar com busca global;
* command palette com atalhos;
* troca de filial com status operacional;
* notificações com severidade: crítica, atenção, informativa;
* avatar com estado de sessão, perfil e permissões.

A documentação de permissões do projeto já prevê RBAC/ABAC, dashboards por perfil e autenticação reforçada. Isso deve refletir na interface: cada usuário precisa ver uma experiência ajustada ao seu papel. ([GitHub][11])

---

## 4.4 Dashboard executivo

O dashboard executivo é a melhor tela atual. Ele já possui KPIs, gráficos, alertas, decisões pendentes, mapa simulado, status de frota e ranking de clientes. ([GitHub][12])

O problema é que ele ainda parece um painel de demonstração, não um cockpit decisório.

### Recomendações

Transformar o dashboard em **Executive Command Center**.

Nova hierarquia:

1. **Linha de decisão imediata**

   * “3 decisões exigem ação hoje”
   * “R$ 18.400 em margem sob risco”
   * “2 contratos com SLA em queda”
   * “1 anomalia crítica de combustível”

2. **Mapa operacional vivo**

   * viagens em andamento;
   * status por rota;
   * atraso previsto;
   * risco climático/operacional;
   * veículos parados;
   * agrupamento por região.

3. **Radar de risco**

   * frota;
   * motoristas;
   * clientes;
   * combustível;
   * manutenção;
   * documentos.

4. **Margem e SLA por cliente**

   * ranking não apenas de receita;
   * mostrar rentabilidade, inadimplência operacional, SLA, ocorrência e tendência.

5. **Fila de decisões**

   * aprovar divergência;
   * acionar manutenção;
   * renegociar rota;
   * bloquear veículo;
   * escalar ocorrência.

A estética deve seguir o princípio: **menos cards soltos, mais narrativa operacional**.

---

## 4.5 Operações

A tela de operações está muito curta e não transmite a complexidade de uma operação de fretamento. ([GitHub][13])

### Recomendação

Criar uma tela de **Live Dispatch Board**:

* coluna esquerda: lista de viagens de hoje;
* centro: mapa/linha do tempo;
* direita: detalhes da viagem selecionada;
* status: programada, embarque, em rota, atrasada, concluída, ocorrência;
* previsão de atraso;
* motorista;
* veículo;
* cliente;
* ponto de embarque;
* SLA;
* ações rápidas.

### Componentes necessários

* `LiveTripCard`
* `RouteTimeline`
* `DelayRiskBadge`
* `SlaCountdown`
* `PassengerBoardingStatus`
* `TripIncidentDrawer`
* `NextBestAction`

---

## 4.6 Frota e veículos

A frota atual ainda aparece principalmente como listagem. ([GitHub][14])

### Recomendação

Criar uma visão de **Vehicle Health Intelligence**.

Cada veículo precisa mostrar:

* saúde geral;
* disponibilidade;
* custo por km;
* consumo médio;
* próxima manutenção;
* documentos vencendo;
* últimas ocorrências;
* rota mais comum;
* motorista mais associado;
* rentabilidade indireta.

### Nova tela recomendada

```md
Topo:
- Total da frota
- Disponíveis
- Em operação
- Em manutenção
- Bloqueados por documento

Corpo:
- matriz de veículos por status
- cards de saúde
- tabela avançada
- drawer lateral com histórico completo
```

---

## 4.7 Combustível

O módulo de combustível é um dos mais promissores do projeto. Ele já trabalha com tanques, recebimentos, abastecedores, consumo por filial e entregas. ([GitHub][15])

### Evolução recomendada

Transformar em **Fuel Control Tower**:

* conciliação entre nota, tanque, bomba, veículo e motorista;
* anomalias automáticas;
* variação de consumo por rota;
* ranking de veículos com desvio;
* histórico visual por tanque;
* evidência documental;
* aprovação de divergências;
* trilha de auditoria.

### Insight visual importante

Combustível é um dos módulos com maior potencial emocional porque envolve dinheiro, fraude, perda e controle. A tela deve transmitir precisão e proteção patrimonial.

---

## 4.8 Manutenção

A página de manutenção está praticamente vazia. ([GitHub][2])

### Recomendação

Criar uma experiência inspirada em manutenção preventiva enterprise:

* calendário de manutenções;
* backlog por criticidade;
* veículos parados;
* ordens de serviço;
* custo por categoria;
* fornecedores;
* peças;
* previsão de indisponibilidade;
* impacto operacional.

Componentes:

* `MaintenanceCalendar`
* `WorkOrderCard`
* `DowntimeImpact`
* `PreventiveSchedule`
* `MaintenanceCostChart`

---

## 4.9 Financeiro

A tela financeira atual é apenas uma descrição. ([GitHub][16])

### Recomendação

Criar um **Financial Operations Center**:

* margem por cliente;
* margem por rota;
* custo por km;
* custo por veículo;
* combustível vs receita;
* manutenção vs receita;
* inadimplência operacional;
* contratos deficitários;
* simulação de reajuste;
* exportação executiva.

Essa tela deve ser visualmente mais sofisticada, com gráficos comparativos, cenários e alertas de margem.

---

## 4.10 Motoristas

A tela de motoristas ainda está básica. ([GitHub][17])

### Recomendação

Criar perfil de motorista com:

* status atual;
* jornada;
* CNH;
* treinamentos;
* ocorrências;
* média de atraso;
* consumo médio associado;
* avaliação operacional;
* escala;
* compliance.

Importante: evitar gamificação infantil. O tom deve ser profissional, justo e auditável.

---

## 4.11 Clientes

A tela de clientes deve deixar de ser cadastro e virar **Customer SLA Intelligence**. ([GitHub][18])

Adicionar:

* contratos ativos;
* rotas contratadas;
* SLA realizado;
* margem;
* ocorrências;
* reajustes;
* ranking de risco;
* satisfação;
* documentos;
* histórico comercial.

O cliente final deve enxergar valor imediatamente: “esse sistema sabe onde estou ganhando e perdendo dinheiro”.

---

## 4.12 Documentos, ocorrências e configurações

Documentos e ocorrências são áreas críticas, mas ainda estão simples. ([GitHub][19])

### Documentos

Criar:

* cofre documental;
* vencimentos por severidade;
* documentos por veículo, motorista, cliente e contrato;
* upload com status;
* OCR futuro;
* trilha de auditoria;
* bloqueio operacional por documento vencido.

### Ocorrências

Criar:

* central de incidentes;
* severidade;
* responsável;
* prazo;
* impacto financeiro;
* evidências;
* comentários;
* linha do tempo;
* status de resolução.

### Configurações

Criar:

* organização;
* filiais;
* usuários;
* perfis;
* permissões;
* integrações;
* notificações;
* parâmetros operacionais;
* branding da empresa.

---

## 5. Redesign do Design System

O pacote `@gestao-fretamento/ui` já possui tokens, componentes e exports. O Tailwind também já consome variáveis de tema. ([GitHub][20])

Agora é necessário evoluir de “tokens básicos” para uma identidade visual proprietária.

## 5.1 Nova identidade: Command Mobility Design System

### Paleta recomendada

```md
Night Ops:        #08111F
Deep Petroleum:  #102A43
Command Blue:    #2563EB
Radar Cyan:      #06B6D4
Signal Amber:    #F59E0B
Critical Red:    #DC2626
Success Green:   #16A34A
Surface Light:   #F8FAFC
Surface Card:    #FFFFFF
Text Strong:     #0B1220
Text Muted:      #64748B
```

### Direção visual

* menos “azul SaaS genérico”;
* mais contraste controlado;
* superfícies com profundidade;
* cards com hierarquia;
* dark mode para cockpit executivo;
* light mode para operação administrativa;
* uso de cor apenas para significado operacional.

Design tokens devem representar decisões de produto, não apenas valores visuais soltos. O Material Design define tokens como representações de valores visuais, como cor, fonte e medidas, e recomenda usar papéis semânticos em vez de valores arbitrários. ([Material Design][21])

---

## 5.2 Componentes novos obrigatórios

Criar no pacote `packages/ui`:

```md
PageHeader
SectionHeader
MetricHero
InsightCard
DecisionCard
RiskRadar
HealthScore
LiveMapPanel
RouteTimeline
EntityDrawer
AuditTrail
EvidenceGallery
SmartFilterBar
EmptyStatePremium
ErrorStatePremium
LoadingSkeleton
SlaBadge
FinancialImpactBadge
AnomalyCard
CommandPalette
NotificationCenter
```

Nenhuma tela nova deve ser construída apenas com `<div>`, título e texto. Cada módulo deve nascer do design system.

---

## 6. UX: prazer visual não é enfeite

A estética importa porque usuários tendem a perceber produtos visualmente agradáveis como mais fáceis de usar. Porém, boa aparência não compensa problemas reais de usabilidade. ([Nielsen Norman Group][22])

Portanto, o redesenho deve seguir três regras:

1. **Beleza precisa servir clareza.**
2. **Dados precisam virar decisão.**
3. **Interação precisa reduzir ansiedade operacional.**

Para sistemas complexos, a revelação progressiva ajuda a esconder recursos avançados até que sejam necessários, reduzindo erro e dificuldade de aprendizado. ([Nielsen Norman Group][23])

Aplicação prática:

* dashboard mostra decisão, não tudo;
* drawer mostra detalhe sob demanda;
* filtros avançados ficam recolhidos;
* tabelas não devem ser o primeiro contato visual;
* alertas precisam explicar causa, impacto e ação sugerida.

---

## 7. Como remover a sensação de “feito com IA”

### O que causa essa sensação

* textos genéricos;
* gradientes sem propósito;
* cards iguais demais;
* dados fictícios óbvios;
* nomes em inglês sem contexto;
* excesso de “plataforma inteligente”;
* falta de microcopy operacional;
* módulos incompletos;
* falta de estados reais: vazio, erro, carregamento, offline, permissão negada.

### Como resolver

Usar linguagem de domínio:

**Ruim:**
“Gerencie sua operação com inteligência.”

**Melhor:**
“Identifique atrasos, custos fora da curva e veículos indisponíveis antes que impactem o contrato.”

**Ruim:**
“Dashboard inteligente.”

**Melhor:**
“3 rotas estão reduzindo sua margem nesta semana.”

**Ruim:**
“Ocorrência detectada.”

**Melhor:**
“Veículo 3204 atrasou 18 min na rota Cliente A — impacto estimado: SLA em risco.”

---

## 8. IA dentro do produto, sem parecer artificial

A IA deve aparecer como inteligência contextual, não como chatbot genérico.

### Ideias recomendadas

* **Resumo executivo automático:** “O que mudou desde ontem?”
* **Análise de anomalia de combustível:** “Este abastecimento está 22% acima do padrão da rota.”
* **Risco de atraso:** “Alta probabilidade de atraso por histórico da rota + veículo substituto.”
* **Sugestão de ação:** “Acionar veículo reserva reduz risco de quebra de SLA.”
* **Resumo de ocorrência:** “3 eventos relacionados ao mesmo motorista nos últimos 14 dias.”

A experiência deve ser: o sistema pensa junto, mas não rouba o controle do operador.

---

## 9. Padrões visuais por módulo

## 9.1 Executivo

Visual: escuro, premium, estratégico.
Sensação: controle, inteligência, visão de dono.

## 9.2 Operação

Visual: alta densidade, tempo real, mapa, timeline.
Sensação: urgência organizada.

## 9.3 Frota

Visual: saúde, disponibilidade, manutenção, status.
Sensação: previsibilidade.

## 9.4 Combustível

Visual: precisão, auditoria, anomalia, patrimônio.
Sensação: proteção contra perda.

## 9.5 Financeiro

Visual: margem, custo, simulação, tendência.
Sensação: clareza de rentabilidade.

## 9.6 Documentos

Visual: compliance, vencimento, bloqueio, evidência.
Sensação: segurança jurídica.

---

## 10. Backlog de implementação

## Fase 0 — Correções imediatas

* Remover telas internas que exibem apenas texto.
* Remover dados fake óbvios de produção.
* Padronizar todos os headers de página.
* Criar skeleton loading premium.
* Criar empty states úteis.
* Criar error states claros.
* Revisar copy do login.
* Remover versão técnica visível no login.
* Padronizar idioma: português profissional.
* Corrigir páginas com `return` quebrado por newline quando aplicável.
* Garantir que todo módulo tenha pelo menos dashboard, tabela, filtros e drawer de detalhe.

## Fase 1 — Redesign visual principal

* Novo login.
* Novo app shell.
* Novo dashboard executivo.
* Nova tela de operações.
* Evolução do módulo combustível.
* Revisão completa da sidebar/topbar.
* Tokens V2 no `packages/ui`.

## Fase 2 — Módulos operacionais

* Frota premium.
* Veículos premium.
* Motoristas premium.
* Clientes com SLA.
* Documentos com vencimentos.
* Ocorrências com timeline.
* Manutenção com ordens de serviço.
* Financeiro com margem por rota.

## Fase 3 — Inteligência e prazer de uso

* Command palette.
* Busca global.
* Mapas com camadas.
* Drawer universal de entidade.
* Alertas inteligentes.
* Anomalias.
* Recomendações.
* Personalização por perfil.
* Modo executivo.
* Modo operação em tempo real.
* Microinterações.

---

## 11. Critérios de aceite visual

Nenhuma entrega deve ser aprovada se violar qualquer item abaixo:

* Nenhuma página pode ser apenas título e texto.
* Nenhum módulo crítico pode depender apenas de tabela.
* Todo card precisa ter significado operacional.
* Todo KPI precisa ter comparação, tendência ou consequência.
* Toda tela precisa ter loading, empty, error e permission state.
* Toda ação crítica precisa ter confirmação e trilha.
* Toda cor precisa ter significado.
* Todo alerta precisa indicar severidade, causa provável e ação sugerida.
* O sistema precisa funcionar bem em 1366px, 1440px e telas grandes.
* Contraste e foco devem seguir boas práticas de acessibilidade; WCAG destaca contraste suficiente como requisito para leitura visual adequada. ([W3C][24])

---

## 12. Teste dos 5 segundos

Ao abrir qualquer tela, o usuário deve conseguir responder em até 5 segundos:

1. Onde estou?
2. O que está acontecendo?
3. O que exige minha atenção?
4. Qual é o impacto?
5. O que posso fazer agora?

Se a tela não responder essas perguntas, ela ainda não está pronta.

---

## 13. Direção final de produto

O Gestão Fretamento Pro não deve competir visualmente com sistemas administrativos comuns. Deve competir com plataformas como Samsara, Geotab, Verizon Connect e Fleetio no nível de percepção: controle, inteligência, telemetria, operação viva, segurança e gestão financeira integrada.

A meta visual não é “ficar bonito”.
A meta é fazer o cliente pensar:

> “Essa plataforma entende minha operação melhor do que as planilhas, grupos de WhatsApp e sistemas antigos que eu uso hoje.”

Quando o cliente sentir isso no login, no dashboard, na frota, no combustível, na manutenção e no financeiro, a estética deixará de parecer amadora e passará a parecer inevitável.

---

## 14. Confiança da análise

**Alta** para diagnóstico estrutural do repositório, porque a análise foi baseada diretamente nos arquivos públicos, componentes, páginas, tokens e documentação existentes.

**Alta** para comparação de mercado, usando referências oficiais de players como Samsara, Geotab, Verizon Connect e Fleetio.

**Média** para julgamento visual final, porque a análise foi feita pelo código e documentação pública, não por execução local com screenshots reais renderizados. Mesmo assim, o padrão de implementação encontrado já mostra claramente os pontos de amadorismo visual, inconsistência e oportunidade de evolução.

[1]: https://github.com/Vvs2705/GESTAO-FRETAMENTO-PRO "GitHub - Vvs2705/GESTAO-FRETAMENTO-PRO · GitHub"
[2]: https://raw.githubusercontent.com/Vvs2705/GESTAO-FRETAMENTO-PRO/main/apps/web-admin/src/app/%28dashboard%29/maintenance/page.tsx "raw.githubusercontent.com"
[3]: https://raw.githubusercontent.com/Vvs2705/GESTAO-FRETAMENTO-PRO/main/docs/05-ux-ui-design-system-dashboard.md "raw.githubusercontent.com"
[4]: https://www.samsara.com/?utm_source=chatgpt.com "Samsara: The leading fleet management and safety platform"
[5]: https://www.geotab.com/?utm_source=chatgpt.com "Geotab: One Platform - Total Fleet Management"
[6]: https://www.verizonconnect.com/?utm_source=chatgpt.com "Verizon Connect: Fleet Management Software and Solutions"
[7]: https://www.fleetio.com/solutions/fleet-management-software?utm_source=chatgpt.com "Fleet Management Software: Real-Time Visibility & Control"
[8]: https://raw.githubusercontent.com/Vvs2705/GESTAO-FRETAMENTO-PRO/main/apps/web-admin/src/app/%28auth%29/login/page.tsx "raw.githubusercontent.com"
[9]: https://raw.githubusercontent.com/Vvs2705/GESTAO-FRETAMENTO-PRO/main/apps/web-admin/src/app/%28auth%29/forgot-password/page.tsx "raw.githubusercontent.com"
[10]: https://raw.githubusercontent.com/Vvs2705/GESTAO-FRETAMENTO-PRO/main/packages/ui/src/components/Sidebar.tsx "raw.githubusercontent.com"
[11]: https://raw.githubusercontent.com/Vvs2705/GESTAO-FRETAMENTO-PRO/main/docs/04-cargos-permissoes-dashboards.md "raw.githubusercontent.com"
[12]: https://raw.githubusercontent.com/Vvs2705/GESTAO-FRETAMENTO-PRO/main/apps/web-admin/src/app/%28dashboard%29/executive/page.tsx "raw.githubusercontent.com"
[13]: https://raw.githubusercontent.com/Vvs2705/GESTAO-FRETAMENTO-PRO/main/apps/web-admin/src/app/%28dashboard%29/operations/page.tsx "raw.githubusercontent.com"
[14]: https://raw.githubusercontent.com/Vvs2705/GESTAO-FRETAMENTO-PRO/main/apps/web-admin/src/app/%28dashboard%29/fleet/page.tsx "raw.githubusercontent.com"
[15]: https://raw.githubusercontent.com/Vvs2705/GESTAO-FRETAMENTO-PRO/main/apps/web-admin/src/app/%28dashboard%29/fuel/page.tsx "raw.githubusercontent.com"
[16]: https://raw.githubusercontent.com/Vvs2705/GESTAO-FRETAMENTO-PRO/main/apps/web-admin/src/app/%28dashboard%29/finance/page.tsx "raw.githubusercontent.com"
[17]: https://raw.githubusercontent.com/Vvs2705/GESTAO-FRETAMENTO-PRO/main/apps/web-admin/src/app/%28dashboard%29/drivers/page.tsx "raw.githubusercontent.com"
[18]: https://raw.githubusercontent.com/Vvs2705/GESTAO-FRETAMENTO-PRO/main/apps/web-admin/src/app/%28dashboard%29/clients/page.tsx "raw.githubusercontent.com"
[19]: https://raw.githubusercontent.com/Vvs2705/GESTAO-FRETAMENTO-PRO/main/apps/web-admin/src/app/%28dashboard%29/documents/page.tsx "raw.githubusercontent.com"
[20]: https://github.com/Vvs2705/GESTAO-FRETAMENTO-PRO/tree/main/packages/ui/src/components "GESTAO-FRETAMENTO-PRO/packages/ui/src/components at main · Vvs2705/GESTAO-FRETAMENTO-PRO · GitHub"
[21]: https://m3.material.io/foundations/design-tokens?utm_source=chatgpt.com "Design tokens – Material Design 3"
[22]: https://www.nngroup.com/articles/aesthetic-usability-effect/?utm_source=chatgpt.com "The Aesthetic-Usability Effect"
[23]: https://www.nngroup.com/articles/progressive-disclosure/?utm_source=chatgpt.com "Progressive Disclosure"
[24]: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum?utm_source=chatgpt.com "Understanding Success Criterion 1.4.3: Contrast (Minimum)"

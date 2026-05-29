# 02 — Equipe Visual + Frontend + Mobile + Identidade
## Plano ousado de continuidade para Gestão Fretamento Pro

**Objetivo:** transformar o sistema em uma experiência visual premium, responsiva, com identidade própria, sem aparência genérica, sem cara de IA e preparada para desktop, tablet e mobile de campo.

Este documento deve ser usado pela equipe de produto visual, UX, UI, frontend web, design system, marca e mobile/PWA.

---

## 1. Resultado esperado

O sistema deve parecer:

- plataforma B2B premium;
- central de comando operacional;
- produto confiável para dono, gerente e equipe de campo;
- sistema com marca, personalidade e acabamento;
- experiência melhor que planilha, ERP antigo e dashboard genérico;
- solução pronta para ser apresentada a dono de empresa, investidor ou cliente piloto.

O sistema não pode parecer:

- template copiado;
- painel administrativo genérico;
- tela feita por IA;
- conjunto de cards sem alma;
- visual improvisado;
- sistema escolar;
- dashboard tutorial.

---

## 2. Direção de marca

### Nome principal

**Gestão Fretamento Pro**

Variações:

- Fretamento Pro;
- GFP;
- Gestão Fretamento;
- Exclusiva Gestão apenas para versão interna.

### Assinatura institucional

Usar:

**product by Vstack-solutions**

### Onde usar

- rodapé da tela de login;
- tela “Sobre o sistema”;
- modal de versão;
- rodapé de relatórios;
- página de suporte;
- splash screen mobile em tamanho reduzido.

### Onde não usar

Não repetir a assinatura em todos os cards. O produto precisa valorizar o cliente e a operação, não parecer propaganda.

---

## 3. Identidade visual: alma do produto

### Personalidade

Transmitir:

- controle;
- precisão;
- movimento;
- confiança;
- tecnologia;
- gestão;
- sobriedade;
- inteligência operacional;
- força empresarial;
- clareza.

### Evitar

- azul SaaS genérico sem diferenciação;
- cards brancos soltos em fundo cinza;
- ícones aleatórios;
- gradientes exagerados;
- sombras pesadas;
- bordas infantis;
- ilustrações genéricas de IA;
- fotos de banco de imagem sem contexto;
- excesso de emojis;
- excesso de glassmorphism;
- excesso de neon.

### Conceito visual

Nome interno:

**Command Mobility Design**

Inspiração:

- central de tráfego;
- painel de frota;
- dashboard executivo;
- sistema financeiro premium;
- mapas, linhas, movimento;
- rotas, custos, risco e status reais.

---

## 4. Logo

### Conceito

O logo deve unir:

1. rota/movimento;
2. controle/gestão;
3. estrutura modular/profissional.

### Possíveis caminhos

- letra G formada por rota;
- letra F formada por faixa de pista;
- caminho com dois pontos conectados;
- escudo abstrato de gestão/frota;
- monograma GFP;
- seta sutil de avanço;
- marcador de mapa estilizado, sem parecer app de delivery.

### Variações obrigatórias

- horizontal;
- vertical;
- símbolo isolado;
- monocromático;
- negativo;
- favicon;
- app icon;
- splash mobile;
- relatório;
- fundo escuro;
- fundo claro.

Critério: o logo deve funcionar em 16px, 32px, 64px, sidebar colapsada, app mobile e relatório.

---

## 5. Paleta de cores

Direção premium e operacional.

- Grafite profundo: `#0B1220`
- Azul petróleo: `#102A43`
- Azul comando: `#1D4ED8`
- Ciano operacional: `#06B6D4`
- Verde positivo: `#10B981`
- Âmbar alerta: `#F59E0B`
- Vermelho crítico: `#EF4444`
- Cinza aço: `#64748B`
- Fundo claro: `#F8FAFC`
- Branco técnico: `#FFFFFF`

Regra: cor deve comunicar estado e hierarquia, não apenas decorar.

---

## 6. Tipografia

Recomendações:

- Inter;
- Geist;
- Manrope;
- IBM Plex Sans;
- Sora apenas para títulos, se funcionar bem.

Para números:

- tabular numbers;
- alinhamento decimal;
- pesos consistentes.

Critério: KPI financeiro, litros, quilometragem e horários precisam ser entendidos em menos de 2 segundos.

---

## 7. Design system

Criar design system próprio, não usar componente cru.

### Tokens

- cores;
- espaçamento;
- radius;
- sombras;
- bordas;
- tipografia;
- ícones;
- estados;
- motion;
- z-index;
- breakpoints.

### Componentes base

- Button;
- IconButton;
- Input;
- Select;
- Combobox;
- DatePicker;
- TimePicker;
- Textarea;
- Checkbox;
- Radio;
- Switch;
- Badge;
- StatusPill;
- Card;
- MetricCard;
- DataTable;
- EmptyState;
- Modal;
- Drawer;
- Toast;
- Tabs;
- Breadcrumb;
- Sidebar;
- Topbar;
- CommandMenu;
- Timeline;
- ActivityLog;
- FileUpload;
- EvidenceGallery;
- Stepper;
- ApprovalBar;
- RiskIndicator;
- VehicleStatusChip;
- FuelStockGauge;
- MapCard.

### Componentes premium

#### CommandCard

Card executivo com título, valor, variação, estado, mini gráfico, contexto e ação.

#### OperationalTimeline

Linha do tempo para viagem, ocorrência, abastecimento, entrega de combustível e manutenção.

#### EvidencePanel

Painel de fotos, documentos, assinatura, geolocalização, horário e responsável.

#### ApprovalFlow

Fluxo de aprovação com status, aprovador, motivo, divergências e histórico.

---

## 8. Layout principal web

### Estrutura

- sidebar lateral;
- topbar contextual;
- área de conteúdo;
- painel lateral opcional;
- command menu;
- notificações;
- seletor de tenant/filial;
- perfil do usuário.

### Sidebar por cargo

Dono:

- Visão geral;
- Operação;
- Frota;
- Abastecimento;
- Manutenção;
- Financeiro;
- Clientes;
- Contratos;
- Relatórios;
- Auditoria;
- Configurações.

Abastecedor:

- Meus abastecimentos;
- Novo abastecimento;
- Entregas de combustível;
- Tanques;
- Ocorrências;
- Histórico.

Motorista:

- Minha escala;
- Minhas viagens;
- Abastecimento externo;
- Ocorrências;
- Documentos.

### Topbar

Mostrar:

- contexto atual;
- filial ativa;
- data/hora;
- status operacional;
- alertas críticos;
- busca global;
- ação principal.

---

## 9. Dashboards por cargo

### Dashboard do dono/CEO

Deve parecer sala de comando.

Cards:

- receita estimada;
- custo de combustível;
- margem operacional;
- viagens do dia;
- ocorrências críticas;
- veículos parados;
- documentos vencendo;
- estoque de combustível;
- contratos em risco;
- clientes mais relevantes.

Visualizações:

- mapa operacional;
- custo por mês;
- ranking de veículos por custo;
- clientes por margem;
- timeline de alertas;
- decisões pendentes.

### Dashboard do gerente operacional

- viagens em andamento;
- viagens atrasadas;
- veículos disponíveis;
- motoristas escalados;
- substituições;
- ocorrências abertas;
- gargalos por rota;
- risco do dia.

### Dashboard do abastecimento

- estoque por tanque;
- litros abastecidos hoje;
- abastecimentos internos;
- abastecimentos externos;
- entregas por carreta;
- divergências;
- abastecedores ativos;
- consumo fora do padrão;
- custo médio por litro;
- previsão de ruptura.

### Dashboard da manutenção

- veículos parados;
- OS abertas;
- preventivas vencendo;
- custo por veículo;
- falhas recorrentes;
- veículos liberados;
- peças críticas.

### Dashboard financeiro

- custo por cliente;
- custo por rota;
- receitas previstas;
- despesas por categoria;
- margem por contrato;
- abastecimento como centro de custo;
- manutenção como centro de custo.

---

## 10. Módulo visual de abastecimento

Este módulo deve ser vitrine do sistema.

### Abastecimento interno — desktop

Mostrar:

- status dos tanques;
- estoque atual;
- entradas por carreta;
- saídas por veículo;
- consumo por filial;
- divergências;
- abastecedores;
- aprovações pendentes;
- incidentes.

### Abastecimento interno — mobile/PWA

Fluxo:

1. abrir app;
2. escolher filial/base;
3. tocar em “Novo abastecimento interno”;
4. identificar veículo por placa, QR Code ou busca;
5. confirmar motorista, se aplicável;
6. informar odômetro;
7. selecionar tanque/bomba;
8. informar litros ou leitura da bomba;
9. tirar foto do painel;
10. tirar foto do veículo/placa;
11. confirmar;
12. receber protocolo.

### Entrega por carreta

Fluxo visual:

1. entrega agendada;
2. chegada da carreta;
3. fornecedor;
4. placa do cavalo;
5. placa da carreta;
6. motorista da transportadora;
7. nota fiscal;
8. lacres;
9. medição antes;
10. início da descarga;
11. fim da descarga;
12. medição depois;
13. divergência;
14. aprovação.

### Abastecimento externo

Fluxo mobile:

1. selecionar veículo;
2. selecionar posto;
3. informar litros;
4. informar valor;
5. informar odômetro;
6. fotografar cupom;
7. confirmar localização;
8. enviar;
9. exibir status em análise ou aprovado.

### Imprevistos

Toda tela de abastecimento deve ter botão:

**Registrar imprevisto**

Tipos rápidos:

- cupom perdido;
- bomba com defeito;
- odômetro incorreto;
- divergência de litros;
- veículo errado;
- posto não cadastrado;
- emergência;
- falha de internet;
- vazamento;
- outro.

---

## 11. Responsividade

Testar obrigatoriamente:

- 320px;
- 360px;
- 390px;
- 430px;
- 768px;
- 1024px;
- 1280px;
- 1440px;
- 1728px;
- 1920px;
- 2560px.

### Desktop

- dashboards densos;
- sidebar completa;
- tabelas avançadas;
- gráficos lado a lado;
- painéis laterais.

### Tablet

- sidebar colapsável;
- cards em duas colunas;
- tabelas reduzidas;
- filtros em drawer.

### Mobile

- navegação inferior ou menu compacto;
- foco em tarefas;
- sem tabelas gigantes;
- cards e listas;
- botões grandes;
- inputs de fácil toque;
- câmera;
- offline;
- feedback claro.

Touch target mínimo no mobile: 44px.

---

## 12. Mobile para abastecedores

O abastecedor pode estar com luva, no pátio, no sol, com internet ruim e com fila de veículos.

O app/PWA deve ser:

- rápido;
- com poucos toques;
- legível no sol;
- tolerante a erro;
- offline-first;
- com autosave;
- com protocolo de confirmação;
- com histórico do dia.

### Tela inicial

Mostrar:

- abastecimentos hoje;
- litros hoje;
- pendências de sincronização;
- tanques autorizados;
- botão “Novo abastecimento”;
- botão “Registrar imprevisto”.

### Sem internet

- salvar localmente;
- mostrar “pendente de envio”;
- permitir revisar;
- sincronizar depois;
- impedir duplicidade.

---

## 13. Remover aparência de IA

### Sinais ruins

- textos genéricos;
- cards idênticos;
- ícones sem padrão;
- botões desalinhados;
- sombras exageradas;
- gráficos sem pergunta de negócio;
- mockups com nomes irreais;
- tabelas vazias;
- falta de estados reais.

### Como dar alma

- dados realistas;
- identidade própria;
- microcopy operacional;
- alertas úteis;
- timeline de decisões;
- sensação de central de controle;
- responsáveis;
- evidências;
- custo, risco e impacto;
- status claros;
- personalidade de marca.

### Microcopy

Ruim: “Operação gerenciada com eficiência.”  
Bom: “3 viagens atrasadas precisam de ação nos próximos 12 minutos.”

Ruim: “Abastecimento registrado com sucesso.”  
Bom: “Abastecimento #AB-2048 confirmado. Estoque do Tanque Diesel S10 atualizado para 8.420 L.”

---

## 14. Dados simulados para demo

Criar seed visual com:

- 3 filiais;
- 36 veículos;
- 74 motoristas;
- 12 clientes;
- 18 rotas;
- 150 viagens;
- 220 abastecimentos;
- 5 tanques;
- 3 bombas;
- 8 entregas por carreta;
- 35 ocorrências;
- 24 manutenções;
- 12 documentos vencendo;
- 9 abastecimentos em revisão;
- 4 divergências críticas;
- 6 contratos.

Usar cidades reais do interior de SP quando fizer sentido:

- Jundiaí;
- Louveira;
- Itupeva;
- Campinas;
- Vinhedo;
- Cajamar;
- Sorocaba;
- Indaiatuba.

Evitar “Cliente Teste”, “Motorista 1”, “Veículo ABC”.

---

## 15. Telas prioritárias

1. Login com marca.
2. Onboarding de usuário.
3. Dashboard executivo.
4. Operação do dia.
5. Frota.
6. Abastecimento.
7. Entrega por carreta.
8. Ocorrências.
9. Administração de cargos e permissões.
10. Relatórios.

---

## 16. Tabelas e cards

### Tabelas

Requisitos:

- busca;
- filtros salvos;
- colunas configuráveis;
- densidade normal/compacta;
- seleção em massa;
- ações rápidas;
- status visual;
- paginação;
- exportação;
- drawer de detalhes.

No mobile, tabelas viram cards.

### Cards mobile

Exemplo de abastecimento:

- placa;
- litros;
- valor;
- posto/tanque;
- status;
- horário;
- responsável;
- botão de detalhes.

---

## 17. Acessibilidade

Meta: WCAG 2.2 AA.

Requisitos:

- contraste adequado;
- foco visível;
- navegação por teclado;
- labels corretos;
- mensagens de erro claras;
- não depender apenas de cor;
- textos legíveis;
- estados de loading;
- skeletons;
- aria-label em ícones;
- suporte a leitores de tela em fluxos críticos.

Critério: login, dashboard, formulário de abastecimento e tabela de viagens precisam passar em auditoria básica.

---

## 18. Motion design

Movimento deve orientar, não enfeitar.

Permitido:

- transição de sidebar;
- expansão de card;
- skeleton loading;
- confirmação de ação;
- troca de status;
- atualização em tempo real.

Evitar:

- animações longas;
- efeitos chamativos;
- loading sem motivo;
- animação que atrapalha campo.

---

## 19. Performance frontend

Metas:

- login rápido;
- dashboard com skeleton;
- tabelas virtualizadas quando necessário;
- imagens otimizadas;
- bundle controlado;
- lazy loading de gráficos pesados;
- evitar render desnecessário.

Experiência de campo precisa parecer instantânea.

---

## 20. Frontend por perfil

Não basta esconder item visualmente.

Fazer:

- layout por perfil;
- menu por permissão;
- cards por escopo;
- rotas protegidas;
- mensagens elegantes de acesso negado;
- troca de filial quando permitido.

Não fazer:

- dashboard igual para todos;
- rota aberta sem permissão;
- card financeiro para quem não tem acesso;
- tabela com dados sensíveis sem necessidade.

---

## 21. PWA agora, app nativo depois

### Fase 1

PWA responsivo no Next.js para:

- abastecedor;
- motorista;
- supervisor de campo.

### Fase 2

React Native/Expo para app nativo quando houver necessidade de:

- câmera mais robusta;
- offline forte;
- push notification;
- geolocalização contínua;
- QR/NFC;
- melhor performance em campo.

---

## 22. Relatórios visuais

Relatórios devem parecer documentos empresariais.

Requisitos:

- logo do sistema;
- logo da empresa cliente opcional;
- product by Vstack-solutions no rodapé;
- período;
- filtros aplicados;
- responsável pela emissão;
- data/hora;
- resumo executivo;
- tabelas limpas;
- gráficos com legenda;
- assinatura digital futura.

---

## 23. Sprints sugeridas

### Sprint 1 — Identidade e base

- criar logo;
- criar paleta;
- criar tipografia;
- criar tokens;
- redesenhar login;
- aplicar product by Vstack-solutions;
- criar layout principal.

### Sprint 2 — Design system e navegação

- componentes base;
- sidebar por perfil;
- topbar;
- command menu;
- cards premium;
- status pills;
- tabelas;
- modais;
- drawers.

### Sprint 3 — Dashboard executivo

- visão CEO;
- KPIs;
- alertas;
- cards de decisão;
- custo, risco e operação.

### Sprint 4 — Abastecimento desktop

- tanques;
- entregas por carreta;
- abastecimentos internos;
- abastecimentos externos;
- divergências;
- aprovações.

### Sprint 5 — Mobile do abastecedor

- home;
- novo abastecimento interno;
- evidências;
- offline;
- sincronização;
- imprevistos.

### Sprint 6 — Responsividade e polimento

- testar breakpoints;
- melhorar microcopy;
- corrigir densidade;
- revisar acessibilidade;
- revisar performance;
- preparar demo.

---

## 24. Critérios de aceite

A frente visual/frontend estará pronta quando:

- existir logo funcional;
- existir paleta consistente;
- existir design system básico;
- telas não parecerem template genérico;
- dashboard do dono for apresentável;
- dashboard de abastecimento for apresentável;
- fluxo mobile de abastecedor estiver utilizável;
- sistema responder bem de 320px a 2560px;
- menu mudar conforme cargo;
- login tiver identidade;
- product by Vstack-solutions estiver aplicado com elegância;
- dados simulados parecerem reais;
- telas tiverem estados vazio, loading, erro e sucesso;
- a interface conseguir ser demonstrada sem pedir desculpas pelo visual.

---

## 25. Roteiro de demo

1. Login com marca e assinatura Vstack.
2. Dashboard do dono mostrando custo, risco e operação.
3. Abastecimento com entrega por carreta e estoque atualizado.
4. Mobile do abastecedor registrando saída de combustível.
5. Auditoria mostrando quem fez, quando fez, evidências e impacto financeiro.

Frase guia:

> O usuário deve sentir que saiu do WhatsApp e entrou numa central de comando profissional.

---

## Referências técnicas

- Next.js App Router: https://nextjs.org/docs/app
- Tailwind responsive design: https://tailwindcss.com/docs/responsive-design
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- React Native / Expo: https://reactnative.dev/docs/environment-setup

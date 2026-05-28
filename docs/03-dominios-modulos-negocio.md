# 03 — Domínios e Módulos de Negócio

## Objetivo

Definir os módulos funcionais da plataforma como domínios de negócio. Cada domínio deve ter dono, regras, dados, telas, indicadores e permissões próprias.

## Visão geral dos domínios

1. Gestão de Empresas e Filiais
2. Usuários, Cargos e Permissões
3. Operação e Viagens
4. Frota
5. Motoristas e Colaboradores
6. Passageiros
7. Clientes e Contratos
8. Abastecimento
9. Manutenção
10. Documentos
11. Ocorrências
12. Financeiro
13. BI e Analytics
14. Notificações
15. Auditoria
16. IA Operacional

## 1. Gestão de Empresas e Filiais

### Objetivo

Permitir que a plataforma atenda várias empresas, filiais, bases e operações.

### Entidades

- empresa/tenant;
- filial;
- base operacional;
- unidade de negócio;
- centro de custo.

### Valor comercial

Permite vender para empresas pequenas e crescer com grupos maiores.

## 2. Usuários, Cargos e Permissões

### Objetivo

Controlar quem vê, cria, edita, aprova, exporta ou exclui informações.

### Entidades

- usuário;
- colaborador;
- cargo;
- departamento;
- papel;
- permissão;
- grupo de permissão;
- política de acesso.

### Valor comercial

Evita vazamento de informações entre setores e cria uma experiência personalizada por cargo.

## 3. Operação e Viagens

### Objetivo

Ser o coração do MVP.

### Entidades

- viagem;
- rota;
- linha;
- ponto de embarque;
- escala;
- status operacional;
- veículo alocado;
- motorista alocado;
- passageiros vinculados;
- check-in/check-out;
- ocorrência vinculada.

### Indicadores

- viagens do dia;
- viagens em andamento;
- atrasos;
- viagens canceladas;
- ocupação;
- motoristas escalados;
- veículos usados;
- ocorrências por viagem;
- SLA por cliente.

## 4. Frota

### Objetivo

Controlar todos os veículos e sua condição operacional.

### Entidades

- veículo;
- placa;
- tipo;
- capacidade;
- documentação;
- hodômetro;
- status;
- disponibilidade;
- histórico;
- custo acumulado.

### Indicadores

- veículos ativos;
- veículos parados;
- veículos em manutenção;
- disponibilidade da frota;
- custo por veículo;
- consumo médio;
- idade da frota.

## 5. Motoristas e Colaboradores

### Objetivo

Controlar pessoas operacionais, cargos, documentos, jornada e desempenho.

### Entidades

- colaborador;
- motorista;
- CNH;
- exames;
- treinamentos;
- escalas;
- disponibilidade;
- ocorrências;
- histórico de viagens.

### Indicadores

- motoristas disponíveis;
- motoristas escalados;
- faltas;
- atrasos;
- ocorrências por motorista;
- desempenho por período.

## 6. Passageiros

### Objetivo

Controlar pessoas transportadas, presença, reservas e vínculo com linhas.

### Entidades

- passageiro;
- cliente contratante;
- ponto de embarque;
- linha;
- reserva;
- presença;
- absenteísmo.

### Indicadores

- passageiros ativos;
- ocupação por rota;
- absenteísmo;
- embarques confirmados;
- lotação crítica.

## 7. Clientes e Contratos

### Objetivo

Organizar relação comercial e operacional com clientes.

### Entidades

- cliente;
- contrato;
- vigência;
- rota contratada;
- SLA;
- valores;
- reajuste;
- contatos;
- documentos comerciais.

### Indicadores

- clientes ativos;
- contratos vencendo;
- receita prevista;
- SLA por cliente;
- margem por contrato.

## 8. Abastecimento

### Objetivo

Controlar combustível, custo e consumo por veículo, motorista, rota e período.

### Entidades

- abastecimento;
- veículo;
- motorista;
- posto;
- combustível;
- litros;
- valor total;
- preço por litro;
- hodômetro;
- foto do cupom;
- centro de custo;
- divergência.

### Indicadores

- custo total de combustível;
- km/l por veículo;
- custo por km;
- abastecimento por motorista;
- ranking de maior consumo;
- abastecimentos suspeitos;
- divergência de hodômetro;
- consumo fora da média.

### Valor comercial

Esse módulo é um dos mais fáceis de vender para donos de empresas, porque combustível é custo direto e visível.

## 9. Manutenção

### Objetivo

Controlar manutenção preventiva, corretiva, pneus, peças e histórico.

### Entidades

- ordem de serviço;
- veículo;
- fornecedor;
- item;
- peça;
- pneu;
- custo;
- status;
- previsão;
- anexos.

### Indicadores

- veículos parados;
- custo de manutenção;
- manutenção preventiva vencida;
- reincidência de defeitos;
- custo por km;
- fornecedores mais usados.

## 10. Documentos

### Objetivo

Evitar vencimentos, multas, risco operacional e esquecimento.

### Entidades

- documento;
- tipo;
- entidade vinculada;
- vencimento;
- anexo;
- alerta;
- responsável.

### Exemplos

- CNH;
- CRLV;
- seguro;
- contrato;
- licença;
- vistoria;
- certificado;
- exame;
- treinamento.

## 11. Ocorrências

### Objetivo

Registrar fatos importantes e criar histórico.

### Tipos

- atraso;
- reclamação;
- avaria;
- falha mecânica;
- ausência de motorista;
- problema com passageiro;
- mudança de rota;
- acidente;
- substituição;
- falha de comunicação;
- abastecimento suspeito.

### Campos essenciais

- tipo;
- gravidade;
- data/hora;
- responsável;
- veículo;
- motorista;
- cliente;
- viagem;
- descrição;
- anexos;
- status;
- ação tomada;
- conclusão.

## 12. Financeiro

### Objetivo

Conectar operação com resultado econômico.

### Entidades

- contas a pagar;
- contas a receber;
- receita por contrato;
- despesa por veículo;
- despesa por rota;
- centro de custo;
- faturamento;
- margem.

### Indicadores

- receita por cliente;
- custo por rota;
- margem por contrato;
- custo por viagem;
- inadimplência;
- despesas por categoria.

## 13. BI e Analytics

### Objetivo

Transformar dados em decisão.

### Saídas

- dashboard executivo;
- dashboard operacional;
- dashboard de frota;
- dashboard financeiro;
- dashboard de abastecimento;
- dashboard de manutenção;
- relatórios exportáveis;
- alertas inteligentes.

## 14. Notificações

### Objetivo

Avisar a pessoa certa, no momento certo, sobre o evento certo.

### Canais

- dentro do sistema;
- e-mail;
- WhatsApp Business, em fase futura;
- push mobile;
- webhook.

## 15. Auditoria

### Objetivo

Preservar confiança, rastreabilidade e segurança.

### Registros

- login;
- criação;
- edição;
- exclusão;
- exportação;
- alteração de permissão;
- visualização de dados sensíveis;
- tentativa negada.

## 16. IA Operacional

### Objetivo

Depois do sistema gerar dados confiáveis, usar IA para sugerir ações.

### Casos futuros

- resumo de ocorrência;
- alerta de consumo anormal;
- previsão de manutenção;
- previsão de atraso;
- análise de rentabilidade;
- copiloto do dono;
- assistente da operação;
- consulta a histórico por linguagem natural.

## Classificação DDD dos Subdomínios

| Domínio | Tipo | Justificativa |
|---|---|---|
| Operação e Viagens | Core | Diferenciação competitiva central — regras únicas do negócio |
| Frota | Core | Controle de disponibilidade e custo é diferencial da plataforma |
| Abastecimento | Core | Detecção de anomalia e custo por km é proposta de valor |
| Identidade e Acesso | Genérico | Comprar/usar OSS (Auth.js, Keycloak, Lucia) ou implementar uma vez |
| Notificações | Genérico | Usar provedor externo + wrapper interno |
| Manutenção | Suporte | Importante mas não diferencia produto |
| Documentos | Suporte | Gerenciamento de arquivos com alertas |
| Financeiro | Suporte | Importante mas não é core do fretamento |
| CRM e Contratos | Suporte | Apoia o negócio, não é o negócio |
| IA Operacional | Core futuro | Copiloto, anomalias e predição serão diferencial comercial |

**Regra:** Investir tempo e maturidade técnica proporcionalmente ao tipo. Core merece design mais cuidadoso, testes mais profundos, menos dependência de libraries externas.

## Invariantes de Domínio por Módulo

### Operação e Viagens
- Uma viagem não pode ser iniciada sem veículo e motorista confirmados.
- Uma viagem não pode ter dois motoristas ativos simultaneamente.
- Uma viagem cancelada não pode retornar ao estado ativo sem novo registro.
- Status de viagem segue máquina de estados — transição inválida deve lançar exceção de domínio.

### Frota
- Um veículo em manutenção não pode ser alocado em viagem.
- Hodômetro nunca pode decrementar entre dois registros consecutivos do mesmo veículo.
- Veículo com documento vencido deve ser bloqueado automaticamente para novas viagens.

### Abastecimento
- Litros devem ser positivos e hodômetro maior que o último registro do veículo.
- Anomalia deve ser criada automaticamente quando km/l estiver mais de 20% abaixo da média histórica do veículo.
- Abastecimento sem comprovante gera flag automático.

### Motoristas
- CNH vencida bloqueia alocação em nova viagem.
- Motorista com ocorrência grave aberta não pode ser escalado sem aprovação de supervisor.

### Documentos
- Alerta de vencimento deve ser gerado com 60, 30 e 7 dias de antecedência.
- Documento vencido de veículo bloqueia o veículo automaticamente para novas alocações.

## Anti-Corruption Layer para Integrações Futuras

Integrações externas devem ter ACL — camada que traduz contratos externos para o modelo interno.

| Integração | ACL Responsabilidade |
|---|---|
| API de Mapas | Traduz resposta de geocoding para `RoutePoint` interno |
| WhatsApp Business | Traduz mensagens para `NotificationEvent` interno |
| Rastreador GPS | Traduz telemetria para `VehicleLocationEvent` interno |
| ERP Financeiro | Traduz lançamentos externos para `FinancialEntry` interno |
| OCR de Documentos | Traduz resultado para `DocumentData` interno |

A ACL garante que mudança no contrato externo não propague para o domínio.

## MVP recomendado

Entram primeiro:

- empresas/filiais;
- usuários/cargos/permissões;
- operação/viagens;
- frota;
- motoristas;
- clientes;
- ocorrências;
- abastecimento;
- documentos;
- dashboards por cargo;
- auditoria básica.

Ficam para fase posterior:

- financeiro completo;
- CRM completo;
- app passageiro;
- app motorista;
- telemetria real;
- IA preditiva;
- contratos avançados.

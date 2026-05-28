# 08 — Segurança, LGPD e Governança

## Objetivo

Definir um padrão de segurança compatível com um produto SaaS B2B que lida com dados pessoais, operação de transporte, documentos, rotas, motoristas, passageiros, clientes, veículos e informações financeiras.

## Princípio

Segurança não é um módulo. É uma camada em todo o produto.

## Referências

- LGPD — Lei 13.709/2018
- ANPD — Guia orientativo de segurança da informação para agentes de tratamento de pequeno porte
- OWASP ASVS 5.0
- OWASP Top 10
- práticas de SaaS multiempresa

## Dados sensíveis no contexto do sistema

O sistema pode tratar:

- nome;
- telefone;
- e-mail;
- CPF/RG, se usado;
- CNH;
- documentos;
- endereço;
- localização;
- vínculo com empresa;
- jornada;
- ocorrências;
- fotos;
- documentos de veículos;
- dados financeiros;
- dados contratuais.

## Classificação de dados

### Público

- informações institucionais;
- materiais comerciais;
- documentação pública.

### Interno

- dados operacionais não sensíveis;
- status de veículos;
- rotas sem passageiros;
- indicadores agregados.

### Confidencial

- dados de clientes;
- dados de colaboradores;
- contratos;
- documentos;
- relatórios financeiros;
- ocorrências.

### Sensível/Crítico

- documentos pessoais;
- localização individual;
- dados de passageiros;
- dados financeiros detalhados;
- permissões;
- auditoria;
- incidentes.

## Controles obrigatórios

### Autenticação

- hash forte de senha;
- refresh token rotativo;
- expiração de sessão;
- revogação;
- bloqueio por tentativas;
- MFA para cargos altos;
- MFA obrigatório para CEO, dono, gerente financeiro e administradores.

### Autorização

- RBAC;
- ABAC;
- tenant obrigatório;
- escopo por filial;
- escopo por departamento;
- políticas para dados sensíveis;
- proteção no backend, não apenas no frontend.

### Auditoria

Auditar:

- login;
- logout;
- falha de login;
- alteração de senha;
- alteração de cargo;
- alteração de permissão;
- visualização de documento sensível;
- exportação;
- exclusão;
- edição financeira;
- edição de abastecimento antigo;
- fechamento de ocorrência crítica.

### Proteção de dados

- TLS em produção;
- criptografia em repouso para anexos;
- mascaramento de documentos;
- dados sensíveis fora de logs;
- segregação por tenant;
- backup criptografado;
- política de retenção;
- controle de exportação.

### Segurança de API

- rate limiting;
- CORS restrito;
- validação de entrada;
- validação de schema;
- proteção contra injection;
- proteção contra IDOR;
- limites de payload;
- logs de erro sem segredo;
- headers de segurança.

### Arquivos

- upload com validação;
- limite de tamanho;
- antivírus em fase madura;
- URLs assinadas;
- permissão por entidade;
- versionamento;
- trilha de acesso.

## LGPD na prática do produto

### Minimização

Coletar somente o necessário para operação.

### Finalidade

Cada dado deve ter motivo claro.

### Acesso

Usuário deve ver apenas dados compatíveis com função.

### Transparência

Empresas clientes precisam entender que dados são tratados, armazenados e protegidos.

### Segurança

Medidas técnicas e administrativas desde o MVP.

### Prevenção

Alertas, auditoria, backup, controle de acesso e revisão de permissões.

### Responsabilização

Manter registro das decisões, acessos e alterações.

## Matriz de risco

| Risco | Impacto | Controle |
|---|---|---|
| Vazamento entre empresas | Muito alto | tenant_id, RLS futura, testes, auditoria |
| Motorista ver dados financeiros | Alto | RBAC/ABAC |
| Operador exportar dados sensíveis | Alto | permissão específica e auditoria |
| Documento pessoal exposto | Alto | arquivo protegido e URL assinada |
| Conta compartilhada | Alto | login individual, política e MFA |
| Alteração indevida de abastecimento | Médio/alto | trilha de auditoria e aprovação |
| Exclusão de ocorrência | Alto | soft delete e permissão restrita |
| Ataque por força bruta | Médio | rate limit e bloqueio |
| Falha de backup | Alto | backup testado e criptografado |

## Política de permissões

Nenhuma permissão crítica deve ser concedida automaticamente sem aprovação.

Permissões críticas:

- administrar usuários;
- administrar cargos;
- ver financeiro;
- exportar relatórios;
- excluir registros;
- ver auditoria;
- ver documentos sensíveis;
- editar registros antigos;
- alterar contrato;
- alterar valor financeiro.

## Segurança no desenvolvimento

Obrigatório:

- code review;
- análise de dependências;
- lint;
- testes;
- secrets fora do repositório;
- ambientes separados;
- logs estruturados;
- revisão de permissões por release.

## Segurança operacional

Obrigatório:

- backup diário;
- restore testado;
- monitoramento;
- alertas de erro;
- alertas de login suspeito;
- revisão periódica de usuários;
- política de desligamento de colaborador;
- inventário de dados.

## Incidentes

Criar fluxo para:

1. identificar;
2. conter;
3. avaliar impacto;
4. corrigir;
5. registrar;
6. comunicar quando necessário;
7. prevenir recorrência.

## Threat Modeling — STRIDE por Módulo Crítico

Para cada módulo core, executar análise STRIDE antes do desenvolvimento.

### Módulo de Autenticação

| Ameaça | Vetor | Controle |
|---|---|---|
| Spoofing | Credential stuffing com lista vazada | Rate limiting + lockout + MFA |
| Tampering | JWT manipulado sem invalidação | Assinatura com chave rotacionável, refresh revogável |
| Repudiation | Login negado sem registro | Auditoria imutável de todos os eventos de auth |
| Info Disclosure | Enumeration de usuários via resposta diferente | Resposta idêntica para usuário inválido e senha errada |
| Denial of Service | Flood no endpoint de login | Rate limit por IP e por tenant |
| Elevation | Refresh token reutilizado após logout | Refresh token rotation + reuse detection |

### Módulo de Abastecimento

| Ameaça | Vetor | Controle |
|---|---|---|
| Tampering | Edição retroativa de abastecimento | Permissão restrita + auditoria com before/after |
| Info Disclosure | Motorista vê dados financeiros de outros | RBAC + ABAC por tenant e cargo |
| Repudiation | Abastecimento sem responsável identificado | Campo `created_by` obrigatório + auditoria |
| Elevation | Abastecimento criado sem vincular ao próprio veículo | Validar que o motorista tem permissão sobre o veículo |

## LGPD — Base Legal por Tipo de Dado

Para cada categoria de dado pessoal tratado, identificar a base legal (Art. 7º LGPD):

| Dado | Base Legal | Retenção |
|---|---|---|
| Nome, CPF, telefone do motorista | Contrato (execução) | Vigência + 5 anos (trabalhista) |
| CNH e exames | Obrigação legal (CLT, ANTT) | Vigência + 5 anos |
| Localização em viagem | Contrato + legítimo interesse (segurança) | 12 meses |
| Foto de comprovante de abastecimento | Contrato | 5 anos (fiscal) |
| Dados do passageiro | Contrato com empresa contratante | Vigência do contrato + 1 ano |
| Logs de auditoria com user_id | Legítimo interesse (segurança) | 2 anos |
| Dados de acesso e sessão | Legítimo interesse (segurança) | 90 dias |

Cada base legal deve ser documentada no Registro de Atividades de Tratamento (RoPA).

## RoPA — Registro de Atividades de Tratamento

Obrigação LGPD para controladores. Manter planilha/sistema com:

- nome da atividade de tratamento;
- finalidade;
- base legal;
- categorias de dados;
- categorias de titulares;
- compartilhamento com terceiros;
- medidas de segurança;
- prazo de retenção.

Revisar RoPA a cada nova funcionalidade que coleta ou processa dados pessoais.

## DPIA — Relatório de Impacto à Proteção de Dados

Obrigatório quando o sistema processar:
- localização de pessoas em tempo real;
- dados de passageiros em grande escala;
- decisões automatizadas que afetam motoristas (anomalia, bloqueio).

O DPIA deve incluir necessidade e proporcionalidade, riscos identificados e medidas mitigadoras. Consultar ANPD para processos de alto risco.

## DPO — Encarregado de Dados

Nomear DPO (pode ser interno ou terceirizado). O DPO deve:
- ser ponto de contato com a ANPD;
- responder a solicitações de titulares;
- ser comunicado sobre incidentes;
- revisar novos tratamentos de alto risco.

Publicar canal de contato do DPO na política de privacidade da plataforma.

## Direitos dos Titulares — Workflows Implementáveis

| Direito | Prazo | Implementação |
|---|---|---|
| Acesso | 15 dias | Endpoint autenticado retorna dados do titular |
| Retificação | 15 dias | Formulário de correção com auditoria |
| Eliminação | 15 dias | Soft delete + anonimização de campos pessoais (manter operacional sem PII) |
| Portabilidade | 15 dias | Export JSON/CSV estruturado dos dados do titular |
| Revogação de consentimento | Imediato | Endpoint de opt-out com confirmação |
| Oposição a decisão automatizada | 15 dias | Revisão humana de bloqueio automático de motorista |

## Hash de Senhas — Especificação

Nunca usar MD5, SHA-1, SHA-256 ou bcrypt sem custo adequado para senhas.

Algoritmo obrigatório: **Argon2id** com parâmetros mínimos:
- `memory_cost`: 64 MB
- `time_cost`: 3 iterações
- `parallelism`: 4
- `salt_length`: 16 bytes

Alternativa aceitável: bcrypt com `cost` ≥ 12.

Verificação: medir tempo de hash em produção — deve levar 100-300ms por operação para dificultar brute force.

## JWT — Boas Práticas

- Access token: TTL de 15 minutos.
- Refresh token: TTL de 7 dias, rotativo a cada uso, com `reuse detection` (revogar toda a família se refresh antigo for reutilizado).
- Algoritmo: RS256 (assimétrico) ou HS256 com chave longa gerada via CSPRNG. Nunca `alg: none`.
- Armazenar refresh token como `hash` no banco, não em plain text.
- Incluir `kid` no header para rotação de chave sem downtime.
- Revogar todos os tokens ativos no logout e no reset de senha.

## Step-Up Authentication

Para ações de alto risco, exigir re-autenticação ou segundo fator mesmo com sessão ativa:

- Alterar permissões de usuário.
- Exportar dados sensíveis (financeiro, passageiros, pessoal).
- Alterar cargo.
- Visualizar documentos pessoais de terceiros.
- Editar abastecimento retroativo.
- Fechar ocorrência grave.

Implementar como middleware que verifica timestamp da última autenticação forte e exige nova confirmação após 30 minutos de inatividade para essas ações.

## Gestão de Secrets

- Nunca em código, arquivos `.env` commitados, logs ou resposta de API.
- Usar gestor de secrets desde o MVP: Doppler (low-ops), AWS Secrets Manager, HashiCorp Vault.
- Rotacionar segredos críticos (JWT signing key, DB password) a cada 90 dias.
- Auditar acesso a secrets.
- CI/CD não deve ter secrets hardcoded — usar ambiente seguro do provedor de CI.
- Secret scanning no repositório: `gitleaks` ou GitHub Advanced Security.

## Supply Chain Security

- SAST (análise estática): Semgrep com ruleset OWASP para TypeScript/Node/Python.
- SCA (análise de dependências): Snyk ou Dependabot com fail em CVE crítico.
- SBOM: gerar Software Bill of Materials em cada build (formato CycloneDX ou SPDX).
- Container scan: Trivy em toda imagem antes do push.
- Lockfiles obrigatórios (`package-lock.json`, `yarn.lock`, `poetry.lock`) no repositório.

## WAF e Proteção DDoS

Em produção, proteger o frontend e API com:
- WAF (Web Application Firewall): Cloudflare WAF (recomendado), AWS WAF ou equivalente.
- Rate limiting na borda: rejeitar requisições excessivas antes de chegar à aplicação.
- Bot protection: bloquear scrapers e credential stuffing bots.
- DDoS protection: Cloudflare ou serviço de CDN com proteção L3/L4/L7.

Regras WAF mínimas:
- Bloquear `UNION SELECT`, `--`, `<script>`, `../` em parâmetros.
- Limitar tamanho de body (máximo 10MB para upload, 100KB para JSON).
- Bloquear origens suspeitas conhecidas.

## Incidente — Notificação à ANPD

Se ocorrer incidente com dados pessoais de risco relevante:
- Notificar ANPD em até 72 horas após ciência do incidente.
- Notificar titulares afetados quando o risco for alto.
- Registrar: o quê aconteceu, dados afetados, número de titulares, medidas tomadas.
- Manter evidências e relatório de postmortem.

## Conclusão

A segurança deve ser vendida como diferencial: empresas de transporte lidam com dados de pessoas, rotas, horários, documentos e contratos. O sistema precisa proteger isso desde a primeira versão — com Argon2id, JWT rotation, step-up auth, threat modeling STRIDE, base legal LGPD por dado, RoPA mantido e supply chain security no CI. Segurança é camada em todo o produto, não módulo isolado.

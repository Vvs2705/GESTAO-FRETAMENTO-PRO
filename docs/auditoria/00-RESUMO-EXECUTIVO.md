# Auditoria Funcional — Resumo Executivo

**Data:** 14/06/2026 · **Escopo:** `apps/web-admin` (frontend) × `apps/api-core` (backend) · **Método:** análise do código-fonte (autoritativa) cruzando cada tela com os endpoints reais da API.

## Diagnóstico em uma frase
> O **backend é real e completo** (CRUD em todos os domínios + auth + RBAC), mas o **frontend é uma casca visual**: nenhuma tela chama a API, 8 páginas são apenas placeholders, os formulários/botões de ação não existem, e o "assistente de viagem" é falso. **A plataforma não executa nenhuma operação de negócio de verdade.**

## Evidência objetiva (medida no código)
- **0 de 16** páginas do painel fazem chamada à API (`useQuery`/`useMutation`/`request()` = **zero**). A única parte que fala com o backend é o **login/logout/sessão** (`auth-context.tsx`).
- **8 páginas são stubs de 1–5 linhas** (sem nada além de um texto): `vehicles`, `drivers`, `clients`, `occurrences`, `documents`, `finance`, `users`, `settings`, `notifications`.
- **Nenhum formulário de cadastro/edição** existe (exceto login). Não há "Criar usuário", "Cadastrar veículo", "Novo motorista" etc.
- Telas "ricas" (`executive` 318 ln, `fuel` 227 ln, `operations`, `fleet`, `trips`) usam **arrays fixos no código** (dados fake), sem fonte real.
- O **wizard de viagem em 8 passos é falso**: passos 3–8 mostram "Simulação…" e o botão "Concluir" apenas dispara um toast e redireciona — **não cria viagem** (`POST /v1/trips` nunca é chamado).

## A boa notícia
A fundação para corrigir **já existe** — o problema é de **integração**, não de reconstrução:
- **API real e abrangente:** 30 controllers, CRUD completo (veículos, motoristas, clientes, viagens, ocorrências, combustível, manutenção, financeiro, usuários, cargos/permissões, rotas, filiais, notificações, auditoria, analytics).
- **Camada de dados pronta:** `lib/api.ts` (`request()` com refresh de token) + `auth-context` (login real testado) + **React Query** já instalado.
- **Design system completo:** `DataTable`, `DrawerPanel`, `ConfirmModal`, `FormField`, `TextInput`, `NumberInput`, `SelectField`, `DatePickerField`, `FileUploadField`, `SearchInput`, `FilterBar`, `Toast`. Tudo que um CRUD precisa já está construído — as páginas só não usam.

## Bloqueadores de produção (críticos — ler antes de tudo)
1. **`NEXT_PUBLIC_API_URL` na Vercel:** sem essa variável, o front chama `http://localhost:3000/v1` (fallback) → em produção **nada funciona**. Tem que apontar para a api-core publicada.
2. **api-core precisa estar publicada e acessível** (deploy ECS) **com CORS** liberando o domínio da Vercel.
3. **MSW** (mocks) só mocka **auth** e roda só em `development` — ao ligar as telas, o ambiente de dev precisa da api-core no ar **ou** mocks ampliados.

## Lacunas estruturais (além de "ligar as telas")
- **`documents`**: a página existe mas **não há controller de documentos no backend**. Decidir: construir o módulo ou remover a página.
- **`routes` (rotas/itinerários)**: o backend tem CRUD completo (`/v1/routes`) mas **não existe tela** — e o wizard de viagem depende disso.
- **`audit`**: endpoint `/v1/audit` existe, sem tela (sugerir expor em Configurações).

## Severidade
| Nível | Itens |
|---|---|
| 🔴 Bloqueador | Integração front↔API inexistente; config de produção (API URL/CORS); wizard de viagem falso; módulos de cadastro (usuários, veículos, motoristas, clientes) vazios |
| 🟠 Alto | Dashboards com dados fake; ocorrências/financeiro/manutenção/notificações sem integração; falta tela de Rotas |
| 🟡 Médio | Documents sem backend; auditoria sem UI; refinamentos de UX/estado vazio/erro/loading |

## Como usar estes arquivos
- **[01-MATRIZ-TELAS-E-GAPS.md](01-MATRIZ-TELAS-E-GAPS.md)** — matriz objetiva tela a tela: estado atual, endpoints disponíveis, o que falta.
- **[02-BACKLOG-CORRECOES.md](02-BACKLOG-CORRECOES.md)** — backlog priorizado com tarefas numeradas (GAP-XXX) e critérios de aceite — é o que o time vai executar.
- **[03-PLAYBOOK-INTEGRACAO.md](03-PLAYBOOK-INTEGRACAO.md)** — o padrão de referência (1 exemplo de CRUD ponta a ponta) para replicar em todos os módulos + correções de infra/config.
